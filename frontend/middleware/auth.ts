// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Check cookie terus - works both server & client side
  const cookie = useCookie('accessToken')

  if (!cookie.value) {
    return navigateTo('/auth/login')
  }

  // Sync ke store kalau belum ada
  if (!authStore.accessToken) {
    authStore.setAccessToken(cookie.value)
  }
})