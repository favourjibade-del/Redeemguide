import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

class APIClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const refreshToken = localStorage.getItem('refresh_token')
            const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
              refresh: refreshToken,
            })
            
            localStorage.setItem('access_token', response.data.access)
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`
            
            return this.instance(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/'
            return Promise.reject(refreshError)
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  getClient() {
    return this.instance
  }

  async get<T>(url: string, config?: any) {
    return this.instance.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.instance.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.instance.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.instance.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: any) {
    return this.instance.delete<T>(url, config)
  }
}

export const apiClient = new APIClient()
export default apiClient.getClient()
