import { io } from 'socket.io-client'
import { config } from '../config/index.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.roomId = null
    this.playerId = null
  }

  // Подключение к серверу
  connect() {
    if (this.socket) return

    this.socket = io(config.API_BASE_URL, config.SOCKET_OPTIONS)

    this.socket.on('connect', () => {
      console.log('Подключен к серверу')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Отключен от сервера')
      this.isConnected = false
    })

    this.socket.on('error', (error) => {
      console.error('Ошибка Socket.io:', error)
    })
  }

  // Присоединение к комнате
  joinRoom(roomId, onRoomJoined, onPlayerJoined, onGameStarted, onResourcesUpdated, onError, onRoomFull, onPlayerLeft) {
    if (!this.socket) {
      this.connect()
    }

    this.roomId = roomId

    // Настройка обработчиков событий
    this.socket.on('room-joined', (data) => {
      console.log('Присоединился к комнате:', data)
      this.playerId = data.playerId
      onRoomJoined && onRoomJoined(data)
    })

    this.socket.on('player-joined', (data) => {
      console.log('Новый игрок присоединился:', data)
      onPlayerJoined && onPlayerJoined(data)
    })

    this.socket.on('game-started', (data) => {
      console.log('Игра началась:', data)
      onGameStarted && onGameStarted(data)
    })

    this.socket.on('resources-updated', (data) => {
      console.log('Ресурсы обновлены:', data)
      onResourcesUpdated && onResourcesUpdated(data)
    })

    this.socket.on('opponent-resources', (data) => {
      console.log('Получены ресурсы противника:', data)
      // Добавляем тип события для правильной обработки
      const eventData = { ...data, type: 'opponent-resources' }
      onResourcesUpdated && onResourcesUpdated(eventData)
    })

    this.socket.on('game-state', (data) => {
      console.log('Получено состояние игры:', data)
      // Передаем данные в обработчик ресурсов для обработки
      const eventData = { ...data, type: 'game-state' }
      onResourcesUpdated && onResourcesUpdated(eventData)
    })

    this.socket.on('room-full', (data) => {
      console.log('Комната полная:', data)
      onRoomFull && onRoomFull(data)
    })

    this.socket.on('player-left', (data) => {
      console.log('Игрок покинул комнату:', data)
      onPlayerLeft && onPlayerLeft(data)
    })

    this.socket.on('error', (error) => {
      console.error('Ошибка от сервера:', error)
      onError && onError(error)
    })

    // Отправляем запрос на присоединение к комнате
    this.socket.emit('join-room', roomId)
  }

  // Обновление ресурсов игрока
  updateResources(resources) {
    if (!this.socket || !this.roomId) {
      console.error('Не подключен к комнате')
      return
    }

    // Проверяем, что ресурсы в правильном формате
    if (!Array.isArray(resources) || resources.length !== 5) {
      console.error('Неверный формат ресурсов')
      return
    }

    // Проверяем диапазон значений
    const validResources = resources.map(resource => {
      const val = parseInt(resource) || 0
      return Math.max(0, Math.min(50, val))
    })

    console.log('SocketService: отправляем ресурсы', {
      roomId: this.roomId,
      playerId: this.playerId,
      resources: validResources
    })

    this.socket.emit('update-resources', {
      roomId: this.roomId,
      resources: validResources
    })
  }

  // Запрос ресурсов противника
  getOpponentResources() {
    if (!this.socket || !this.roomId) {
      console.error('Не подключен к комнате')
      return
    }

    this.socket.emit('get-opponent-resources', this.roomId)
  }

  // Запрос состояния игры
  getGameState() {
    if (!this.socket || !this.roomId) {
      console.error('Не подключен к комнате')
      return
    }

    this.socket.emit('get-game-state', this.roomId)
  }

  // Отключение от комнаты
  leaveRoom() {
    if (this.socket) {
      this.socket.off('room-joined')
      this.socket.off('player-joined')
      this.socket.off('game-started')
      this.socket.off('resources-updated')
      this.socket.off('error')
    }
    this.roomId = null
    this.playerId = null
  }

  // Полное отключение
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.roomId = null
    this.playerId = null
  }
}

// Создаем единственный экземпляр сервиса
const socketService = new SocketService()
export default socketService
