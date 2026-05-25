<template>
  <div class="login-page">
    <div class="game-container">
      <div class="login-card">
        <div class="session-info">
          <span>{{ auth.currentUser ? `👑 当前: ${auth.currentUser}` : '🪽 未登录' }}</span>
          <button
            v-if="auth.currentUser"
            class="switch-account"
            @click="handleSwitchAccount"
          >
            切换账号
          </button>
        </div>

        <div class="input-group">
          <label>🪽 账户名</label>
          <input
            ref="usernameRef"
            v-model="username"
            type="text"
            class="input-field"
            placeholder="英雄，留下名号"
            autocomplete="off"
            spellcheck="false"
            @keypress="onUsernameKeypress"
          >
        </div>

        <div class="input-group">
          <label>🔒 密码</label>
          <input
            ref="passwordRef"
            v-model="password"
            type="password"
            class="input-field"
            placeholder="••••••••"
            autocomplete="off"
            @keypress="onPasswordKeypress"
          >
        </div>

        <div class="actions">
          <button class="btn" @click="handleLogin">登 陆</button>
        </div>

        <div class="error-msg">{{ message }}</div>
        <div class="hint">新账户将自动注册 · 数据存于本地</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const playBgMusic = inject('playBgMusic')

const username = ref('')
const password = ref('')
const message = ref('')

const usernameRef = ref(null)
const passwordRef = ref(null)

onMounted(() => {
  if (auth.currentUser) {
    username.value = auth.currentUser
    message.value = `已登录 ${auth.currentUser}，点击登陆直接进入`
  }
})

function onUsernameKeypress(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    passwordRef.value?.focus()
  }
}

function onPasswordKeypress(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleLogin()
  }
}

function handleLogin() {
  if (auth.currentUser) {
    message.value = `欢迎归来，${auth.currentUser}，前往王国...`
    setTimeout(() => {
      playBgMusic?.()
      router.push('/village')
    }, 200)
    return
  }

  const name = username.value.trim()
  const pwd = password.value

  if (!name || !pwd) {
    message.value = '❄️ 账户名和密码不能为空'
    return
  }

  if (name.length > 20) {
    message.value = '账户名不能超过20个字符'
    return
  }

  const result = auth.login(name, pwd)

  if (!result.success) {
    message.value = result.message
    return
  }

  if (result.isNew) {
    message.value = '✨ 创建成功！进入北境序章...'
    setTimeout(() => {
      playBgMusic?.()
      router.push('/select-class')
    }, 300)
  } else {
    message.value = `❄️ 欢迎回来，${name}！`
    setTimeout(() => {
      playBgMusic?.()
      router.push('/village')
    }, 300)
  }
}

function handleSwitchAccount() {
  auth.logout()
  username.value = ''
  password.value = ''
  message.value = '已退出当前账号，可重新登录'
  nextTick(() => {
    usernameRef.value?.focus()
  })
}
</script>

<style scoped>
.login-page {
  width: 100%;
  min-height: 100vh;
  background: url('/image/main/千雾古都.webp') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

.game-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 24px 20px;
}

.login-card {
  flex: 0 0 auto;
  background: rgba(24, 24, 30, 0.6);
  border-radius: 32px;
  padding: 28px 22px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  color: #c8c8d0;
  font-size: 0.9rem;
  margin-bottom: 6px;
  letter-spacing: 1px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid #4a4a55;
  border-radius: 48px;
  padding: 14px 20px;
  font-size: 1rem;
  color: white;
  outline: none;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #8a8a95;
  background: rgba(40, 40, 48, 0.5);
  box-shadow: 0 0 12px rgba(180, 180, 190, 0.2);
}

.input-field::placeholder {
  color: #808088;
  opacity: 0.7;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.btn {
  border: none;
  border-radius: 60px;
  padding: 16px 18px;
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 2px;
  background: linear-gradient(145deg, #4a4a55, #2a2a32);
  color: white;
  text-shadow: 0 2px 6px #00000060;
  box-shadow: 0 8px 0 #1a1a22, 0 6px 12px black;
  border: 1px solid #808088;
  cursor: pointer;
  transition: 0.08s linear;
  text-align: center;
}

.btn:active {
  transform: translateY(5px);
  box-shadow: 0 3px 0 #1a1a22, 0 6px 12px black;
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #c0c0c8;
  font-size: 0.9rem;
}

.switch-account {
  background: none;
  border: none;
  color: #b0b0c0;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-size: 0.9rem;
  padding: 4px 8px;
  cursor: pointer;
  opacity: 0.9;
}

.switch-account:active {
  opacity: 0.6;
}

.error-msg {
  min-height: 24px;
  color: #ffb0a0;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
}

.hint {
  color: #888890;
  text-align: center;
  margin-top: 8px;
}
</style>
