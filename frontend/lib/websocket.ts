import { Manager } from 'socket.io-client'
import { authService } from './auth'

interface TaskUpdate {
  id: number
  type: 'create' | 'update' | 'delete'
  data: any
}

class WebSocketService {
  private socket: ReturnType<typeof Manager.prototype.socket> | null = null
  private taskUpdateCallbacks: ((data: TaskUpdate) => void)[] = []

  connect() {
    if (typeof window === 'undefined') {
      return // Don't connect during SSR
    }

    if (!this.socket) {
      const token = authService.getAccessToken()
      const manager = new Manager(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/tasks/', {
        transports: ['websocket'],
        auth: {
          token,
        },
      })
      
      this.socket = manager.socket('/')

      this.socket.on('task_update', (data: TaskUpdate) => {
        this.taskUpdateCallbacks.forEach((callback) => callback(data))
      })

      this.socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error)
      })
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  onTaskUpdate(callback: (data: TaskUpdate) => void) {
    this.taskUpdateCallbacks.push(callback)
    return () => {
      this.taskUpdateCallbacks = this.taskUpdateCallbacks.filter(
        (cb) => cb !== callback
      )
    }
  }
}

export const webSocketService = new WebSocketService()
export default webSocketService 