<template>
  <q-page class="flex flex-center">
    <div class="column items-center q-gutter-md" style="min-width: 320px;">
      <div class="text-h4 q-mb-md">ArcoSquire</div>
      <q-btn
        color="primary"
        label="Создать комнату"
        @click="createRoom"
        :loading="creatingRoom"
        class="full-width"
      />
      <div class="row items-center q-gutter-sm full-width">
        <q-input v-model="roomCode" label="Код комнаты" outlined dense class="col-grow" />
        <q-btn
          color="secondary"
          label="Войти"
          @click="joinRoom"
          :disable="!roomCode"
          :loading="joiningRoom"
        />
      </div>
      <div v-if="error" class="text-negative text-center q-mt-sm">{{ error }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import apiService from '../services/apiService'

const roomCode = ref('')
const router = useRouter()
const $q = useQuasar()

const creatingRoom = ref(false)
const joiningRoom = ref(false)
const error = ref('')

async function createRoom() {
  creatingRoom.value = true
  error.value = ''

  try {
    const { roomId } = await apiService.createRoom()
    router.push({ path: `/room/${roomId}` })
  } catch (err) {
    console.error('Ошибка создания комнаты:', err)
    error.value = 'Не удалось создать комнату. Проверьте подключение к серверу.'
    $q.notify({
      type: 'negative',
      message: 'Ошибка создания комнаты',
      position: 'top'
    })
  } finally {
    creatingRoom.value = false
  }
}

async function joinRoom() {
  if (!roomCode.value) return

  joiningRoom.value = true
  error.value = ''

  try {
    // Проверяем существование комнаты
    await apiService.getRoomInfo(roomCode.value)
    router.push({ path: `/room/${roomCode.value}` })
  } catch (err) {
    console.error('Ошибка входа в комнату:', err)
    error.value = 'Комната не найдена или недоступна.'
    $q.notify({
      type: 'negative',
      message: 'Комната не найдена',
      position: 'top'
    })
  } finally {
    joiningRoom.value = false
  }
}
</script>
