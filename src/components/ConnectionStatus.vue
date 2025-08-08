<template>
  <div class="connection-status">
    <q-chip
      :color="statusColor"
      :icon="statusIcon"
      :label="statusText"
      size="sm"
      class="connection-chip"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isConnected: {
    type: Boolean,
    default: false
  },
  isConnecting: {
    type: Boolean,
    default: false
  }
})

const statusColor = computed(() => {
  if (props.isConnecting) return 'warning'
  return props.isConnected ? 'positive' : 'negative'
})

const statusIcon = computed(() => {
  if (props.isConnecting) return 'sync'
  return props.isConnected ? 'wifi' : 'wifi_off'
})

const statusText = computed(() => {
  if (props.isConnecting) return 'Подключение...'
  return props.isConnected ? 'Подключен' : 'Отключен'
})
</script>

<style scoped>
.connection-status {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.connection-chip {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}
</style>



