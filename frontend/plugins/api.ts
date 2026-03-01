import { useAuthStore } from "~/stores/auth"

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Track which request has already been retried
  const retryMap = new WeakMap()

  // Create custom $fetch instance with default configurations
  const api = $fetch.create({
    // Set base URL
    baseURL: config.public.apiBase,

    // Include cookies in cross-origin requests
    // Important: refreshToken stored in httpOnly cookie will be sent automatically
    credentials: 'include',
    
    // HOOK: Runs BEFORE every request is sent
    // Receives: { options } - the request configuratio
    onRequest({ options }) {

      // Get auth store instance (contains accessToken, user data)
      const authStore = useAuthStore()
      // Get current access token from store
      const token = authStore.accessToken
      
      // If token exists (user is logged in)
      if (token) {

        // Create new Headers object from existing headers
        const headers = new Headers(options.headers)

        // Add Authorization header with Bearer token
        headers.set('Authorization', `Bearer ${token}`)

        // Replace existing headers with new headers
        options.headers = headers
      }
    },
    
    // HOOK: Runs when request gets an ERROR response (4xx, 5xx)
    // Receives: { response, options }
    // - response = server response object (contains status, data, etc)
    // - options = request configuration that was sent
    async onResponseError({ response, options }) {

      // Check if:
      // 1. Status is 401 (Unauthorized - token expired/invalid)
      // 2. This request hasn't been retried yet (check WeakMap)
      if (response.status === 401 && !retryMap.has(options)) {

        // Mark this request as "already retried" in WeakMap
        // Prevents infinite loop if refresh also fails with 401
        retryMap.set(options, true)
        
        // TRY to refresh the token
        try {

          // Call refresh endpoint to get new accessToken
          // refreshToken is sent automatically via httpOnly cookie (credentials: 'include')
          const data = await $fetch<{ accessToken: string }>('/auth/refresh', {
            method: 'POST',
            baseURL: config.public.apiBase,
            credentials: 'include',
          })
          
          // Get fresh auth store instance
          const authStore = useAuthStore()

          // Save new accessToken to Pinia store
          // Now future requests will use this new token
          authStore.setAccessToken(data.accessToken)
          
          // Create new Headers with the NEW token
          const headers = new Headers(options.headers)
          headers.set('Authorization', `Bearer ${data.accessToken}`)
          options.headers = headers
          
          // RETRY the original failed request with NEW token
          return $fetch(response.url, {
            ...options,
            method: options.method as any,
            headers,
          })
          
        } catch (err) {
          // Refresh token FAILED (either expired or invalid)
          // This means user needs to login again

          // Get auth store
          const authStore = useAuthStore()

          // Logout (clear cookies, reset state)
          authStore.logout()

          // Redirect to login page
          await nuxtApp.runWithContext(() => navigateTo('/login'))
        }
      }
    },
  })

  // Return object to make $api available globally
  return {
    provide: {
      api,
    },
  }
})