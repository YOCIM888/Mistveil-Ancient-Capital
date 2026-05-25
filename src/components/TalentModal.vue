<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content talent-modal">
      <div class="modal-header">
        <h2 class="modal-title">🌟 天赋面板</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div class="points-display">
          <span class="points-label">可用天赋点:</span>
          <span class="points-value">{{ playerStore.talentPoints }}</span>
        </div>

        <div class="reset-section">
          <button
            class="reset-btn diamond-reset"
            :disabled="playerStore.diamond < 5"
            @click="resetWithDiamond"
          >
            💎 钻石重置 (5钻石)
          </button>
          <button
            class="reset-btn gold-reset"
            :disabled="playerStore.gold < 5000"
            @click="resetWithGold"
          >
            💰 金币重置 (5000金币)
          </button>
        </div>

        <div v-if="currentTalents.length === 0" class="empty-hint">
          该职业暂无天赋数据
        </div>

        <div class="talent-grid">
          <div
            v-for="talent in currentTalents"
            :key="talent.id"
            class="talent-card"
          >
            <div class="talent-icon-wrap">
              <span class="talent-icon">{{ talent.icon }}</span>
            </div>

            <div class="talent-info">
              <div class="talent-name">{{ talent.name }}</div>
              <div class="talent-level">
                <span class="level-text">{{ talentLevel(talent.id) }} / {{ talent.maxLevel }}</span>
              </div>
              <div class="talent-desc">{{ talent.description }}</div>
              <div class="talent-effect">{{ displayEffect(talent) }}</div>

              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: progressPercent(talent) + '%' }"
                ></div>
              </div>
            </div>

            <button
              class="upgrade-btn"
              :disabled="playerStore.talentPoints <= 0 || talentLevel(talent.id) >= talent.maxLevel"
              @click="upgrade(talent.id)"
            >
              {{ talentLevel(talent.id) >= talent.maxLevel ? '已满' : '升级' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { TALENTS } from '@/data/talents'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()

const currentTalents = computed(() => {
  return TALENTS[playerStore.characterClass] || []
})

function close() {
  emit('update:modelValue', false)
}

function talentLevel(talentId) {
  return playerStore.talents[talentId] || 0
}

function progressPercent(talent) {
  const lvl = talentLevel(talent.id)
  if (talent.maxLevel <= 0) return 0
  return Math.min(100, (lvl / talent.maxLevel) * 100)
}

function displayEffect(talent) {
  const lvl = talentLevel(talent.id)
  if (lvl > 0) {
    return talent.getEffect?.(lvl) || ''
  }
  return talent.getEffect?.(1) || ''
}

function upgrade(talentId) {
  if (playerStore.talentPoints <= 0) return
  const talent = currentTalents.value.find(t => t.id === talentId)
  if (!talent) return
  if (talentLevel(talentId) >= talent.maxLevel) return
  playerStore.addTalent(talentId)
}

function resetWithDiamond() {
  if (playerStore.diamond < 5) return
  const confirmed = confirm('确定要花费 5 💎 重置所有天赋吗？天赋点将全部返还。')
  if (!confirmed) return
  playerStore.diamond -= 5
  playerStore.resetTalents()
}

function resetWithGold() {
  if (playerStore.gold < 5000) return
  const confirmed = confirm('确定要花费 5000 💰 重置所有天赋吗？天赋点将全部返还。')
  if (!confirmed) return
  playerStore.gold -= 5000
  playerStore.resetTalents()
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

.talent-modal {
  width: 90%;
  max-width: 440px;
  max-height: 85vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
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
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
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

.points-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0 14px;
}

.points-label {
  color: #c0d8f0;
  font-size: 0.95rem;
  font-weight: 500;
}

.points-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffd76e;
  text-shadow: 0 0 12px rgba(255, 215, 110, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
}

.reset-section {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.reset-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  background: rgba(15, 40, 65, 0.8);
  color: #aaa;
}

.reset-btn:hover:not(:disabled) {
  border-color: rgba(160, 160, 160, 0.6);
  background: rgba(40, 40, 40, 0.9);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

.reset-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.reset-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-hint {
  text-align: center;
  color: rgba(180, 210, 240, 0.5);
  padding: 30px 0;
  font-size: 0.9rem;
}

.talent-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.talent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.85), rgba(10, 10, 10, 0.9));
  border-radius: 16px;
  padding: 14px;
  border: 1.5px solid rgba(150, 150, 150, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: all 0.25s ease;
}

.talent-card:hover {
  border-color: rgba(180, 180, 180, 0.55);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
}

.talent-icon-wrap {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.7);
  border-radius: 14px;
  border: 1.5px solid rgba(150, 150, 150, 0.3);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.05);
}

.talent-icon {
  font-size: 1.5rem;
}

.talent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.talent-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff5d6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.talent-level {
  margin-bottom: 2px;
}

.level-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #aaa;
  background: rgba(50, 50, 50, 0.6);
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid rgba(150, 150, 150, 0.3);
}

.talent-desc {
  font-size: 0.78rem;
  color: #999;
  line-height: 1.3;
}

.talent-effect {
  font-size: 0.78rem;
  color: #999;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(10, 25, 40, 0.7);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(120, 120, 120, 0.35);
  margin-top: 4px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #555, #888, #555);
  background-size: 200% 100%;
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(100, 100, 100, 0.5);
  transition: width 0.4s ease;
}

.upgrade-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #444, #333);
  border: 1.5px solid rgba(170, 170, 170, 0.5);
  color: #ddd;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}

.upgrade-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #555, #444);
  border-color: rgba(200, 200, 200, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px);
}

.upgrade-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.upgrade-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 30, 30, 0.6);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #555, #444);
  border-radius: 3px;
  border: 1px solid rgba(150, 150, 150, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #666, #555);
}
</style>
