import { defineStore } from 'pinia'

export type UserData = {
  id: string
  name: string
  username: string
  role: string
  teacherId?: string
  studentId?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as any | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentTeacherId: (state) => state.user?.teacherId,
  },

  actions: {
    setAccessToken(token: string) {
      this.accessToken = token
      // Simpan dalam cookie supaya tak hilang bila refresh
      const cookie = useCookie('accessToken', { maxAge: 60 * 60 * 24 }) // 1 hari
      cookie.value = token
    },

    setUser(user: any) {
      this.user = user
      // Simpan user data untuk persistence
      if (import.meta.client) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        // Load token dari cookie
        const cookie = useCookie('accessToken')
        if (cookie.value) {
          this.accessToken = cookie.value
        }

        // Load user dari localStorage (code lama kau)
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            this.user = JSON.parse(userStr)
          } catch (error) {
            localStorage.removeItem('user')
          }
        }
      }
    },

    logout() {
      this.accessToken = null
      this.user = null
      
      const cookie = useCookie('accessToken')
      cookie.value = null

      if (import.meta.client) {
        localStorage.removeItem('user')
      }

      // Redirect ke login lepas logout
      return navigateTo('auth/login')
    }
  },
})