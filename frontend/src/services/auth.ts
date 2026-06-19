import { apiClient } from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: any
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  user_type: string
  is_staff: boolean
  is_superuser: boolean
  profile_picture?: string
  phone_number?: string
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/token/', credentials)
    
    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post<User>('/users/register/', data)
    return response.data
  }

  async loginWithGoogle(credential: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/google/', { credential })

    if (response.data.access && response.data.refresh) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/users/me/')
      return response.data
    } catch (error) {
      return null
    }
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}/`, data)
    return response.data
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

export const authService = new AuthService()
