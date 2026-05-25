<template>
  <div class="login-page">
    <div class="game-container">
      <div class="header">
        <div class="game-title">千雾古都</div>
        <div class="subhead">KING OF MIST</div>
      </div>

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
          <button class="btn btn-secondary" @click="showProtocol = true">
            📜 同意协议条款
          </button>
        </div>

        <div class="error-msg">{{ message }}</div>
        <div class="hint">新账户将自动注册 · 数据存于本地</div>
      </div>

      <div class="footer">
        <div class="copyright">&copy; 由 YOCIM 独立开发</div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showProtocol"
        class="modal-overlay"
        @click.self="showProtocol = false"
      >
        <div class="modal-card">
          <div class="modal-header">
            <h3>🪽 用户协议</h3>
            <button class="close-modal" @click="showProtocol = false">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p>
              <strong>千雾古都游戏用户协议</strong><br>
              欢迎您使用本千雾古都网页游戏（以下简称"本游戏"）。在开始使用本游戏前，请您务必仔细阅读、充分理解本协议全部条款。您点击确认同意、启动或使用本游戏，即视为您已完全理解并自愿接受本协议所有内容，本协议即对您产生法律约束力。若您不同意本协议任何条款，请立即停止使用本游戏。
            </p>

            <h4>一、游戏数据存储说明</h4>
            <p>
              1. 游玩前，请务必确保您已年满十八岁，没有防沉迷限制。本游戏为静态网页游戏，您在游戏过程中产生的所有数据，包括但不限于游戏进度、角色信息、道具装备、成就记录、游戏设置、存档文件等，全部存储于您所使用设备的浏览器本地存储空间（LocalStorage）中，不会上传、保存至游戏运营方服务器。<br>
              2. 游戏运营方无法访问、获取、修改、备份您的本地游戏数据，亦无义务对您的本地数据进行任何形式的保管、恢复操作。<br>
              3. 您需自行承担游戏数据存储的全部风险，自主负责个人设备及浏览器的安全维护。
            </p>

            <h4>二、数据丢失免责声明</h4>
            <p>
              1. 因以下任一原因导致您的本地游戏数据丢失、损坏、清空、无法读取或无法恢复的，游戏作者不承担任何责任，无需向您进行任何赔偿、补偿或数据恢复：<br>
              - 您自行清理浏览器缓存、Cookie、本地存储数据，或卸载、重装浏览器；<br>
              - 您更换、重置、损坏使用本游戏的设备，或恢复设备出厂设置；<br>
              - 设备系统升级、浏览器版本更新、软件兼容性问题导致数据异常；<br>
              - 设备感染病毒、遭遇恶意程序攻击，或网络故障、断电等意外情况；<br>
              - 您主动删除游戏相关数据，或因个人操作失误造成数据丢失；<br>
              - 其他非游戏运营方原因引发的一切数据异常问题。<br>
              2. 游戏运营方不对游戏数据的完整性、稳定性、持续性做出任何保证，不承诺游戏运行过程中无任何数据报错、存档失效情况。
            </p>

            <h4>三、用户权利与义务</h4>
            <p>
              1. 您仅可将本游戏用于个人、非商业性的娱乐用途，不得将本游戏用于任何违法、违规及侵权行为。<br>
              2. 您不得对本游戏进行反向编译、反向工程、修改、破解、篡改代码，不得制作、使用外挂、作弊工具等第三方程序破坏游戏正常运行。<br>
              3. 您不得擅自复制、传播、售卖本游戏内容，不得利用本游戏从事盈利性活动，仅可用于个人学习用途。<br>
              4. 您在使用本游戏过程中，需遵守国家法律法规、公序良俗，不得实施任何损害他人合法权益的行为。<br>
              5. 您自愿承担使用本游戏的全部风险，因个人使用行为产生的一切后果，由您自行承担。
            </p>

            <h4>四、游戏运营方权利</h4>
            <p>
              1. 游戏作者保留对本游戏内容、功能、界面进行更新、优化、调整、下架的权利，无需另行单独通知用户。<br>
              2. 若发现用户违反本协议约定，游戏作者有权立即终止用户使用本游戏的权限，且不承担任何责任。<br>
              3. 游戏作者有权根据实际情况，修改、更新本协议条款，更新后的协议将在游戏页面公示，公示后立即生效；若您继续使用本游戏，视为接受修订后的协议。
            </p>

            <h4>五、知识产权声明</h4>
            <p>
              1. 本游戏的所有知识产权，包括但不限于游戏代码、美术、音乐、文案、界面设计、商标等，均归游戏作者所有，受国家知识产权相关法律法规保护。<br>
              2. 未经游戏作者书面授权，任何人不得擅自使用、复制、传播、改编本游戏的任何知识产权内容。
            </p>

            <h4>六、其他条款</h4>
            <p>
              1. 本协议自您使用本游戏之日起生效，协议的成立、生效、履行、解释及纠纷解决，适用中华人民共和国法律。<br>
              2. 若您与游戏作者就本协议产生纠纷，双方应优先协商解决；协商不成的，可向作者所在地人民法院提起诉讼。<br>
              3. 本协议部分条款被认定为无效的，不影响其余条款的法律效力。<br>
              4. 游戏作者未行使本协议项下任何权利，不视为对该权利的放弃。
            </p>

            <h4>七、补充说明</h4>
            <p>
              若您对本协议有任何疑问，可通过游戏公示的联系方式咨询；如您不同意本协议，请勿使用本游戏，已使用的请立即停止。
            </p>
            <p style="margin-top: 16px;">—— 冰封王国 · 凛冬之契 ——</p>
          </div>
        </div>
      </div>
    </Teleport>
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
const showProtocol = ref(false)

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
  background: url('/image/main/冰封王国.webp') no-repeat center center fixed;
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
  min-height: 100vh;
  margin: 0 auto;
  background-color: rgba(18, 18, 24, 0.6);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  padding: 24px 20px 20px;
  border-left: 1px solid rgba(200, 200, 210, 0.12);
  border-right: 1px solid rgba(200, 200, 210, 0.12);
}

.header {
  flex: 0 0 auto;
  margin-top: 8vh;
  margin-bottom: 20px;
  text-align: center;
}

.game-title {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: 6px;
  text-shadow: 0 6px 16px #00000060;
  color: #e8e8e8;
  font-family: 'Times New Roman', serif;
  word-break: keep-all;
}

.subhead {
  font-size: 0.9rem;
  color: #b0b0b8;
  letter-spacing: 3px;
  margin-top: 6px;
  opacity: 0.9;
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

.btn-secondary {
  background: linear-gradient(145deg, #3a3a42, #22222a);
  box-shadow: 0 5px 0 #14141a, 0 4px 10px black;
  border-color: #6a6a72;
  font-size: 1rem;
  padding: 12px 18px;
}

.btn-secondary:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #14141a, 0 4px 10px black;
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

.footer {
  flex: 0 0 auto;
  margin-top: auto;
  text-align: center;
  padding: 16px 0 8px;
}

.copyright {
  color: #a0a0a8;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  opacity: 0.9;
  text-shadow: 0 2px 8px #00000080;
  border-top: 1px solid #3a3a4260;
  padding-top: 18px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  background: linear-gradient(145deg, #2a2a32, #1a1a22);
  border-radius: 32px;
  border: 1px solid rgba(180, 180, 195, 0.3);
  box-shadow: 0 20px 40px #000000b0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #3a3a45;
  background: #14141a80;
}

.modal-header h3 {
  color: #e0e0e8;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 2px 6px black;
}

.close-modal {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: #a0a0a8;
  cursor: pointer;
  padding: 0 8px;
  transition: 0.1s;
}

.close-modal:active {
  color: white;
  transform: scale(0.9);
}

.modal-body {
  padding: 20px 22px;
  overflow-y: auto;
  color: #c8c8d0;
  font-size: 0.9rem;
  line-height: 1.65;
  max-height: 60vh;
  background: #1e1e26;
}

.modal-body p {
  margin-bottom: 14px;
}

.modal-body strong {
  color: #c8c8d0;
}

.modal-body h4 {
  margin: 16px 0 8px;
  color: #c0c0c8;
}

.modal-body::-webkit-scrollbar {
  width: 5px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #5a5a65;
  border-radius: 10px;
}
</style>
