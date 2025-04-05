import { create } from 'zustand'
import { getTasks, getTeams } from './api'

interface Task {
  id: number
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assigned_to: {
    id: number
    username: string
    email: string
  }
  team: {
    id: number
    name: string
  }
  due_date: string
  created_at: string
  updated_at: string
}

interface Team {
  id: number
  name: string
  description: string
  members: {
    id: number
    username: string
    email: string
    role: string
  }[]
  created_at: string
  updated_at: string
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface AppState {
  tasks: Task[]
  teams: Team[]
  currentUser: User | null
  isLoading: boolean
  error: string | null
  selectedTask: Task | null
  selectedTeam: Team | null
  fetchTasks: () => Promise<void>
  fetchTeams: () => Promise<void>
  setCurrentUser: (user: User | null) => void
  setError: (error: string | null) => void
  setSelectedTask: (task: Task | null) => void
  setSelectedTeam: (team: Team | null) => void
  clearStore: () => void
}

const useStore = create<AppState>((set, get) => ({
  tasks: [],
  teams: [],
  currentUser: null,
  isLoading: false,
  error: null,
  selectedTask: null,
  selectedTeam: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await getTasks() as PaginatedResponse<Task>
      set({ tasks: response.results })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTeams: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await getTeams() as PaginatedResponse<Team>
      set({ teams: response.results })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch teams' })
    } finally {
      set({ isLoading: false })
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setError: (error) => set({ error }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
  
  clearStore: () => set({
    tasks: [],
    teams: [],
    currentUser: null,
    error: null,
    selectedTask: null,
    selectedTeam: null,
  }),
}))

export default useStore 