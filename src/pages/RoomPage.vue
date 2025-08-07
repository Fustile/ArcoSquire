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
      <div v-else class="text-h6">Ждём второго игрока...</div>
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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import QRCode from 'qrcode'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Код комнаты из маршрута
const roomCode = route.params.code

// Ресурсы игрока (5 чисел)
const playerResources = ref([0, 0, 0, 0, 0])

// Ресурсы противника (5 чисел, только для отображения)
const opponentResources = ref([0, 0, 0, 0, 0])

// Флаг подключения противника (заглушка)
const opponentConnected = ref(false)

// Ссылка на canvas для QR кода
const qrCanvas = ref(null)

const resourceEmojis = ['🏰', '🛡️', '🧱', '🔮', '🐉']

function goHome() {
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

onMounted(() => {
  // Генерируем QR код
  generateQRCode()

  // Здесь будет логика подключения к комнате и получения данных о противнике
  // Пока что для теста можно через setTimeout эмулировать подключение второго игрока
  setTimeout(() => {
    opponentConnected.value = true
    opponentResources.value = [5, 10, 3, 7, 2]
  }, 3000)
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
