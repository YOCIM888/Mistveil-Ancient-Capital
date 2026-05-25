<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content dungeon-modal">
      <div class="modal-header">
        <h2 class="modal-title">⚔️ 地宫挑战 ⚔️</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>
      <div class="modal-body dungeon-body">
        <div v-for="(zone, zoneIdx) in DUNGEON_ZONES" :key="zoneIdx" class="zone-section">
          <div class="zone-title">{{ zone.floors }}({{ zone.name }})</div>
          <div class="floor-grid">
            <div
              v-for="floorNum in getZoneFloors(zoneIdx)"
              :key="floorNum"
              class="floor-cell"
              :class="floorCellClass(floorNum)"
              @click="onFloorClick(floorNum)"
            >
              <div class="floor-badge">
                <span v-if="isBossFloor(floorNum)" class="floor-type-icon boss-icon">👑</span>
                <span v-else-if="isEliteFloor(floorNum)" class="floor-type-icon elite-icon">⭐</span>
              </div>
              <span class="floor-num">{{ floorNum }}</span>
              <span class="floor-monster" v-if="getMonsterName(floorNum)">{{ getMonsterName(floorNum) }}</span>
              <span v-if="isCleared(floorNum)" class="floor-cleared">✓</span>
              <span v-else-if="!isUnlocked(floorNum)" class="floor-locked">🔒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DUNGEON_ZONES } from '@/data/dungeons'
import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS } from '@/data/monsters'
import { useDungeonStore } from '@/stores/dungeon'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'startBattle'])

const dungeonStore = useDungeonStore()
const playerStore = usePlayerStore()

function close() {
  emit('update:modelValue', false)
}

function getZoneFloors(zoneIdx) {
  const start = zoneIdx * 10 + 1
  const end = (zoneIdx + 1) * 10
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function isBossFloor(floorNum) {
  return floorNum % 10 === 0
}

function isEliteFloor(floorNum) {
  return floorNum % 5 === 0 && floorNum % 10 !== 0
}

function getMonsterName(floorNum) {
  if (isBossFloor(floorNum)) {
    return BOSS_MONSTERS[floorNum]?.name || ''
  }
  if (isEliteFloor(floorNum)) {
    return ELITE_MONSTERS[floorNum]?.name || ''
  }
  return MONSTERS[floorNum]?.name || ''
}

function isCleared(floorNum) {
  return dungeonStore.isFloorCleared(floorNum)
}

function isUnlocked(floorNum) {
  if (floorNum === 1) return true
  return isCleared(floorNum - 1)
}

function floorCellClass(floorNum) {
  return {
    'floor-cleared-cell': isCleared(floorNum),
    'floor-locked-cell': !isUnlocked(floorNum),
    'floor-boss-cell': isBossFloor(floorNum),
    'floor-elite-cell': isEliteFloor(floorNum),
    'floor-unlocked-cell': isUnlocked(floorNum) && !isCleared(floorNum),
  }
}

function onFloorClick(floorNum) {
  if (!isUnlocked(floorNum)) return
  emit('startBattle', { mode: 'dungeon', floor: floorNum })
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

.dungeon-modal {
  width: 92%;
  max-width: 480px;
  height: 85vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), 0 0 12px rgba(120, 180, 220, 0.4);
  margin: 0;
  letter-spacing: 1px;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.modal-body {
  padding: 16px 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.6);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

.zone-section {
  margin-bottom: 20px;
}

.zone-section:last-child {
  margin-bottom: 0;
}

.zone-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c0ddf0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  padding: 8px 14px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, rgba(15, 50, 75, 0.7), rgba(8, 25, 40, 0.8));
  border-radius: 10px;
  border: 1px solid rgba(100, 160, 200, 0.35);
  letter-spacing: 0.5px;
}

.floor-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.floor-cell {
  aspect-ratio: 1;
  background: linear-gradient(145deg, rgba(15, 45, 60, 0.8), rgba(6, 22, 35, 0.9));
  border: 2px solid rgba(70, 130, 170, 0.4);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding: 4px;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(40, 90, 130, 0.1);
}

.floor-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 30%, rgba(100, 180, 220, 0.15), transparent 70%);
  pointer-events: none;
}

.floor-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  line-height: 1;
}

.floor-type-icon {
  font-size: 0.7rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.floor-num {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0f0ff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  line-height: 1.2;
}

.floor-monster {
  font-size: 0.55rem;
  color: #9cc8e0;
  text-align: center;
  line-height: 1.1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.floor-cleared {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.65rem;
  color: #5eff8a;
  text-shadow: 0 0 6px rgba(80, 255, 100, 0.6);
  font-weight: 700;
}

.floor-locked {
  font-size: 0.7rem;
  opacity: 0.8;
}

.floor-unlocked-cell {
  border-color: rgba(100, 160, 200, 0.6);
}

.floor-unlocked-cell:hover {
  transform: translateY(-3px);
  border-color: rgba(140, 200, 240, 0.8);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(100, 180, 255, 0.3),
    inset 0 0 20px rgba(60, 120, 170, 0.15);
}

.floor-unlocked-cell:active {
  transform: translateY(0);
}

.floor-cleared-cell {
  border-color: rgba(80, 200, 120, 0.6);
  background: linear-gradient(145deg, rgba(10, 50, 30, 0.6), rgba(6, 25, 20, 0.7));
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(80, 200, 120, 0.15),
    inset 0 0 15px rgba(50, 150, 80, 0.1);
}

.floor-cleared-cell:hover {
  transform: translateY(-2px);
  border-color: rgba(100, 220, 150, 0.7);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(80, 200, 120, 0.25);
}

.floor-boss-cell {
  border-color: rgba(220, 150, 50, 0.6);
  background: linear-gradient(145deg, rgba(55, 35, 10, 0.7), rgba(25, 15, 5, 0.85));
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.45),
    0 0 15px rgba(200, 150, 50, 0.2),
    inset 0 0 18px rgba(180, 120, 30, 0.08);
}

.floor-boss-cell .floor-num {
  color: #ffd76e;
  text-shadow: 0 0 8px rgba(255, 200, 60, 0.5);
}

.floor-boss-cell.floor-unlocked-cell:hover {
  border-color: rgba(240, 180, 60, 0.8);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(220, 160, 40, 0.35);
}

.floor-boss-cell.floor-cleared-cell {
  border-color: rgba(180, 200, 80, 0.6);
}

.floor-elite-cell {
  border-color: rgba(160, 120, 200, 0.55);
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(140, 100, 200, 0.15),
    inset 0 0 16px rgba(120, 80, 170, 0.06);
}

.floor-elite-cell.floor-unlocked-cell:hover {
  border-color: rgba(180, 140, 220, 0.8);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.5),
    0 0 22px rgba(150, 110, 210, 0.3);
}

.floor-locked-cell {
  border-color: rgba(50, 60, 70, 0.5);
  background: linear-gradient(145deg, rgba(8, 15, 22, 0.85), rgba(3, 8, 14, 0.92));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  cursor: not-allowed;
  opacity: 0.7;
}

.floor-locked-cell .floor-num {
  color: rgba(150, 170, 190, 0.5);
  text-shadow: none;
}

.floor-locked-cell .floor-monster {
  color: rgba(130, 150, 170, 0.35);
}

.floor-locked-cell:hover {
  transform: none;
}
</style>
