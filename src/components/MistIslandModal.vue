<template>
  <div v-if="modelValue" class="mist-overlay" @click.self="handleClose">
    <div class="mist-panel">
      <div class="mist-header">
        <span class="mist-label">🌫️ 迷雾岛</span>
        <button class="mist-close" @click="handleClose">✕</button>
      </div>

      <div class="mist-canvas-wrap">
        <MazeCanvas
          v-if="mazeData"
          ref="mazeCanvasRef"
          :grid="mazeData.grid"
          :cell-data="mazeData.cellData"
          :start-x="mazeData.startX"
          :start-y="mazeData.startY"
          @encounter-monster="onEncounterMonster"
          @encounter-puzzle="onEncounterPuzzle"
          @encounter-chest="onEncounterChest"
          @encounter-boss="onEncounterBoss"
          @step="onStep"
        />
      </div>
    </div>

    <div v-if="dialogType === 'monster'" class="mist-dialog-overlay" @click.self="dialogType = null">
      <div class="mist-dialog">
        <div class="mist-dialog-icon">⚔️</div>
        <div class="mist-dialog-title">{{ monsterDialogData?.name || '??? ' }}</div>
        <div class="mist-dialog-stats">
          <span>❤️ {{ monsterDialogData?.hp || 0 }}</span>
          <span>⚔️ {{ monsterDialogData?.attack || 0 }}</span>
          <span>🛡️ {{ monsterDialogData?.defense || 0 }}</span>
        </div>
        <div class="mist-dialog-btns">
          <button class="mist-btn fight" @click="onFight">战斗</button>
          <button class="mist-btn flee" @click="onFlee">逃跑</button>
        </div>
      </div>
    </div>

    <div v-if="dialogType === 'puzzle'" class="mist-dialog-overlay" @click.self="dialogType = null">
      <div class="mist-dialog">
        <div class="mist-dialog-icon">❓</div>
        <div class="mist-dialog-title">解谜挑战</div>
        <div class="mist-puzzle-q">{{ puzzleDialogData?.question || '' }}</div>
        <input
          ref="puzzleInputRef"
          v-model="puzzleAnswer"
          type="number"
          class="mist-input"
          placeholder="输入答案"
          @keypress.enter="onPuzzleSubmit"
        />
        <div v-if="puzzleFeedback" class="mist-feedback" :class="puzzleFeedbackType">
          {{ puzzleFeedback }}
        </div>
        <button class="mist-btn action" @click="onPuzzleSubmit">提交</button>
      </div>
    </div>

    <div v-if="dialogType === 'chest'" class="mist-dialog-overlay" @click.self="dialogType = null">
      <div class="mist-dialog">
        <div class="mist-dialog-icon">📦</div>
        <div class="mist-dialog-title">宝箱</div>
        <div class="mist-chest-hint">点击绿色区域开启宝箱！</div>
        <div class="mist-chest-bar">
          <div class="mist-chest-track">
            <div
              class="mist-chest-indicator"
              :style="{ left: chestIndicatorPos + '%' }"
            />
            <div class="mist-chest-zone" :style="{ left: chestZoneStart + '%', width: chestZoneWidth + '%' }" />
          </div>
        </div>
        <div v-if="chestFeedback" class="mist-feedback" :class="chestFeedbackType">
          {{ chestFeedback }}
        </div>
        <button
          ref="chestBtnRef"
          class="mist-btn action"
          :disabled="chestOpened"
          @click="onChestClick"
        >
          {{ chestOpened ? '已开启' : '点击开启' }}
        </button>
        <div v-if="chestOpened" class="mist-chest-reward">
          +{{ chestReward }} 💰
        </div>
      </div>
    </div>

    <div v-if="dialogType === 'boss'" class="mist-dialog-overlay" @click.self="dialogType = null">
      <div class="mist-dialog">
        <div class="mist-dialog-icon">👑</div>
        <div class="mist-dialog-title">{{ bossDialogData?.name || '迷雾之主' }}</div>
        <div class="mist-dialog-stats">
          <span>❤️ {{ bossDialogData?.hp || 0 }}</span>
          <span>⚔️ {{ bossDialogData?.attack || 0 }}</span>
          <span>🛡️ {{ bossDialogData?.defense || 0 }}</span>
        </div>
        <div class="mist-dialog-btns">
          <button class="mist-btn fight" @click="onBossFight">决战</button>
          <button class="mist-btn flee" @click="onFlee">撤退</button>
        </div>
      </div>
    </div>

    <div v-if="dialogType === 'defeat'" class="mist-dialog-overlay">
      <div class="mist-dialog">
        <div class="mist-dialog-icon">💀</div>
        <div class="mist-dialog-title">战斗失败</div>
        <div class="mist-dialog-btns">
          <button class="mist-btn action" @click="onRetry">重新挑战</button>
          <button class="mist-btn flee" @click="handleClose">退出</button>
        </div>
      </div>
    </div>

    <BattleModal
      v-show="battleActive"
      :battle-config="battleConfig"
      @close="onBattleClose"
      @victory="onBattleVictory"
      @defeat="onBattleDefeat"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { generateMistIslandMaze } from '@/utils/maze'
import MazeCanvas from '@/components/MazeCanvas.vue'
import BattleModal from '@/components/BattleModal.vue'
import { showToast } from '@/utils/toast'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()

const mazeCanvasRef = ref(null)
const puzzleInputRef = ref(null)
const chestBtnRef = ref(null)

const mazeData = ref(null)
const dialogType = ref(null)

const monsterDialogData = ref(null)
const bossDialogData = ref(null)
const puzzleDialogData = ref(null)
const puzzleAnswer = ref('')
const puzzleFeedback = ref('')
const puzzleFeedbackType = ref('')

const chestIndicatorPos = ref(0)
const chestDirection = ref(1)
const chestOpened = ref(false)
const chestReward = ref(0)
const chestFeedback = ref('')
const chestFeedbackType = ref('')
const chestZoneStart = ref(35)
const chestZoneWidth = ref(20)
let chestInterval = null
let currentChestGold = 0

const battleActive = ref(false)
const battleConfig = ref(null)
const pendingMonster = ref(null)
const pendingMonsterPos = ref(null)
const pendingIsBoss = ref(false)

function handleClose() {
  emit('update:modelValue', false)
  dialogType.value = null
  battleActive.value = false
}

function initMaze() {
  const level = playerStore.level || 1
  mazeData.value = generateMistIslandMaze(level)
  dialogType.value = null
  battleActive.value = false
  battleConfig.value = null
  pendingMonster.value = null
  pendingMonsterPos.value = null
  pendingIsBoss.value = false
}

watch(() => props.modelValue, (val) => {
  if (val) initMaze()
})

function boostMonster(monster, isBoss) {
  const multi = 3
  return {
    ...monster,
    hp: (monster.hp || 100) * multi,
    maxHp: (monster.hp || 100) * multi,
    attack: (monster.attack || 10) * multi,
    defense: (monster.defense || 5) * multi,
    atkSpeed: monster.atkSpeed || 1.0,
    isBoss: !!isBoss,
  }
}

function onEncounterMonster({ data }) {
  if (!data) return
  monsterDialogData.value = data
  dialogType.value = 'monster'
}

function onEncounterPuzzle({ data }) {
  if (!data) return
  puzzleDialogData.value = data
  puzzleAnswer.value = ''
  puzzleFeedback.value = ''
  nextTick(() => puzzleInputRef.value?.focus())
  dialogType.value = 'puzzle'
}

function onEncounterChest({ x, y, data }) {
  if (!data) return
  chestOpened.value = false
  chestFeedback.value = ''
  chestIndicatorPos.value = Math.random() * 60 + 20
  chestDirection.value = Math.random() > 0.5 ? 1 : -1
  chestZoneStart.value = 30 + Math.random() * 15
  chestZoneWidth.value = 15 + Math.random() * 10
  currentChestGold = randInt(100, 1000)
  
  startChestAnimation()
  dialogType.value = 'chest'
}

function onEncounterBoss({ data }) {
  if (!data) return
  bossDialogData.value = data
  dialogType.value = 'boss'
}

function onStep() {}

function onFight() {
  const m = monsterDialogData.value
  if (!m) return
  const boosted = boostMonster(m, false)
  pendingMonster.value = boosted
  pendingIsBoss.value = false
  dialogType.value = null
  startBattle(boosted, false)
}

function onFlee() {
  dialogType.value = null
}

function onBossFight() {
  const m = bossDialogData.value
  if (!m) return
  const boosted = boostMonster(m, true)
  pendingMonster.value = boosted
  pendingIsBoss.value = true
  dialogType.value = null
  startBattle(boosted, true)
}

function startBattle(monster, isBoss) {
  battleConfig.value = {
    mode: 'mist-island',
    monster: {
      name: monster.name,
      img: monster.img || '/image/monster/雪绒兔.webp',
      hp: monster.hp,
      maxHp: monster.maxHp || monster.hp,
      attack: monster.attack,
      defense: monster.defense,
      atkSpeed: monster.atkSpeed || 1.0,
      moveSpeed: monster.moveSpeed || 3.0,
      isBoss,
      isElite: false,
    }
  }
  battleActive.value = true
}

function onBattleVictory(rewards) {
  battleActive.value = false
  const monster = pendingMonster.value
  if (!monster) return

  if (rewards && rewards.items) {
    rewards.items.forEach(item => inventoryStore.addItem(item))
  }

  if (pendingIsBoss.value) {
    playerStore.addMistIslandClear()
    playerStore.addGold(randInt(200, 500))
    playerStore.addDiamond(randInt(5, 15))
    playerStore.addExp(randInt(200, 500))
    dialogType.value = null
    showToast('🏆 恭喜通关迷雾岛！\n\n击败了' + monster.name + '！\n获得大量金币、钻石和经验奖励！')
    handleClose()
  }
}

function onBattleDefeat() {
  battleActive.value = false
  dialogType.value = 'defeat'
}

function onBattleClose() {
  battleActive.value = false
}

function onRetry() {
  dialogType.value = null
  battleActive.value = false
  initMaze()
}

function onPuzzleSubmit() {
  const answer = Number(puzzleAnswer.value)
  if (isNaN(answer)) {
    puzzleFeedback.value = '请输入数字答案'
    puzzleFeedbackType.value = 'error'
    return
  }
  if (answer === puzzleDialogData.value?.answer) {
    const gold = randInt(50, 500)
    playerStore.addGold(gold)
    puzzleFeedback.value = `✅ 正确！获得 ${gold} 💰`
    puzzleFeedbackType.value = 'success'
    setTimeout(() => { dialogType.value = null }, 1200)
  } else {
    puzzleFeedback.value = '❌ 答案错误，再试一次'
    puzzleFeedbackType.value = 'error'
    puzzleAnswer.value = ''
    nextTick(() => puzzleInputRef.value?.focus())
  }
}

function startChestAnimation() {
  if (chestInterval) clearInterval(chestInterval)
  chestInterval = setInterval(() => {
    let pos = chestIndicatorPos.value + chestDirection.value * 2
    if (pos > 95) { pos = 95; chestDirection.value = -1 }
    if (pos < 2) { pos = 2; chestDirection.value = 1 }
    chestIndicatorPos.value = pos
  }, 50)
}

function onChestClick() {
  if (chestOpened.value) return
  const pos = chestIndicatorPos.value
  const start = chestZoneStart.value
  const end = start + chestZoneWidth.value

  if (pos >= start && pos <= end) {
    if (chestInterval) clearInterval(chestInterval)
    chestOpened.value = true
    chestReward.value = currentChestGold
    playerStore.addGold(currentChestGold)
    chestFeedback.value = `🎉 成功开启！获得 ${currentChestGold} 💰`
    chestFeedbackType.value = 'success'
  } else {
    chestFeedback.value = '💨 没对准！再试一次'
    chestFeedbackType.value = 'error'
    setTimeout(() => { chestFeedback.value = '' }, 800)
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
</script>

<style scoped>
.mist-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mist-panel {
  width: 460px;
  max-width: 95vw;
  height: 85vh;
  background: linear-gradient(180deg, #1a1f2e, #0d1117);
  border: 1px solid rgba(100, 140, 180, 0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(10, 20, 30, 0.8);
  border-bottom: 1px solid rgba(80, 120, 160, 0.2);
  flex-shrink: 0;
}

.mist-label {
  color: #c0d8f0;
  font-weight: 600;
  font-size: 0.95rem;
}

.mist-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(40, 50, 60, 0.8);
  border: 1px solid rgba(120, 140, 160, 0.3);
  color: #a0b0c0;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mist-close:hover {
  background: rgba(60, 70, 80, 0.9);
}

.mist-canvas-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dialog overlay */
.mist-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mist-dialog {
  width: 300px;
  max-width: 90vw;
  background: linear-gradient(180deg, #252530, #181820);
  border: 1px solid rgba(140, 160, 180, 0.3);
  border-radius: 14px;
  padding: 20px 18px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.mist-dialog-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.mist-dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e8e8e8;
  margin-bottom: 10px;
}

.mist-dialog-stats {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 14px;
  font-size: 0.85rem;
  color: #b0c0d0;
}

.mist-dialog-stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.mist-dialog-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.mist-btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.mist-btn.fight {
  background: linear-gradient(135deg, #cc4444, #992222);
  color: #ffe8e8;
}

.mist-btn.flee {
  background: linear-gradient(135deg, #556677, #334455);
  color: #c0d0e0;
}

.mist-btn.action {
  background: linear-gradient(135deg, #4488aa, #336688);
  color: #e0f0f8;
}

.mist-btn:hover {
  transform: scale(1.05);
}

/* Puzzle */
.mist-puzzle-q {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffcc44;
  margin-bottom: 12px;
}

.mist-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #4a5566;
  border-radius: 24px;
  color: #fff;
  font-size: 1rem;
  text-align: center;
  outline: none;
  margin-bottom: 10px;
}

.mist-input:focus {
  border-color: #6699bb;
}

.mist-feedback {
  font-size: 0.85rem;
  margin-bottom: 8px;
  padding: 4px 0;
}

.mist-feedback.success {
  color: #77dd77;
}

.mist-feedback.error {
  color: #ff8877;
}

/* Chest bar */
.mist-chest-hint {
  color: #b0c0d0;
  font-size: 0.8rem;
  margin-bottom: 12px;
}

.mist-chest-bar {
  margin-bottom: 12px;
}

.mist-chest-track {
  position: relative;
  height: 28px;
  background: #1a2030;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(120, 140, 160, 0.3);
}

.mist-chest-indicator {
  position: absolute;
  top: 2px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff8844, #dd5533);
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(255, 150, 50, 0.5);
  transition: none;
}

.mist-chest-zone {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(100, 220, 100, 0.35);
  border-left: 2px solid rgba(100, 200, 100, 0.5);
  border-right: 2px solid rgba(100, 200, 100, 0.5);
}

.mist-chest-reward {
  font-size: 1rem;
  font-weight: 700;
  color: #ffcc44;
  margin-top: 6px;
}

.mist-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>