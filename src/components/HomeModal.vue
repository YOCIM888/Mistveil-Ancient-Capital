<template>
  <div v-if="show" class="home-overlay" @click.self="$emit('close')">
    <div class="home-panel">
      <div class="home-header">
        <h3>🏠 住处 Lv.{{ homeStore.homeLevel }}</h3>
        <div class="home-coin-display">
          <span>🏡 {{ homeStore.homeCoins }} 家园币</span>
        </div>
        <button class="home-upgrade-btn" @click="onUpgrade" :disabled="homeStore.homeLevel >= 10">
          {{ homeStore.homeLevel >= 10 ? '已满级' : '升级 (' + homeStore.getUpgradeCost() + '币)' }}
        </button>
        <button class="home-close" @click="$emit('close')">✕</button>
      </div>

      <div class="home-tabs">
        <button :class="['tab-btn', { active: tab === 'fish' }]" @click="tab = 'fish'">🎣 钓鱼</button>
        <button :class="['tab-btn', { active: tab === 'plant' }]" @click="tab = 'plant'">🌱 种植</button>
        <button :class="['tab-btn', { active: tab === 'work' }]" @click="tab = 'work'">💼 打工</button>
      </div>

      <!-- 钓鱼 -->
      <div v-if="tab === 'fish'" class="game-area">
        <div class="game-info">奖励：{{ homeStore.getFishingReward() }} 💎 | 冷却：1分钟</div>
        <div v-if="fishCooling" class="cooldown">冷却中... {{ fishCooldownRemain }}秒</div>
        <div v-else-if="fishPlaying" class="fish-game">
          <div class="fish-bar">
            <div class="fish-target" :style="{ left: fishTarget + '%' }"></div>
            <div class="fish-cursor" :style="{ left: fishCursor + '%' }" ref="fishCursorEl"></div>
          </div>
          <div class="fish-status">剩余次数：{{ 3 - fishHits }} / 3</div>
          <button class="game-btn" @click="onFishStop" :disabled="!fishMoving">
            {{ fishMoving ? '...' : '停！' }}
          </button>
          <div class="game-hint">光标移到绿色区域时点击停止</div>
        </div>
        <div v-else>
          <button class="game-start-btn" @click="startFishing">开始钓鱼</button>
        </div>
      </div>

      <!-- 种植 -->
      <div v-if="tab === 'plant'" class="game-area">
        <div class="game-info">奖励：{{ homeStore.getPlantingReward() }} 🪙 | 冷却：30秒</div>
        <div v-if="plantCooling" class="cooldown">冷却中... {{ plantCooldownRemain }}秒</div>
        <div v-else-if="plantPlaying" class="plant-game">
          <div class="plant-grid">
            <div v-for="(cell, idx) in plantGrid" :key="idx"
              :class="['plant-cell', { planted: cell === 'planted' }]"
              @click="onPlantClick(idx)">
              <span v-if="cell === 'planted'">🌾</span>
              <span v-else class="empty">+</span>
            </div>
          </div>
          <div class="plant-status">已种植：{{ plantedCount }} / 25</div>
        </div>
        <div v-else>
          <button class="game-start-btn" @click="startPlanting">开始种植</button>
        </div>
      </div>

      <!-- 打工 -->
      <div v-if="tab === 'work'" class="game-area">
        <div class="game-info">耗时：5分钟 | 收益：经验 + 5~15 家园币 | 可后台</div>
        <div v-if="working" class="work-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: workProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ workTimeText }}</div>
          <div class="work-hint">可以关闭此窗口，打工将继续</div>
        </div>
        <div v-else>
          <button class="game-start-btn" @click="startWork">开始打工</button>
        </div>
      </div>

      <div v-if="msg" class="home-msg">{{ msg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useHomeStore } from '@/stores/home'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const homeStore = useHomeStore()
const playerStore = usePlayerStore()

const tab = ref('fish')
const msg = ref('')

// ===== 钓鱼 =====
const fishPlaying = ref(false)
const fishCooling = ref(false)
const fishCooldownRemain = ref(0)
const fishCursor = ref(0)
const fishTarget = ref(50)
const fishHits = ref(0)
const fishMoving = ref(true)
const fishGoal = 3

let fishInterval = null
let fishDir = 1
let fishCooldownTimer = null

function startFishing() {
  const now = Date.now()
  if (homeStore.fishCooldown && now < homeStore.fishCooldown) {
    fishCooling.value = true
    startFishCooldown()
    return
  }
  fishPlaying.value = true
  fishCooling.value = false
  fishHits.value = 0
  fishTarget.value = 35 + Math.random() * 30
  fishCursor.value = Math.random() * 100
  fishMoving.value = true
  fishDir = Math.random() > 0.5 ? 1 : -1
  fishInterval = setInterval(() => {
    fishCursor.value += fishDir * (2 + Math.random() * 4)
    if (fishCursor.value >= 95) { fishDir = -1; fishCursor.value = 95 }
    if (fishCursor.value <= 5) { fishDir = 1; fishCursor.value = 5 }
  }, 50)
}

function onFishStop() {
  if (!fishMoving.value) return
  fishMoving.value = false
  clearInterval(fishInterval)
  const hit = Math.abs(fishCursor.value - fishTarget.value) < 8

  if (hit) {
    fishHits.value++
    if (fishHits.value >= fishGoal) {
      const reward = homeStore.getFishingReward()
      const homeCoinReward = Math.floor(reward / 2) + 1
      playerStore.diamond = (playerStore.diamond || 0) + reward
      homeStore.homeCoins += homeCoinReward
      msg.value = `🎣 钓鱼成功！获得 ${reward} 💎 + ${homeCoinReward} 家园币`
      homeStore.fishCooldown = Date.now() + 60000
      fishPlaying.value = false
      startFishCooldown()
    } else {
      fishTarget.value = 35 + Math.random() * 30
      fishCursor.value = 10 + Math.random() * 80
      fishMoving.value = true
      fishDir = Math.random() > 0.5 ? 1 : -1
      fishInterval = setInterval(() => {
        fishCursor.value += fishDir * (2 + Math.random() * 4)
        if (fishCursor.value >= 95) { fishDir = -1; fishCursor.value = 95 }
        if (fishCursor.value <= 5) { fishDir = 1; fishCursor.value = 5 }
      }, 50)
      msg.value = `中了！还剩 ${fishGoal - fishHits.value} 次`
    }
  } else {
    fishPlaying.value = false
    msg.value = '🎣 没停准，钓鱼失败！'
    homeStore.fishCooldown = Date.now() + 60000
    startFishCooldown()
  }
}

function startFishCooldown() {
  if (fishCooldownTimer) clearInterval(fishCooldownTimer)
  fishCooling.value = true
  const remain = Math.ceil((homeStore.fishCooldown - Date.now()) / 1000)
  fishCooldownRemain.value = Math.max(0, remain)
  const timer = setInterval(() => {
    const r = Math.ceil((homeStore.fishCooldown - Date.now()) / 1000)
    fishCooldownRemain.value = Math.max(0, r)
    if (fishCooldownRemain.value <= 0) {
      clearInterval(timer)
      fishCooldownTimer = null
      fishCooling.value = false
    }
  }, 1000)
  fishCooldownTimer = timer
}

// ===== 种植 =====
const plantPlaying = ref(false)
const plantCooling = ref(false)
const plantCooldownRemain = ref(0)
const plantGrid = ref(Array(25).fill('empty'))

const plantedCount = computed(() => plantGrid.value.filter(c => c === 'planted').length)

let plantCooldownTimer = null

function startPlanting() {
  const now = Date.now()
  if (homeStore.plantCooldown && now < homeStore.plantCooldown) {
    plantCooling.value = true
    startPlantCooldown()
    return
  }
  plantPlaying.value = true
  plantGrid.value = Array(25).fill('empty')
}

function onPlantClick(idx) {
  const grid = [...plantGrid.value]
  if (grid[idx] !== 'empty') return
  grid[idx] = 'planted'
  if (grid.filter(c => c === 'planted').length >= 25) {
    const reward = homeStore.getPlantingReward()
    const homeCoinReward = Math.floor(reward / 20) + 1
    playerStore.gold += reward
    homeStore.homeCoins += homeCoinReward
    msg.value = `🌱 种植完成！获得 ${reward} 🪙 + ${homeCoinReward} 家园币`
    homeStore.plantCooldown = Date.now() + 30000
    plantPlaying.value = false
    plantGrid.value = grid
    startPlantCooldown()
    return
  }
  plantGrid.value = grid
}

function startPlantCooldown() {
  if (plantCooldownTimer) clearInterval(plantCooldownTimer)
  plantCooling.value = true
  const remain = Math.ceil((homeStore.plantCooldown - Date.now()) / 1000)
  plantCooldownRemain.value = Math.max(0, remain)
  const timer = setInterval(() => {
    const r = Math.ceil((homeStore.plantCooldown - Date.now()) / 1000)
    plantCooldownRemain.value = Math.max(0, r)
    if (plantCooldownRemain.value <= 0) {
      clearInterval(timer)
      plantCooldownTimer = null
      plantCooling.value = false
    }
  }, 1000)
  plantCooldownTimer = timer
}

// ===== 打工 =====
const working = ref(false)
const workProgress = ref(0)
const workTimeText = ref('')
let workInterval = null

function startWork() {
  if (homeStore.workEndTime && Date.now() < homeStore.workEndTime) {
    working.value = true
    workInterval = setInterval(updateWork, 1000)
    updateWork()
    return
  }
  working.value = true
  workProgress.value = 0
  homeStore.workEndTime = Date.now() + 300000
  workInterval = setInterval(updateWork, 1000)
  updateWork()
}

function updateWork() {
  const remaining = Math.max(0, homeStore.workEndTime - Date.now())
  workProgress.value = Math.min(100, ((300000 - remaining) / 300000) * 100)
  if (remaining <= 0) {
    clearInterval(workInterval)
    working.value = false
    const coins = 5 + Math.floor(Math.random() * 11)
    homeStore.homeCoins += coins
    playerStore.addExp(20)
    msg.value = `💼 打工完成！获得 ${coins} 家园币 + 经验`
    homeStore.workEndTime = 0
    return
  }
  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  workTimeText.value = `${mins}分${secs}秒`
}

// ===== 升级 =====
function onUpgrade() {
  const result = homeStore.upgradeHome()
  msg.value = result.msg
}

watch(() => props.show, (v) => {
  if (v) {
    const now = Date.now()
    if (homeStore.fishCooldown && now < homeStore.fishCooldown) {
      startFishCooldown()
    }
    if (homeStore.plantCooldown && now < homeStore.plantCooldown) {
      startPlantCooldown()
    }
    if (homeStore.workEndTime && now < homeStore.workEndTime) {
      working.value = true
      workInterval = setInterval(updateWork, 1000)
      updateWork()
    }
  }
})

onBeforeUnmount(() => {
  clearInterval(fishInterval)
  clearInterval(workInterval)
  clearInterval(fishCooldownTimer)
  clearInterval(plantCooldownTimer)
})
</script>

<style scoped>
.home-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.home-panel {
  width: 90%;
  max-width: 380px;
  max-height: 85vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #2c2c34, #1a1a20);
  border: 1px solid rgba(180, 180, 200, 0.25);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  position: relative;
}
.home-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.home-header h3 {
  font-size: 1rem;
  color: #e8e8e8;
  margin: 0;
  flex: 1;
}
.home-coin-display {
  font-size: 0.8rem;
  color: #c8a850;
  font-weight: 600;
}
.home-upgrade-btn {
  padding: 4px 12px;
  font-size: 0.75rem;
  background: rgba(80, 120, 90, 0.5);
  border: 1px solid rgba(150, 200, 170, 0.3);
  border-radius: 8px;
  color: #c0dcc0;
  cursor: pointer;
}
.home-upgrade-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.home-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(60, 60, 70, 0.8);
  border: 1px solid rgba(160, 160, 180, 0.3);
  color: #c0c0c8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
.tab-btn {
  flex: 1;
  padding: 10px 0;
  background: rgba(40, 40, 48, 0.7);
  border: 1px solid rgba(140, 140, 155, 0.25);
  border-radius: 10px;
  color: #a0a0a8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: rgba(60, 100, 80, 0.35);
  border-color: rgba(150, 200, 170, 0.4);
  color: #c8e0c8;
}

.game-area {
  min-height: 160px;
}
.game-info {
  font-size: 0.8rem;
  color: #a0a0a8;
  text-align: center;
  margin-bottom: 8px;
}
.cooldown {
  text-align: center;
  font-size: 0.9rem;
  color: #d08060;
  padding: 24px 0;
}
.game-start-btn {
  display: block;
  margin: 24px auto;
  padding: 12px 32px;
  background: linear-gradient(180deg, rgba(60, 100, 80, 0.6), rgba(40, 70, 50, 0.6));
  border: 1px solid rgba(150, 200, 170, 0.3);
  border-radius: 10px;
  color: #d8e8d8;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.fish-bar {
  height: 30px;
  background: rgba(40, 40, 48, 0.8);
  border-radius: 6px;
  position: relative;
  margin: 12px 0;
  overflow: hidden;
}
.fish-target {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 14%;
  background: rgba(80, 180, 110, 0.35);
  border-radius: 4px;
  border: 1px solid rgba(120, 220, 140, 0.3);
}
.fish-cursor {
  position: absolute;
  top: 3px;
  height: calc(100% - 6px);
  width: 3px;
  background: #ff6b6b;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(255, 100, 100, 0.5);
  transition: left 0.05s linear;
}
.fish-status {
  text-align: center;
  font-size: 0.85rem;
  color: #c0c0c8;
  margin: 6px 0;
}
.game-btn {
  display: block;
  margin: 8px auto;
  padding: 8px 28px;
  background: rgba(180, 100, 80, 0.45);
  border: 1px solid rgba(220, 150, 120, 0.3);
  border-radius: 8px;
  color: #ffc8a0;
  font-weight: 600;
  cursor: pointer;
}
.game-btn:disabled {
  opacity: 0.5;
}
.game-hint {
  text-align: center;
  font-size: 0.7rem;
  color: #707078;
  margin-top: 4px;
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin: 10px 0;
}
.plant-cell {
  aspect-ratio: 1;
  background: rgba(40, 40, 48, 0.7);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  border: 1px solid rgba(120, 120, 140, 0.15);
  transition: all 0.15s;
}
.plant-cell:hover {
  background: rgba(60, 60, 70, 0.7);
}
.plant-cell.planted {
  background: rgba(60, 100, 60, 0.3);
}
.plant-cell .empty {
  color: #505058;
  font-size: 1.2rem;
}
.plant-status {
  text-align: center;
  font-size: 0.8rem;
  color: #b0b0b8;
}

.work-progress {
  margin-top: 20px;
}
.progress-bar {
  height: 10px;
  background: rgba(40, 40, 48, 0.8);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6b7b8d, #8b9db0);
  border-radius: 5px;
  transition: width 1s;
}
.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #c0c0c8;
  margin-bottom: 8px;
}
.work-hint {
  text-align: center;
  font-size: 0.7rem;
  color: #707078;
}

.home-msg {
  text-align: center;
  margin-top: 12px;
  color: #e0c880;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
