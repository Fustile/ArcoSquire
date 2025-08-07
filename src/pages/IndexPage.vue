<template>
  <q-page class="flex flex-center">
    <div class="column items-center q-gutter-md" style="min-width: 320px;">
      <div class="text-h4 q-mb-md">ArcoSquire</div>
      <q-btn color="primary" label="Создать комнату" @click="createRoom" class="full-width" />
      <div class="row items-center q-gutter-sm full-width">
        <q-input v-model="roomCode" label="Код комнаты" outlined dense class="col-grow" />
        <q-btn color="secondary" label="Войти" @click="joinRoom" :disable="!roomCode" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roomCode = ref('')
const router = useRouter()

function createRoom() {
  // Генерируем 4-значный hex-код
  const code = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  router.push({ path: `/room/${code}` })
}

function joinRoom() {
  if (roomCode.value) {
    router.push({ path: `/room/${roomCode.value}` })
  }
}
</script>
