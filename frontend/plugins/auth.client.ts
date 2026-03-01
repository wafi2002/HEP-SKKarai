export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()

    // Auto load user from localStorage when app starts
    authStore.loadFromStorage()
})