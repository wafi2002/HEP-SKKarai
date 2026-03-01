import { jwtDecode } from 'jwt-decode'

type AuthResponse = {
  accessToken: string
  id: string
  username: string
  role: string
}

type DecodedToken = {
  sub: string
  name: string
  username: string
  role: string
  teacherId?: string
  studentId?: string
  iat: number
  exp: number
}

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const { data, error } = await useAPI<{ 
        accessToken: string
        user: any 
      }>('/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (error.value) {
        throw error.value
      }

      if (data.value) {
        // 1. Simpan accessToken dalam store
        authStore.setAccessToken(data.value.accessToken)
        
        // 2. Decode JWT untuk dapat full user info
        const decoded = jwtDecode<DecodedToken>(data.value.accessToken)
        
        // 3. Simpan user data (dari decoded token - lebih lengkap)
        const userData = {
          id: decoded.sub,
          name: decoded.name,
          username: decoded.username,
          role: decoded.role,
          teacherId: decoded.teacherId,
          studentId: decoded.studentId,
        }
        
        authStore.setUser(userData)
        
        // Redirect ke dashboard
        await router.push('/')
      }

      return data.value
    } catch (err: any) {
      throw err
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint (optional - untuk clear refreshToken kat server)
      await useAPI('/auth/logout', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear store & redirect
      authStore.logout()
      await router.push('/auth/login')
    }
  }

  return {
    login,
    logout,
  }
}