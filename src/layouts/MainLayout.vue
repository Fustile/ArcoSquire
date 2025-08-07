<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>ArcoSquire</q-toolbar-title>
        <div class="row q-gutter-xs">
          <q-btn v-for="color in colors" :key="color" :style="btnStyle(color)" flat dense square @click="setBg(color)" />
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'

let colors = ['#ffffff', '#FFD2D2', '#BFD8F6', '#B8F2D0']
const bgColor = ref(colors[0])

function setBg(color) {
  bgColor.value = color
}

function btnStyle(color) {
  return {
    background: color,
    width: '32px',
    height: '32px',
    minWidth: '32px',
    minHeight: '32px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    cursor: 'pointer',
  }
}

watch(bgColor, (val) => {
  document.body.style.background = val
}, { immediate: true })
</script>
