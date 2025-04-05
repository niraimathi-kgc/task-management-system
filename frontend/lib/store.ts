import { create } from 'zustand'
import { getTasks, getTeams } from './api'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  assigned_to: any
  team: any
  due_date: string
  created_at: string
  updated_at: string
}

interface Team {
  id: number
  name: string
  description: string
  members: any[]
  created_at: string
  updated_at: string
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

interface AppState {
  tasks: Task[]
  teams: Team[]
  currentUser: User | null
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  fetchTeams: () => Promise<void>
  setCurrentUser: (user: User | null) => void
  setError: (error: string | null) => void
}

const useStore = create<AppState>((set) => ({
  tasks: [],
  teams: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true })
    try {
      const tasks = await getTasks()
      set({ tasks, error: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTeams: async () => {
    set({ isLoading: true })
    try {
      const teams = await getTeams()
      set({ teams, error: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setError: (error) => set({ error }),
}))

export default useStore 