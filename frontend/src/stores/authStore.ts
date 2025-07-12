import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  isEmailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, tokens } = response.data.data
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          set({ isLoading: false })
          return response.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        })
        
        // Remove auth header
        delete api.defaults.headers.common['Authorization']
      },

      refreshToken: async () => {
        const { tokens } = get()
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          })
          
          const newAccessToken = response.data.data.accessToken
          
          set({
            tokens: {
              ...tokens,
              accessToken: newAccessToken,
            },
          })
          
          // Update auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/forgot-password', { email })
          set({ isLoading: false })
          return response.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/reset-password', {
            token,
            password,
          })
          set({ isLoading: false })
          return response.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/verify-email', { token })
          set({ isLoading: false })
          return response.data
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },
    }),
    {
      name: 'finviser-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 