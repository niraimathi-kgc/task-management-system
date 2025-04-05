import axios from 'axios'
import { authService } from './auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = authService.getAccessToken()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshed = await authService.refreshToken()
        if (refreshed) {
          const token = authService.getAccessToken()
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

interface LoginResponse {
  access: string
  refresh: string
}

interface UserData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

interface TaskData {
  title: string
  description: string
  status: string
  priority: string
  assigned_to?: number
  team?: number
  due_date?: string
}

interface TeamData {
  name: string
  description: string
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/token/', { username, password })
  return data
}

export const register = async (userData: UserData) => {
  const { data } = await api.post('/users/', userData)
  return data
}

export const getTasks = async (filters?: Record<string, any>) => {
  const { data } = await api.get('/tasks/', { params: filters })
  return data
}

export const createTask = async (taskData: TaskData) => {
  const { data } = await api.post('/tasks/', taskData)
  return data
}

export const updateTask = async (taskId: number, taskData: Partial<TaskData>) => {
  const { data } = await api.patch(`/tasks/${taskId}/`, taskData)
  return data
}

export const deleteTask = async (taskId: number) => {
  await api.delete(`/tasks/${taskId}/`)
}

export const getTeams = async () => {
  const { data } = await api.get('/teams/')
  return data
}

export const createTeam = async (teamData: TeamData) => {
  const { data } = await api.post('/teams/', teamData)
  return data
}

export const addTeamMember = async (teamId: number, userId: number, role: string) => {
  const { data } = await api.post(`/teams/${teamId}/add_member/`, {
    user_id: userId,
    role,
  })
  return data
}

export default api 