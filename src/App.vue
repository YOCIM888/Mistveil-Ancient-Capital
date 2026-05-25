<template>
  <router-view />
  <audio
    ref="bgMusic"
    src="/audio/旅途.mp3"
    loop
    preload="auto"
  />
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'

const bgMusic = ref(null)
const authStore = useAuthStore()

function playBgMusic() {
  if (bgMusic.value) {
    bgMusic.value.volume = 0.3
    bgMusic.value.play().catch(() => {})
  }
}

provide('playBgMusic', playBgMusic)

onMounted(() => {
  if (authStore.isLoggedIn && bgMusic.value) {
    bgMusic.value.play().catch(() => {})
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a1a2b;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
</style>