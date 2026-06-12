import { create } from 'zustand'
import { authService, User } from '../services/auth'

export interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  setUser: (user: User | null) => void
  login: (username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string, firstName: string, lastName: string) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login({ username, password })
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false
      })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({
      user: null,
      isAuthenticated: false,
      error: null
    })
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.loginWithGoogle(credential)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Google login failed',
        isLoading: false
      })
      throw error
    }
  },

  register: async (username, email, password, firstName, lastName) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      })
      set({
        user,
        isAuthenticated: false,
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Registration failed',
        isLoading: false
      })
      throw error
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const storedUser = authService.getStoredUser()
      if (storedUser) {
        set({
          user: storedUser,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null })
}))
