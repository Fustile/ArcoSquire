import { config } from '../config/index.js'

const API_BASE_URL = `${config.API_BASE_URL}/api`

class ApiService {
  // Получить список всех комнат
  async getRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Ошибка при получении списка комнат:', error)
      throw error
    }
  }

  // Создать новую комнату
  async createRoom() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error)
      throw error
    }
  }

  // Получить информацию о комнате
  async getRoomInfo(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Ошибка при получении информации о комнате:', error)
      throw error
    }
  }
}

// Создаем единственный экземпляр сервиса
const apiService = new ApiService()
export default apiService
