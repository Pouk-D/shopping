import { io } from 'socket.io-client'

let socket = null

export default ({ store }, inject) => {
  inject('connectSocket', (token) => {
    if (socket?.connected) return socket
    socket = io(process.env.SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    })
    return socket
  })
  inject('getSocket', () => socket)
  inject('disconnectSocket', () => {
    if (socket) { socket.disconnect(); socket = null }
  })
}
