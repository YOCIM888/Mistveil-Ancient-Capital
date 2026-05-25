<template>
  <div
    v-if="modelValue"
    class="modal-overlay"
    @click.self="close"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🏆 挑战模式</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="!showBossPanel" class="mode-cards">
          <div class="mode-card" @click="onPvP">
            <div class="mode-icon">⚔️</div>
            <div class="mode-info">
              <div class="mode-name">匹配对手</div>
              <div class="mode-desc">匹配等级相近的AI玩家进行对战</div>
              <div class="mode-meta">等级范围: ±5级</div>
            </div>
          </div>

          <div class="mode-card" @click="onEndless">
            <div class="mode-icon">∞</div>
            <div class="mode-info">
              <div class="mode-name">无尽模式</div>
              <div class="mode-desc">无限波次怪物挑战</div>
              <div class="mode-meta">当前波数: {{ playerStore.endlessWave }}</div>
            </div>
          </div>

          <div class="mode-card" @click="showBossPanel = true">
            <div class="mode-icon">👑</div>
            <div class="mode-info">
              <div class="mode-name">BOSS超进化</div>
              <div class="mode-desc">挑战已通关BOSS，属性翻倍</div>
              <div class="mode-meta">进化币: {{ playerStore.evolutionCoin }}</div>
            </div>
          </div>
        </div>

        <div v-else class="boss-panel">
          <button class="back-btn" @click="showBossPanel = false">
            ← 返回
          </button>

          <div v-if="availableBosses.length === 0" class="no-boss">
            暂无BOSS数据
          </div>

          <div v-else class="boss-grid">
            <div
              v-for="boss in availableBosses"
              :key="boss.floor"
              class="boss-card"
              :class="{ locked: !boss.isCleared }"
              @click="boss.isCleared && onBossSelect(boss)"
            >
              <img
                :src="`/image/monster/${boss.data.img}`"
                :alt="boss.data.name"
                class="boss-img"
                :class="{ locked: !boss.isCleared }"
              >
              <div class="boss-name">{{ boss.data.name }}</div>
              <div class="boss-evo-count">
                进化次数: {{ boss.evoCount }}
              </div>
              <div v-if="!boss.isCleared" class="boss-locked-hint">通关该层后可挑战</div>
              <div v-if="previewBoss === boss && boss.isCleared" class="boss-preview">
                <div class="preview-label">预览超进化</div>
                <div class="preview-stats">
                  <span>生命: {{ boss.originalHp }} → {{ boss.previewHp }}</span>
                  <span>攻击: {{ boss.originalAtk }} → {{ boss.previewAtk }}</span>
                  <span>防御: {{ boss.originalDef }} → {{ boss.previewDef }}</span>
                </div>
                <button class="start-battle-btn" @click.stop="onStartBossEvo(boss)">
                  发起挑战
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePetStore } from '@/stores/pet'
import { generatePvPOpponent, generateEndlessMonster, generateBossEvolution } from '@/utils/game'
import { BOSS_MONSTERS } from '@/data/monsters'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'startBattle'])

const playerStore = usePlayerStore()
const petStore = usePetStore()

const showBossPanel = ref(false)
const previewBoss = ref(null)

function close() {
  emit('update:modelValue', false)
}

function onPvP() {
  const opponent = generatePvPOpponent(playerStore.level)
  emit('startBattle', { mode: 'pvp', opponent })
  emit('update:modelValue', false)
}

function onEndless() {
  emit('startBattle', { mode: 'endless', wave: playerStore.endlessWave })
  emit('update:modelValue', false)
}

const availableBosses = computed(() => {
  const bossFloors = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  return bossFloors
    .map((f) => {
      const data = BOSS_MONSTERS[f]
      if (!data) return null
      const isCleared = playerStore.clearedFloors.includes(f)
      const evoCount = playerStore.bossEvolutionCounts?.[data.name] || 0
      const multiplier = Math.pow(2, evoCount + 1)
      return {
        floor: f,
        data,
        evoCount,
        isCleared,
        originalHp: data.hp,
        originalAtk: data.attack,
        originalDef: data.defense,
        previewHp: Math.floor(data.hp * multiplier),
        previewAtk: Math.floor(data.attack * multiplier),
        previewDef: Math.floor(data.defense * multiplier)
      }
    })
    .filter(Boolean)
})

function onBossSelect(boss) {
  if (previewBoss.value === boss) {
    previewBoss.value = null
  } else {
    previewBoss.value = boss
  }
}

function onStartBossEvo(boss) {
  const evoCount = boss.evoCount + 1
  const evolvedBoss = generateBossEvolution(boss.data, evoCount)
  emit('startBattle', { mode: 'bossEvolution', boss: evolvedBoss, evoCount })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 90%;
  max-width: 440px;
  max-height: 85vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  position: relative;
  animation: modalPopIn 0.25s ease-out;
}

@keyframes modalPopIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(120, 180, 220, 0.3);
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(20, 60, 90, 0.85), rgba(8, 25, 40, 0.9));
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.modal-body {
  padding: 16px 20px;
}

/* ---------- Mode Cards ---------- */
.mode-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, rgba(15, 45, 70, 0.9), rgba(8, 25, 40, 0.92));
  border: 1.5px solid rgba(120, 180, 220, 0.35);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.05);
}

.mode-card:hover {
  transform: translateY(-2px);
  border-color: rgba(180, 180, 180, 0.6);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.45),
    0 0 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.08);
}

.mode-card:active {
  transform: translateY(0);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mode-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(50, 50, 50, 0.7), rgba(30, 30, 30, 0.8));
  border: 2px solid rgba(170, 170, 170, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    0 0 16px rgba(80, 150, 220, 0.2);
}

.mode-info {
  flex: 1;
  min-width: 0;
}

.mode-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 0.8rem;
  color: #b0d0e8;
  margin-bottom: 4px;
}

.mode-meta {
  font-size: 0.75rem;
  color: #7fb7e0;
  font-weight: 500;
}

/* ---------- Boss Panel ---------- */
.boss-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.back-btn {
  align-self: flex-start;
  padding: 8px 18px;
  background: linear-gradient(145deg, rgba(20, 60, 90, 0.85), rgba(8, 25, 40, 0.9));
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  border-radius: 20px;
  color: #b0d0f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  background: rgba(30, 70, 110, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
  color: #fff;
}

.no-boss {
  text-align: center;
  color: rgba(180, 210, 240, 0.6);
  font-size: 0.95rem;
  padding: 40px 20px;
}

.boss-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.boss-card {
  background: linear-gradient(135deg, rgba(15, 45, 70, 0.9), rgba(8, 25, 40, 0.92));
  border: 1.5px solid rgba(120, 180, 220, 0.3);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.boss-card.locked {
  opacity: 0.45;
  border-color: rgba(80, 70, 60, 0.25);
  cursor: not-allowed;
  background: linear-gradient(135deg, rgba(20, 18, 15, 0.7), rgba(10, 8, 5, 0.8));
}

.boss-card:hover:not(.locked) {
  border-color: rgba(180, 180, 180, 0.6);
  box-shadow:
    0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.boss-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(5, 15, 30, 0.6);
  border: 2px solid rgba(120, 180, 220, 0.35);
}

.boss-img.locked {
  filter: grayscale(0.8);
  border-color: rgba(80, 70, 60, 0.25);
}

.boss-locked-hint {
  font-size: 0.65rem;
  color: #8a7a6a;
  font-weight: 600;
  padding: 4px 10px;
  background: rgba(30, 20, 10, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(100, 80, 60, 0.25);
  margin-top: 4px;
}

.boss-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  line-height: 1.2;
}

.boss-evo-count {
  font-size: 0.7rem;
  color: #7fb7e0;
}

.boss-preview {
  margin-top: 6px;
  padding: 8px;
  background: rgba(20, 60, 100, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(140, 200, 240, 0.35);
  width: 100%;
}

.preview-label {
  font-size: 0.72rem;
  color: #ffd76e;
  font-weight: 600;
  margin-bottom: 6px;
}

.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.68rem;
  color: #b0d0e8;
  margin-bottom: 8px;
}

.start-battle-btn {
  width: 100%;
  padding: 7px 0;
  background: linear-gradient(135deg, #3a7abe, #1d4a6e);
  border: 1.5px solid rgba(140, 210, 255, 0.5);
  border-radius: 12px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.start-battle-btn:hover {
  background: linear-gradient(135deg, #4a8ace, #2d5a7e);
  border-color: rgba(160, 220, 255, 0.7);
  box-shadow: 0 0 16px rgba(80, 160, 220, 0.35);
}

/* ---------- Scrollbar ---------- */
.modal-content::-webkit-scrollbar {
  width: 5px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.5);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
}

@media (max-width: 440px) {
  .modal-content {
    max-width: 95%;
  }

  .boss-grid {
    gap: 8px;
  }

  .boss-img {
    width: 52px;
    height: 52px;
  }

  .mode-icon {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }
}
</style>
