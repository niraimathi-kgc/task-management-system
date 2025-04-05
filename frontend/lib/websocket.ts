import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  private taskUpdateCallbacks: ((data: any) => void)[] = []

  connect() {
    if (!this.socket) {
      this.socket = io('ws://localhost:8000/ws/tasks/', {
        transports: ['websocket'],
        auth: {
          token: localStorage.getItem('token'),
        },
      })

      this.socket.on('task_update', (data) => {
        this.taskUpdateCallbacks.forEach((callback) => callback(data))
      })
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  onTaskUpdate(callback: (data: any) => void) {
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