<template>
  <div class="settings-page">
    <div class="settings-container">
      <h2>⚙️ 古都档案 ⚙️</h2>

      <div class="avatar-section">
        <img
          :src="avatarSrc"
          alt="头像"
          class="avatar-preview"
          @click="triggerAvatarUpload"
        >
        <span class="upload-hint">点击头像更换</span>
        <input
          ref="avatarInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleAvatarChange"
        >
      </div>

      <div class="form-group">
        <label class="form-label">✏️ 昵称</label>
        <input
          v-model="nickname"
          type="text"
          class="form-input"
          placeholder="输入你的昵称"
          maxlength="12"
        >
      </div>

      <div class="form-group">
        <label class="form-label">⚥ 性别</label>
        <div class="radio-group">
          <label><input v-model="gender" type="radio" name="gender" value="男"> 男</label>
          <label><input v-model="gender" type="radio" name="gender" value="女"> 女</label>
          <label><input v-model="gender" type="radio" name="gender" value="保密"> 保密</label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">🔑 账号ID</label>
        <div class="static-text">{{ auth.currentUser || 'loading...' }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">✏️ 个性签名</label>
        <input
          v-model="signature"
          type="text"
          class="form-input"
          placeholder="写点什么..."
          maxlength="30"
        >
      </div>

      <div class="form-group">
        <label class="form-label">📅 注册时间</label>
        <div class="static-text">{{ formattedRegTime }}</div>
      </div>

      <button class="btn" @click="handleSave">💾 保存设置</button>
      <div class="message">{{ message }}</div>

      <button class="btn back-btn" @click="goToVillage">🏠 返回村庄</button>
      <button class="btn logout-btn" @click="handleLogout">🚪 退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const auth = useAuthStore()
const player = usePlayerStore()

const avatarSrc = ref('')
const avatarBase64 = ref('')
const nickname = ref('')
const gender = ref('保密')
const signature = ref('')
const message = ref('')
const avatarInputRef = ref(null)

const formattedRegTime = computed(() => {
  const t = player.registrationTime
  if (!t) return '-'
  return new Date(t).toLocaleDateString('zh-CN')
})

onMounted(() => {
  if (!auth.isLoggedIn) {
    message.value = '未登录，将返回首页'
    setTimeout(() => {
      router.push('/')
    }, 1500)
    return
  }
  initForm()
})

function initForm() {
  nickname.value = player.nickname || ''
  gender.value = player.gender || '保密'
  signature.value = player.signature || ''

  if (player.customAvatar) {
    avatarSrc.value = player.customAvatar
  } else {
    const charClass = player.characterClass || '平民'
    avatarSrc.value = `/image/main/${charClass}头像.webp`
  }
}

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarSrc.value = ev.target.result
    avatarBase64.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function handleSave() {
  if (!auth.currentUser) return

  const nick = nickname.value.trim()
  if (!nick) {
    message.value = '昵称不能为空'
    return
  }

  const gdr = gender.value
  const sig = signature.value.trim()
  const avt = avatarBase64.value || player.customAvatar

  player.setProfile(nick, gdr, sig, avt)
  avatarBase64.value = ''
  message.value = '✅ 设置已保存'
}

function goToVillage() {
  router.push('/village')
}

function handleLogout() {
  auth.logout()
  window.location.href = '/index.html'
}
</script>

<style scoped>
.settings-page {
  width: 100%;
  height: 100vh;
  background: #0b1a26 url('/image/main/千雾古都.webp') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.settings-container {
  width: 100%;
  max-width: 420px;
  height: 100vh;
  margin: 0 auto;
  background: rgba(20, 20, 26, 0.55);
  box-shadow: 0 0 30px #00000070;
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 1px solid rgba(200, 200, 210, 0.12);
  border-right: 1px solid rgba(200, 200, 210, 0.12);
  color: #d8d8e0;
  overflow-y: auto;
}

h2 {
  text-align: center;
  color: #e0e0e8;
  text-shadow: 0 4px 8px black;
  letter-spacing: 4px;
  font-weight: 400;
  font-size: 1.1rem;
  border-bottom: 1px solid #4a4a55;
  padding-bottom: 8px;
  margin: 0;
  flex-shrink: 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(180, 180, 195, 0.5);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
  object-fit: cover;
  background: #132c3f;
  cursor: pointer;
}

.upload-hint {
  font-size: 0.72rem;
  color: #a0a0a8;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(30, 30, 36, 0.6);
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  flex-shrink: 0;
}

.form-label {
  font-size: 0.8rem;
  color: #c0c0c8;
  letter-spacing: 1px;
}

.form-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #4a4a55;
  border-radius: 40px;
  padding: 8px 14px;
  color: white;
  font-size: 0.9rem;
  outline: none;
}

.form-input:focus {
  border-color: #8a8a95;
  box-shadow: 0 0 8px rgba(180, 180, 195, 0.3);
}

.radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #c8c8d0;
  cursor: pointer;
  font-size: 0.85rem;
}

.static-text {
  padding: 8px 14px;
  color: #d8d8e0;
  font-weight: 500;
  font-size: 0.9rem;
}

.btn {
  background: linear-gradient(145deg, #4a4a55, #2a2a32);
  border: 1px solid #7a7a85;
  border-radius: 60px;
  padding: 10px 18px;
  color: white;
  font-weight: bold;
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 0 #1a1a22, 0 3px 8px black;
  transition: 0.08s;
  flex-shrink: 0;
}

.btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #1a1a22, 0 3px 8px black;
}

.back-btn {
  background: #3a4a5a;
}
.back-btn:hover {
  background: #4a5a6a;
}

.logout-btn {
  background: linear-gradient(145deg, #5a3a3a, #3a1e1e);
  border-color: #a08080;
  box-shadow: 0 4px 0 #2a1515, 0 3px 8px black;
}

.message {
  min-height: 18px;
  color: #e8b0a0;
  text-align: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}
</style>
