<template>
  <div class="role-container">
    <div class="page-header">
      <h1 class="page-title">⚔️ 勇者抉择 ⚔️</h1>
      <p class="page-sub">千雾已至 · 踏上你的传奇</p>
    </div>

    <div class="main-panel">
      <div class="class-list">
        <button
          v-for="name in classNames"
          :key="name"
          class="class-btn"
          :class="{ active: selectedClass === name }"
          @click="selectClass(name)"
        >
          {{ name }}
        </button>
      </div>

      <div class="class-showcase">
        <div class="portrait-box">
          <img
            :src="`/image/role/${selectedClass}.webp`"
            :alt="`${selectedClass}立绘`"
            class="portrait-img"
          >
        </div>

        <div class="info-row">
          <div class="stats-panel">
            <h3 class="stats-title">🪽 六维 · 天命 </h3>
            <div class="stats-list">
              <div
                v-for="stat in statOrder"
                :key="stat"
                class="stat-item"
              >
                <span class="stat-label">{{ stat }}</span>
                <div class="stat-bar-container">
                  <div
                    class="stat-bar-fill"
                    :style="{ width: (classData[selectedClass].stats[stat] / 10) * 100 + '%' }"
                  ></div>
                </div>
                <span class="stat-value">{{ classData[selectedClass].stats[stat] }}</span>
              </div>
            </div>
          </div>

          <div class="story-panel">
            <h3 class="story-title">雾隐之章</h3>
            <p class="story-text">{{ classData[selectedClass].story }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="btn-journey" @click="handleStartJourney">
        🐺 踏上旅程 🐺
      </button>
      <div class="message-hint">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const auth = useAuthStore()
const playerStore = usePlayerStore()

const classNames = ['狂战', '游侠', '牧师', '法师', '盾骑', '武僧', '平民']
const statOrder = ['力量', '体质', '敏捷', '感知', '智力', '幸运']

const classData = {
  '狂战': { stats: { 力量:10, 体质:9, 敏捷:5, 感知:4, 智力:3, 幸运:5 }, story: '来自雾都蛮族，在狂怒中挥舞巨斧。他坚信力量能劈开一切冰墙，每一次怒吼都令敌人胆寒。' },
  '游侠': { stats: { 力量:5, 体质:6, 敏捷:10, 感知:8, 智力:5, 幸运:7 }, story: '森林的独行者，百步穿杨。她与冰原狼为伴，箭矢能穿透凛冽寒风，从不失手。' },
  '牧师': { stats: { 力量:4, 体质:5, 敏捷:4, 感知:9, 智力:8, 幸运:8 }, story: '圣光教会的虔信者，能治愈创伤、驱散严寒。她手持圣典，为雾都带来温暖与希望。' },
  '法师': { stats: { 力量:3, 体质:4, 敏捷:5, 感知:7, 智力:10, 幸运:6 }, story: '研习古老冰霜魔法的智者，能召唤暴风雪。但脆弱的身体需要智慧的保护。' },
  '盾骑': { stats: { 力量:8, 体质:10, 敏捷:3, 感知:5, 智力:4, 幸运:5 }, story: '王国的钢铁壁垒，手持巨盾守护队友。任何冲击都无法让他后退半步。' },
  '武僧': { stats: { 力量:7, 体质:8, 敏捷:9, 感知:8, 智力:6, 幸运:5 }, story: '雪山隐修者，以拳脚功夫闻名。他追求身心合一，每一击都蕴含寒冰真气。' },
  '平民': { stats: { 力量:4, 体质:5, 敏捷:5, 感知:6, 智力:6, 幸运:10 }, story: '普通的雾都子民，没有显赫出身，但幸运与坚韧往往创造奇迹。' }
};

const selectedClass = ref('狂战')
const message = ref('')

function selectClass(className) {
  selectedClass.value = className
}

function handleStartJourney() {
  if (!auth.currentUser) {
    message.value = '⚠️ 未检测到登录状态，请返回登录界面'
    return
  }

  if (!selectedClass.value) {
    message.value = '⚠️ 请先选择一个职业'
    return
  }

  playerStore.setCharacterClass(selectedClass.value)
  message.value = `✨ 命运已定，${auth.currentUser} 踏上 ${selectedClass.value} 之路 ✨`

  setTimeout(() => {
    router.push('/village')
  }, 400)
}

onMounted(() => {
  if (!auth.currentUser) {
    message.value = '⚠️ 尚未登录，选择职业后仍可继续（但数据无法保存）'
  } else {
    message.value = `👑 ${auth.currentUser} · 选择你的命运`
  }
})
</script>

<style scoped>
.role-container {
  width: 100%;
  max-width: 400px;
  min-height: 100vh;
  margin: 0 auto;
  background: rgba(6, 18, 28, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
  padding: 18px 12px 20px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(160, 210, 255, 0.15);
  border-right: 1px solid rgba(160, 210, 255, 0.15);
}

.page-header {
  text-align: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.9rem;
  font-weight: 600;
  letter-spacing: 6px;
  text-shadow: 0 3px 10px #00000060, 0 0 10px #7fc9ff;
  color: #eaf3ff;
  margin-bottom: 2px;
}

.page-sub {
  font-size: 0.85rem;
  opacity: 0.9;
  color: #b9d6f0;
  letter-spacing: 2px;
}

.main-panel {
  display: flex;
  gap: 0;
  flex: 1 1 auto;
  margin-bottom: 18px;
  border-radius: 24px;
  background: rgba(10, 25, 38, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(120, 180, 220, 0.25);
  overflow: hidden;
}

.class-list {
  width: 88px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(140, 200, 255, 0.3);
  padding: 8px 4px;
  gap: 6px;
}

.class-btn {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(120, 170, 210, 0.15);
  color: #a0c8e8;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 2px;
  padding: 10px 4px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-shadow: 0 1px 3px #00000040;
  border-radius: 10px;
  position: relative;
}

.class-btn:last-child {
  border-bottom: none;
}

.class-btn:hover {
  color: #e0f0ff;
  background: rgba(100, 180, 255, 0.12);
  box-shadow: inset 0 0 8px rgba(140, 210, 255, 0.2);
}

.class-btn.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(60, 150, 220, 0.35), rgba(100, 180, 240, 0.2));
  border-bottom-color: rgba(160, 220, 255, 0.5);
  box-shadow: 0 0 12px rgba(100, 190, 255, 0.35), inset 0 1px 2px rgba(180, 220, 255, 0.3);
  text-shadow: 0 0 8px #80c8ff;
  transform: scale(1.03);
}

.class-showcase {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 10px;
}

.portrait-box {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(140, 200, 240, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(100, 180, 240, 0.15);
  background: rgba(8, 20, 32, 0.5);
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.info-row {
  display: flex;
  gap: 10px;
  flex: 1;
}

.stats-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stats-title {
  font-size: 0.72rem;
  color: #b0d4f0;
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 2px;
  text-shadow: 0 0 6px rgba(120, 190, 240, 0.4);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  width: 28px;
  font-size: 0.62rem;
  color: #8ab8d8;
  text-align: right;
  flex-shrink: 0;
}

.stat-bar-container {
  flex: 1;
  height: 7px;
  background: rgba(20, 40, 60, 0.5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(100, 150, 200, 0.2);
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #3a8fd4, #6ec6f8, #a0e0ff);
  box-shadow: 0 0 6px rgba(80, 170, 230, 0.5);
  transition: width 0.35s ease;
}

.stat-value {
  width: 16px;
  font-size: 0.65rem;
  color: #c8e4ff;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(140, 210, 255, 0.5);
}

.story-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(140, 200, 240, 0.2);
  padding-left: 8px;
}

.story-title {
  font-size: 0.72rem;
  color: #b0d4f0;
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-shadow: 0 0 6px rgba(120, 190, 240, 0.4);
}

.story-text {
  font-size: 0.7rem;
  color: #aac8e0;
  line-height: 1.6;
  text-align: justify;
  text-shadow: 0 1px 3px #00000030;
}

.footer-actions {
  text-align: center;
  flex-shrink: 0;
}

.btn-journey {
  width: 100%;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 4px;
  color: #eaf6ff;
  background: linear-gradient(180deg, rgba(50, 130, 200, 0.5), rgba(30, 90, 150, 0.55));
  border: 1px solid rgba(140, 210, 255, 0.4);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 2px 5px #00000060;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(180, 220, 255, 0.3);
  backdrop-filter: blur(6px);
}

.btn-journey:hover {
  background: linear-gradient(180deg, rgba(70, 160, 230, 0.55), rgba(40, 110, 180, 0.6));
  box-shadow: 0 6px 22px rgba(60, 150, 220, 0.35), inset 0 1px 3px rgba(200, 235, 255, 0.4);
  border-color: rgba(170, 230, 255, 0.55);
  transform: translateY(-1px);
}

.btn-journey:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.message-hint {
  margin-top: 10px;
  font-size: 0.75rem;
  color: #8eb8d8;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px #00000040;
  min-height: 20px;
}
</style>
