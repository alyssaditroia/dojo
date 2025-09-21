import { ctfdApiClient, dojoApiClient } from './api'

export interface LoginCredentials {
  name: string  // username or email
  password: string
  remember_me?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  affiliation?: string
  country?: string
  [key: string]: any // For custom fields like 'fields[1]'
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    token: string
    user_id: number
    username: string
    email: string
    type: string
    verified: boolean
    team_id?: number
  }
  errors?: string[]
  message?: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ctfdApiClient.post<AuthResponse>('/auth/login', credentials)

    if (response.success && response.data?.token) {
      ctfdApiClient.setToken(response.data.token)
      dojoApiClient.setToken(response.data.token)  // Set token for dojo API as well
      // Store user data locally
      localStorage.setItem('ctfd_user', JSON.stringify(response.data))
    }

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await ctfdApiClient.post<AuthResponse>('/auth/register', data)

    if (response.success && response.data?.token) {
      ctfdApiClient.setToken(response.data.token)
      dojoApiClient.setToken(response.data.token)  // Set token for dojo API as well
      // Store user data locally
      localStorage.setItem('ctfd_user', JSON.stringify(response.data))
    }

    return response
  }

  async logout(): Promise<{ success: boolean }> {
    ctfdApiClient.clearToken()
    dojoApiClient.clearToken()  // Clear token for dojo API as well
    localStorage.removeItem('ctfd_user')
    return { success: true }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; errors?: string[] }> {
    return ctfdApiClient.post<{ success: boolean; message?: string; errors?: string[] }>('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    return ctfdApiClient.post<{ success: boolean; message?: string }>(`/auth/reset-password/${token}`, { password })
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    return ctfdApiClient.get<{ success: boolean; message?: string }>(`/auth/verify/${token}`)
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('ctfd_token')
  }

  getToken(): string | null {
    return localStorage.getItem('ctfd_token')
  }

  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null
    }

    try {
      const userData = localStorage.getItem('ctfd_user')
      if (userData) {
        return JSON.parse(userData)
      }
      return null
    } catch (error) {
      // If parsing fails, clear the invalid data
      localStorage.removeItem('ctfd_user')
      return null
    }
  }

  async updateProfile(data: any): Promise<{ success: boolean; user?: any }> {
    const response = await ctfdApiClient.patch<{ success: boolean; user?: any }>('/users/me', data)
    if (response.success && response.user) {
      localStorage.setItem('ctfd_user', JSON.stringify(response.user))
    }
    return response
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message?: string }> {
    return ctfdApiClient.post<{ success: boolean; message?: string }>('/users/me/password', data)
  }

  async confirmResetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    return ctfdApiClient.post<{ success: boolean; message?: string }>(`/auth/reset/${token}`, { password })
  }

  async resendVerification(): Promise<{ success: boolean; message?: string }> {
    return ctfdApiClient.post<{ success: boolean; message?: string }>('/auth/resend-verification', {})
  }
}

export const authService = new AuthService()