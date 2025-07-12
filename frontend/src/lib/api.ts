import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await useAuthStore.getState().refreshToken()
        const { tokens } = useAuthStore.getState()
        
        if (tokens?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: any[]
}

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error.response?.data?.details?.[0]?.msg) {
    return error.response.data.details[0].msg
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
} 