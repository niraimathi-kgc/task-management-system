import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      try {
        const { data } = await axios.post('/api/token/refresh/', {
          refresh: refreshToken,
        })
        localStorage.setItem('token', data.access)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
        return api(originalRequest)
      } catch (error) {
        // Refresh token has expired, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/token/', { username, password })
  localStorage.setItem('token', data.access)
  localStorage.setItem('refreshToken', data.refresh)
  return data
}

export const register = async (userData: any) => {
  const { data } = await api.post('/users/', userData)
  return data
}

export const getTasks = async (filters?: any) => {
  const { data } = await api.get('/tasks/', { params: filters })
  return data
}

export const createTask = async (taskData: any) => {
  const { data } = await api.post('/tasks/', taskData)
  return data
}

export const updateTask = async (taskId: number, taskData: any) => {
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

export const createTeam = async (teamData: any) => {
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