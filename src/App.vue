<template>
  <router-view />

  <!-- 全局 Toast 提示 -->
  <Transition name="toast">
    <div v-if="toastVisible" class="global-toast">
      {{ toastMessage }}
    </div>
  </Transition>

  <!-- 全局 Confirm 确认弹窗 -->
  <div v-if="confirmVisible" class="global-confirm-overlay" @click.self="confirmCancel">
    <div class="global-confirm-box">
      <div class="global-confirm-title">{{ confirmTitle }}</div>
      <div class="global-confirm-msg">{{ confirmMessage }}</div>
      <div class="global-confirm-btns">
        <button class="global-confirm-btn cancel" @click="confirmCancel">取消</button>
        <button class="global-confirm-btn ok" @click="confirmOk">确定</button>
      </div>
    </div>
  </div>

  <audio
    ref="bgMusic"
    src="/audio/旅途.mp3"
    loop
    preload="auto"
  />
</template>

<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toastVisible, toastMessage, confirmVisible, confirmTitle, confirmMessage, confirmOk, confirmCancel } from '@/utils/toast'
import { musicEnabled } from '@/utils/audioState'

const bgMusic = ref(null)
const authStore = useAuthStore()

function playBgMusic() {
  if (bgMusic.value) {
    bgMusic.value.volume = 0.3
    bgMusic.value.play().catch(() => {})
  }
}

provide('playBgMusic', playBgMusic)

// 监听音乐开关
watch(musicEnabled, (on) => {
  if (!bgMusic.value) return
  if (on) {
    bgMusic.value.play().catch(() => {})
  } else {
    bgMusic.value.pause()
  }
})

onMounted(() => {
  // 从 splash 页携带的音乐授权标志
  if (sessionStorage.getItem('play_bg_music') === '1') {
    sessionStorage.removeItem('play_bg_music')
    if (bgMusic.value) {
      bgMusic.value.volume = 0.3
      bgMusic.value.loop = true
      bgMusic.value.play().catch(() => {})
    }
    return
  }

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

/* 全局 Toast */
.global-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 28px;
  background: rgba(20, 20, 28, 0.95);
  border: 1px solid rgba(180, 160, 120, 0.5);
  border-radius: 16px;
  color: #d8c8a8;
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  z-index: 9999;
  white-space: pre-line;
  text-align: center;
  max-width: 80vw;
  pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

/* 全局 Confirm */
.global-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFadeIn 0.2s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.global-confirm-box {
  width: 88%;
  max-width: 340px;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border: 1px solid rgba(160, 160, 180, 0.3);
  border-radius: 16px;
  padding: 24px 20px 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  text-align: center;
  animation: boxPopIn 0.25s ease;
}

@keyframes boxPopIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.global-confirm-title {
  font-size: 1rem;
  font-weight: 700;
  color: #e0d8c8;
  margin-bottom: 10px;
}

.global-confirm-msg {
  font-size: 0.9rem;
  color: #b0b0b8;
  margin-bottom: 20px;
  line-height: 1.5;
}

.global-confirm-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.global-confirm-btn {
  padding: 10px 28px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.global-confirm-btn.cancel {
  background: rgba(60, 60, 70, 0.8);
  color: #a0a0a8;
  border: 1px solid rgba(140, 140, 150, 0.3);
}

.global-confirm-btn.cancel:hover {
  background: rgba(80, 80, 90, 0.9);
}

.global-confirm-btn.ok {
  background: linear-gradient(135deg, #3a7ab0, #285a80);
  color: #e0f0ff;
  border: 1px solid rgba(130, 200, 240, 0.4);
}

.global-confirm-btn.ok:hover {
  background: linear-gradient(135deg, #4a8ac0, #386a90);
  transform: translateY(-1px);
}
</style>