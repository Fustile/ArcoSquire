<template>
  <q-page class="column justify-between q-pa-md" style="height: 100vh;">
    <!-- Верхняя четверть: ресурсы противника или ожидание -->
    <div class="row justify-center items-center" style="height: 25vh;">
      <div v-if="opponentConnected" class="row q-gutter-md">
        <q-input
          v-for="(value, idx) in opponentResources"
          :key="idx"
          :model-value="value"
          outlined
          dense
          readonly
          style="width: 100px;"
          input-class="right-align-input no-spin"
          :max="50"
        >
          <template #prepend>
            <span class="emoji-prepend">{{ resourceEmojis[idx] }}</span>
          </template>
        </q-input>
      </div>
      <div v-else class="text-h6">
        Ждём второго игрока...
        <div class="text-caption q-mt-sm">
          Статус: {{ isConnected ? 'Подключен' : 'Отключен' }} |
          Противник: {{ opponentConnected ? 'Подключен' : 'Не подключен' }}
        </div>
      </div>
    </div>

    <!-- Центр: код комнаты и QR код -->
    <div v-if="!opponentConnected" class="column items-center q-gutter-y-md">
      <div class="text-h5 cursor-pointer" @click="copyRoomCode">
        Код комнаты: <span class="text-primary">{{ roomCode }}</span>
        <q-icon name="content_copy" size="sm" class="q-ml-sm" />
      </div>

      <!-- QR код (скрывается при подключении второго игрока) -->
      <div class="qr-container">
        <canvas ref="qrCanvas" width="200" height="200"></canvas>
      </div>
    </div>

    <!-- Нижняя половина: ресурсы игрока -->
    <div class="column items-center" style="height: 40vh;">
      <div class="row q-gutter-md">
        <div v-for="(value, idx) in playerResources" :key="idx" class="column items-center">
          <img src="~assets/arrow2.svg" style="width: 32px; margin-bottom: -24px; transform: rotate(-90deg); cursor: pointer;" @click="changeResource(idx, 5)" />
          <img src="~assets/arrow.svg" style="width: 32px; margin-bottom: 0px; transform: rotate(-90deg); cursor: pointer;" @click="changeResource(idx, 1)" />
          <q-input
            v-model="playerResources[idx]"
            outlined
            dense
            type="number"
            style="width: 100px;"
            :min="0"
            :max="50"
            @update:model-value="onResourceInput(idx)"
            input-class="right-align-input no-spin"
          >
            <template #prepend>
              <span class="emoji-prepend">{{ resourceEmojis[idx] }}</span>
            </template>
          </q-input>
          <img src="~assets/arrow.svg" style="width: 32px; margin-top: 0px; transform: rotate(90deg); cursor: pointer;" @click="changeResource(idx, -1)" />
          <img src="~assets/arrow2.svg" style="width: 32px; margin-top: -24px; transform: rotate(90deg); cursor: pointer;" @click="changeResource(idx, -5)" />
        </div>
      </div>
    </div>

    <!-- Кнопка Домой -->
    <q-btn icon="home" label="Домой" color="primary" flat class="absolute-top-left q-ma-md" @click="goHome" />

    <!-- Компонент статуса подключения -->
    <ConnectionStatus
      :is-connected="isConnected"
      :is-connecting="isConnecting"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import QRCode from 'qrcode'
import socketService from '../services/socketService'
import ConnectionStatus from '../components/ConnectionStatus.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Код комнаты из маршрута
const roomCode = route.params.code

// Ресурсы игрока (5 чисел)
const playerResources = ref([0, 0, 0, 0, 0])

// Ресурсы противника (5 чисел, только для отображения)
const opponentResources = ref([0, 0, 0, 0, 0])

// Флаг подключения противника
const opponentConnected = ref(false)

// Флаг подключения к серверу
const isConnected = ref(false)
const isConnecting = ref(false)

// Ссылка на canvas для QR кода
const qrCanvas = ref(null)

const resourceEmojis = ['🏰', '🛡️', '🧱', '🔮', '🐉']

function goHome() {
  // Отключаемся от комнаты перед переходом
  socketService.leaveRoom()
  router.push('/')
}

function onResourceInput(idx) {
  // Оставляем только цифры и неотрицательные значения, максимум 50
  let val = playerResources.value[idx]
  val = val === '' ? 0 : Math.max(0, Math.min(50, parseInt(val) || 0))
  playerResources.value[idx] = val
}

function changeResource(idx, delta) {
  const newValue = Math.max(0, Math.min(50, (parseInt(playerResources.value[idx]) || 0) + delta))
  playerResources.value[idx] = newValue
}

// Функция копирования кода комнаты в буфер обмена
async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(roomCode)
    showNotification()
  } catch {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = roomCode
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    showNotification()
  }
}

// Функция показа уведомления
function showNotification() {
  $q.notify({
    type: 'positive',
    message: 'Код комнаты скопирован! ✔',
    position: 'top',
    timeout: 2000,
    icon: 'content_copy'
  })
}

// Генерация QR кода
async function generateQRCode() {
  if (!qrCanvas.value) return

  try {
    const roomUrl = `${window.location.origin}/room/${roomCode}`
    await QRCode.toCanvas(qrCanvas.value, roomUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('Ошибка генерации QR кода:', err)
  }
}

// Обработчики Socket.io событий
function onRoomJoined(data) {
  console.log('Успешно присоединился к комнате:', data)
  isConnected.value = true
  isConnecting.value = false

  // Проверяем, есть ли уже другой игрок в комнате
  if (data.players && data.players.length > 1) {
    console.log('В комнате уже есть другой игрок')
    opponentConnected.value = true
    // Запрашиваем ресурсы противника
    requestOpponentResources()
  }

  // Запрашиваем текущее состояние игры
  requestGameState()

  $q.notify({
    type: 'positive',
    message: 'Подключен к комнате',
    position: 'top',
    timeout: 2000
  })
}

function onPlayerJoined(data) {
  console.log('Второй игрок присоединился:', data)
  // Не устанавливаем opponentConnected здесь, ждем game-started
  $q.notify({
    type: 'positive',
    message: 'Второй игрок присоединился!',
    position: 'top',
    timeout: 3000
  })
}

function onGameStarted(data) {
  console.log('Игра началась:', data)
  // Устанавливаем флаг подключения противника только когда игра началась
  opponentConnected.value = true

  // Запрашиваем текущие ресурсы противника
  requestOpponentResources()

  $q.notify({
    type: 'positive',
    message: 'Игра началась!',
    position: 'top',
    timeout: 3000
  })
}

function onResourcesUpdated(data) {
  console.log('Получены обновленные ресурсы:', data)

  // Обновляем ресурсы противника только если они пришли от другого игрока
  // и это не наши собственные ресурсы
  if (data.playerId && data.playerId !== socketService.playerId && data.resources) {
    opponentResources.value = data.resources
    console.log('Обновлены ресурсы противника:', opponentResources.value)
  }

  // Обрабатываем специальное событие с ресурсами противника
  if (data.type === 'opponent-resources' && data.resources) {
    opponentResources.value = data.resources
    console.log('Получены ресурсы противника:', opponentResources.value)
  }

  // Обрабатываем состояние игры
  if (data.type === 'game-state') {
    console.log('Обрабатываем состояние игры:', data)
    if (data.players && data.players.length > 1) {
      opponentConnected.value = true
    }
    if (data.opponentResources) {
      opponentResources.value = data.opponentResources
      console.log('Установлены ресурсы противника из состояния игры:', opponentResources.value)
    }
  }

  // Дополнительная проверка: не обновляем ресурсы противника, если это наши ресурсы
  if (data.playerId === socketService.playerId) {
    console.log('Игнорируем собственные ресурсы в блоке противника')
    return
  }
}

// Функция для запроса текущих ресурсов противника
function requestOpponentResources() {
  socketService.getOpponentResources()
}

// Функция для запроса состояния игры
function requestGameState() {
  socketService.getGameState()
}

// Обработчик полной комнаты
function onRoomFull(data) {
  console.log('Комната полная:', data)
  $q.notify({
    type: 'warning',
    message: 'Комната полная! Перенаправление на главную страницу...',
    position: 'top',
    timeout: 3000
  })

  // Перенаправляем на главную страницу через 3 секунды
  setTimeout(() => {
    router.push('/')
  }, 3000)
}

// Обработчик выхода игрока
function onPlayerLeft(data) {
  console.log('Игрок покинул комнату:', data)
  opponentConnected.value = false
  opponentResources.value = [0, 0, 0, 0, 0]

  $q.notify({
    type: 'warning',
    message: 'Противник покинул комнату',
    position: 'top',
    timeout: 5000
  })
}

function onError(error) {
  console.error('Ошибка от сервера:', error)
  isConnecting.value = false
  $q.notify({
    type: 'negative',
    message: `Ошибка: ${error.message || 'Неизвестная ошибка'}`,
    position: 'top',
    timeout: 5000
  })
}

// Подключение к комнате
function connectToRoom() {
  isConnecting.value = true
  socketService.joinRoom(
    roomCode,
    onRoomJoined,
    onPlayerJoined,
    onGameStarted,
    onResourcesUpdated,
    onError,
    onRoomFull,
    onPlayerLeft
  )
}

// Отслеживаем изменения ресурсов игрока и отправляем на сервер
watch(playerResources, (newResources) => {
  if (isConnected.value) {
    console.log('Отправляем ресурсы на сервер:', newResources)
    socketService.updateResources(newResources)
  }
}, { deep: true })

onMounted(() => {
  // Генерируем QR код
  generateQRCode()

  // Подключаемся к комнате
  connectToRoom()
})

onUnmounted(() => {
  // Отключаемся от комнаты при уходе со страницы
  socketService.leaveRoom()
})
</script>

<style scoped>
:deep(.no-spin)::-webkit-inner-spin-button,
:deep(.no-spin)::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
:deep(.no-spin) {
  -moz-appearance: textfield;
  appearance: textfield;
}
.right-align-input {
  text-align: right;
}
.emoji-prepend {
  font-size: 1.3em;
  margin-right: 4px;
  user-select: none;
}
.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
