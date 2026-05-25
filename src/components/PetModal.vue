<template>
  <div v-if="modelValue" class="pet-modal-overlay" @click.self="close">
    <div class="pet-modal-content">
      <div class="pet-modal-header">
        <h2 class="pet-modal-title">🐾 宠物背包</h2>
        <button
          class="header-action-btn sort-btn"
          @click="handleSort"
          title="整理"
        >📦 整理</button>
        <button
          :class="['header-action-btn', 'release-btn', { active: isReleaseMode }]"
          @click="toggleReleaseMode"
          title="放生"
        >🗑️ 放生</button>
        <button class="pet-modal-close" @click="close">✕</button>
      </div>

      <div class="pet-modal-body">
        <div class="active-pets-section">
          <div class="section-label">⬆️ 出战宠物（点击宠物设为出战）</div>
          <div class="active-pets-slots">
            <div
              v-for="(pet, idx) in activePets"
              :key="idx"
              :class="['active-pet-slot', { occupied: pet }]"
              @click="handleActiveSlotClick(idx)"
            >
              <template v-if="pet">
                <img
                  :src="pet.img"
                  :alt="pet.name"
                  class="active-pet-img"
                />
                <div class="active-pet-name">{{ pet.name }}</div>
                <span :class="['rarity-badge', rarityColorClass(pet.rarity)]">
                  {{ rarityLabel(pet.rarity) }}
                </span>
                <div class="active-pet-stats">
                  <span class="stat-hp">❤️{{ pet.hp }}</span>
                  <span class="stat-atk">⚔️{{ pet.atk }}</span>
                </div>
              </template>
              <template v-else>
                <div class="empty-slot-icon">🐾</div>
                <div class="empty-slot-text">空位</div>
              </template>
            </div>
          </div>
        </div>

        <div class="pet-storage-section">
          <div class="section-label">
            📦 宠物仓库（{{ pets.length }}/60格）
          </div>
          <div class="pet-grid">
            <div
              v-for="i in 60"
              :key="i"
              :class="['pet-grid-cell', {
                occupied: pets[i - 1],
                marked: isReleaseMode && pets[i - 1] && releaseConfirmList.includes(pets[i - 1].id),
                active: pets[i - 1] && isPetActive(pets[i - 1].id)
              }]"
              @click="pets[i - 1] && handlePetClick(pets[i - 1])"
            >
              <template v-if="pets[i - 1]">
                <img
                  :src="pets[i - 1].img"
                  :alt="pets[i - 1].name"
                  class="grid-pet-img"
                />
                <div class="grid-pet-name" :style="{ color: rarityColor(pets[i - 1].rarity) }">
                  {{ pets[i - 1].name }}
                </div>
                <div class="grid-pet-level">Lv.{{ pets[i - 1].level }}</div>
                <div class="grid-pet-stats">
                  <span class="grid-stat-hp">❤️{{ pets[i - 1].hp }}</span>
                  <span class="grid-stat-atk">⚔️{{ pets[i - 1].atk }}</span>
                </div>
                <div v-if="isReleaseMode && releaseConfirmList.includes(pets[i - 1].id)" class="release-mark">
                  ✕
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showConfirmDialog" class="confirm-overlay" @click.self="cancelRelease">
        <div class="confirm-dialog">
          <div class="confirm-title">⚠️ 确认放生</div>
          <div class="confirm-text">
            确定要放生选中的 {{ releaseConfirmList.length }} 只宠物吗？<br/>
            此操作不可撤销！
          </div>
          <div class="confirm-actions">
            <button class="confirm-btn cancel-btn" @click="cancelRelease">取消</button>
            <button class="confirm-btn confirm-btn-danger" @click="confirmRelease">确认放生</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="previewPet" class="pet-preview-overlay" @click.self="closePreview">
      <div class="pet-preview-modal">
        <div class="pet-preview-header">
          <img :src="'/image/monster/' + previewPet.img" class="pet-preview-img" @error="$event.target.src='/image/monster/雪绒兔.webp'" />
          <div class="pet-preview-title">
            <span class="pet-preview-name">{{ previewPet.name }}</span>
            <span class="pet-preview-rarity" :class="'rarity-' + (previewPet.rarity || '普通')">{{ previewPet.rarity || '普通' }}</span>
          </div>
        </div>
        <div class="pet-preview-stats">
          <div class="pet-stat-row"><span>❤️ 生命</span><span>{{ previewPet.maxHp || previewPet.hp }}</span></div>
          <div class="pet-stat-row"><span>⚔️ 攻击</span><span>{{ previewPet.atk }}</span></div>
          <div class="pet-stat-row"><span>🛡️ 防御</span><span>{{ previewPet.def || 0 }}</span></div>
          <div class="pet-stat-row"><span>⚡ 速度</span><span>{{ previewPet.atkSpeed || 1.0 }}</span></div>
          <div class="pet-stat-row"><span>📊 等级</span><span>Lv.{{ previewPet.level || 1 }}</span></div>
        </div>
        <div class="pet-preview-actions">
          <button class="pet-preview-btn deploy-btn" @click="confirmDeploy">⚔️ 出战</button>
          <button class="pet-preview-btn cancel-btn" @click="closePreview">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePetStore } from '@/stores/pet'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const petStore = usePetStore()

const pets = computed(() => petStore.pets)
const activePets = computed(() => petStore.activePets)

const isReleaseMode = ref(false)
const releaseConfirmList = ref([])
const showConfirmDialog = ref(false)
const previewPet = ref(null)

const rarityMap = {
  common: { label: '普通', color: '#9ca3af' },
  uncommon: { label: '优秀', color: '#4ade80' },
  rare: { label: '稀有', color: '#60a5fa' },
  epic: { label: '史诗', color: '#a78bfa' },
  legendary: { label: '传说', color: '#fbbf24' },
}

function rarityLabel(rarity) {
  return rarityMap[rarity]?.label || rarity || '未知'
}

function rarityColor(rarity) {
  return rarityMap[rarity]?.color || '#9ca3af'
}

function rarityColorClass(rarity) {
  return `rarity-${rarity || 'common'}`
}

function isPetActive(petId) {
  return activePets.value.some((ap) => ap && ap.id === petId)
}

function close() {
  isReleaseMode.value = false
  releaseConfirmList.value = []
  showConfirmDialog.value = false
  emit('update:modelValue', false)
}

function toggleReleaseMode() {
  isReleaseMode.value = !isReleaseMode.value
  releaseConfirmList.value = []
}

function findEmptyActiveSlot() {
  return activePets.value.findIndex((ap) => ap === null)
}

function handlePetClick(pet) {
  if (isReleaseMode.value) {
    const idx = releaseConfirmList.value.indexOf(pet.id)
    if (idx === -1) {
      releaseConfirmList.value.push(pet.id)
    } else {
      releaseConfirmList.value.splice(idx, 1)
    }
    if (releaseConfirmList.value.length > 0 && !showConfirmDialog.value) {
      showConfirmDialog.value = true
    }
    if (releaseConfirmList.value.length === 0) {
      showConfirmDialog.value = false
    }
    return
  }

  previewPet.value = pet
}

function handleActiveSlotClick(slotIndex) {
  if (isReleaseMode.value) return

  const pet = activePets.value[slotIndex]
  if (!pet) return

  petStore.setActivePet(null, slotIndex)
}

function confirmRelease() {
  releaseConfirmList.value.forEach((id) => {
    petStore.releasePet(id)
  })
  releaseConfirmList.value = []
  showConfirmDialog.value = false
  if (pets.value.length === 0) {
    isReleaseMode.value = false
  }
}

function cancelRelease() {
  showConfirmDialog.value = false
}

function handleSort() {
  petStore.sortPets('rarity')
}

function confirmDeploy() {
  if (!previewPet.value) return
  const emptySlot = findEmptyActiveSlot()
  if (emptySlot === -1) return
  petStore.setActivePet(previewPet.value.id, emptySlot)
  previewPet.value = null
}

function closePreview() {
  previewPet.value = null
}
</script>

<style scoped>
.pet-modal-overlay {
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
  animation: petFadeIn 0.2s ease-out;
}

@keyframes petFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pet-modal-content {
  width: 90%;
  max-width: 440px;
  max-height: 90vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  overflow-x: hidden;
  animation: petPopIn 0.25s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes petPopIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.pet-modal-content::-webkit-scrollbar {
  width: 5px;
}

.pet-modal-content::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.6);
  border-radius: 3px;
}

.pet-modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3a7098, #1a4a68);
  border-radius: 3px;
  border: 1px solid rgba(100, 160, 200, 0.3);
}

/* ---------- 头部 ---------- */
.pet-modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(100, 170, 220, 0.25);
  flex-shrink: 0;
}

.pet-modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e8f4ff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
  margin-right: auto;
}

.header-action-btn {
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid rgba(100, 160, 200, 0.35);
  background: rgba(15, 45, 70, 0.7);
  color: #c0ddf8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.header-action-btn:hover {
  background: rgba(25, 60, 95, 0.85);
  border-color: rgba(140, 200, 255, 0.6);
  color: #fff;
  transform: translateY(-1px);
}

.header-action-btn:active {
  transform: scale(0.95);
}

.release-btn.active {
  background: rgba(180, 50, 50, 0.7);
  border-color: rgba(220, 100, 100, 0.6);
  color: #ffcccc;
  box-shadow: 0 0 12px rgba(200, 60, 60, 0.3);
}

.pet-modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 45, 70, 0.7);
  border: 1.5px solid rgba(100, 160, 200, 0.35);
  color: #a0c8e8;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pet-modal-close:hover {
  transform: scale(1.1);
  background: rgba(30, 65, 100, 0.85);
  border-color: rgba(150, 210, 255, 0.6);
  color: #fff;
}

/* ---------- 内容区域 ---------- */
.pet-modal-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---------- 出战宠物区 ---------- */
.active-pets-section {
  background: linear-gradient(135deg, rgba(12, 40, 62, 0.5), rgba(6, 22, 38, 0.5));
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(100, 170, 220, 0.2);
}

.section-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #b8d8f4;
  margin-bottom: 10px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.active-pets-slots {
  display: flex;
  gap: 10px;
}

.active-pet-slot {
  flex: 1;
  min-height: 120px;
  background: linear-gradient(180deg, rgba(10, 30, 50, 0.7), rgba(4, 18, 32, 0.7));
  border-radius: 14px;
  border: 1.5px dashed rgba(80, 150, 200, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 6px;
  position: relative;
  overflow: hidden;
}

.active-pet-slot:hover {
  border-color: rgba(170, 170, 170, 0.5);
  background: linear-gradient(180deg, rgba(30, 30, 30, 0.8), rgba(15, 15, 15, 0.8));
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.4);
}

.active-pet-slot.occupied {
  border-style: solid;
  border-color: rgba(130, 130, 130, 0.45);
}

.active-pet-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
}

.active-pet-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e8f4ff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.rarity-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid;
}

.rarity-common {
  background: rgba(156, 163, 175, 0.25);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.5);
}

.rarity-uncommon {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.5);
}

.rarity-rare {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.5);
}

.rarity-epic {
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.5);
}

.rarity-legendary {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.active-pet-stats {
  display: flex;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 600;
}

.stat-hp {
  color: #ff8a8a;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.stat-atk {
  color: #ffb86c;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.empty-slot-icon {
  font-size: 1.6rem;
  opacity: 0.5;
}

.empty-slot-text {
  font-size: 0.7rem;
  color: rgba(160, 200, 230, 0.4);
}

/* ---------- 宠物仓库区 ---------- */
.pet-storage-section {
  background: linear-gradient(135deg, rgba(12, 40, 62, 0.5), rgba(6, 22, 38, 0.5));
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(100, 170, 220, 0.2);
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}

.pet-grid-cell {
  aspect-ratio: 1;
  background: linear-gradient(180deg, rgba(10, 30, 50, 0.6), rgba(4, 18, 32, 0.6));
  border-radius: 8px;
  border: 1px solid rgba(70, 140, 190, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: default;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  padding: 3px 2px;
}

.pet-grid-cell.occupied {
  cursor: pointer;
  border-color: rgba(130, 130, 130, 0.35);
}

.pet-grid-cell.occupied:hover {
  border-color: rgba(170, 170, 170, 0.55);
  background: linear-gradient(180deg, rgba(30, 30, 30, 0.75), rgba(15, 15, 15, 0.75));
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

.pet-grid-cell.occupied:active {
  transform: scale(0.93);
}

.pet-grid-cell.active {
  border-color: rgba(170, 170, 170, 0.55);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.pet-grid-cell.marked {
  border-color: rgba(220, 80, 80, 0.6);
  background: rgba(180, 40, 40, 0.25);
  box-shadow: 0 0 10px rgba(200, 50, 50, 0.3);
}

.grid-pet-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}

.grid-pet-name {
  font-size: 0.58rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.grid-pet-level {
  font-size: 0.55rem;
  font-weight: 600;
  color: #999;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.grid-pet-stats {
  display: flex;
  gap: 3px;
  font-size: 0.5rem;
  font-weight: 600;
}

.grid-stat-hp {
  color: #ff8a8a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.grid-stat-atk {
  color: #ffb86c;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.release-mark {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(220, 60, 60, 0.9);
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- 确认弹窗 ---------- */
.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  z-index: 10;
  animation: petFadeIn 0.15s ease-out;
}

.confirm-dialog {
  background: linear-gradient(135deg, rgba(15, 40, 60, 0.98), rgba(8, 24, 40, 0.98));
  border-radius: 16px;
  border: 1.5px solid rgba(200, 100, 100, 0.5);
  padding: 20px 24px;
  max-width: 300px;
  text-align: center;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(200, 60, 60, 0.2);
  animation: petPopIn 0.2s ease-out;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffb8b8;
  margin-bottom: 10px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.confirm-text {
  font-size: 0.85rem;
  color: #c8dcee;
  margin-bottom: 16px;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-btn {
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid;
}

.cancel-btn {
  background: rgba(50, 50, 50, 0.7);
  border-color: rgba(150, 150, 150, 0.4);
  color: #aaa;
}

.cancel-btn:hover {
  background: rgba(60, 60, 60, 0.85);
  border-color: rgba(180, 180, 180, 0.6);
}

.confirm-btn-danger {
  background: rgba(180, 50, 50, 0.75);
  border-color: rgba(220, 100, 100, 0.5);
  color: #ffcccc;
}

.confirm-btn-danger:hover {
  background: rgba(200, 60, 60, 0.85);
  border-color: rgba(240, 120, 120, 0.7);
  box-shadow: 0 0 15px rgba(200, 60, 60, 0.35);
}

.confirm-btn:active {
  transform: scale(0.95);
}

/* ---------- 移动端响应式 ---------- */
@media (max-width: 440px) {
  .pet-modal-content {
    max-width: 95%;
    max-height: 85vh;
    border-radius: 16px;
  }

  .pet-modal-header {
    padding: 10px 12px;
    gap: 4px;
  }

  .pet-modal-title {
    font-size: 0.95rem;
  }

  .header-action-btn {
    padding: 5px 8px;
    font-size: 0.72rem;
  }

  .pet-modal-body {
    padding: 10px 12px;
    gap: 12px;
  }

  .active-pet-slot {
    min-height: 100px;
  }

  .active-pet-img {
    width: 40px;
    height: 40px;
  }

  .pet-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
  }

  .grid-pet-img {
    width: 28px;
    height: 28px;
  }

  .grid-pet-name {
    font-size: 0.52rem;
  }
}

/* ---------- 宠物属性预览弹窗 ---------- */
.pet-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.pet-preview-modal {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px;
  padding: 20px;
  min-width: 260px;
  max-width: 90%;
  border: 2px solid rgba(100, 160, 220, 0.4);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.pet-preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pet-preview-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.pet-preview-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pet-preview-name {
  font-size: 16px;
  font-weight: 600;
  color: #d0e8f0;
}

.pet-preview-rarity {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.rarity-普通 { background: rgba(150, 150, 150, 0.2); color: #aaa; }
.rarity-稀有 { background: rgba(100, 160, 255, 0.2); color: #70a1ff; }
.rarity-精英 { background: rgba(160, 100, 255, 0.2); color: #a29bfe; }
.rarity-史诗 { background: rgba(255, 160, 50, 0.2); color: #ffa032; }
.rarity-传说 { background: rgba(255, 215, 0, 0.2); color: #ffd700; }

.pet-preview-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.pet-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #a0c4e8;
}

.pet-stat-row span:last-child {
  color: #d0e8f0;
  font-weight: 600;
}

.pet-preview-actions {
  display: flex;
  gap: 10px;
}

.pet-preview-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(100, 160, 220, 0.4);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deploy-btn {
  background: linear-gradient(135deg, #1a5a3c, #2a8a5c);
  color: #7bed9f;
  border-color: rgba(100, 200, 150, 0.5);
}

.deploy-btn:hover {
  background: linear-gradient(135deg, #2a8a5c, #3aba7c);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #8a9aaa;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
