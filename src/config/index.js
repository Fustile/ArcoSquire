// Конфигурация приложения
export const config = {
  // URL бекенд сервера
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-backend-domain.com'
    : 'http://localhost:3001',

  // Настройки Socket.io
  SOCKET_OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  },

  // Настройки ресурсов
  RESOURCES: {
    MIN_VALUE: 0,
    MAX_VALUE: 50,
    COUNT: 5
  }
}



