<template>
  <div v-if="modelValue" class="sidebar-overlay" @click.self="close">
    <div class="sidebar-panel" :class="{ 'sidebar-open': modelValue }">
      <div class="sidebar-header">
        <h2 class="sidebar-title">🔮 符文系统</h2>
        <button class="sidebar-close" @click="close">✕</button>
      </div>

      <div class="sidebar-body">
        <div class="section shop-section">
          <button class="shop-btn" @click="showRuneShop = true">
            <span class="shop-btn-icon">💎</span>
            <span>购买符文（10钻石）</span>
          </button>
        </div>

        <div v-if="showRuneShop" class="shop-modal-overlay" @click.self="showRuneShop = false">
          <div class="shop-modal">
            <div class="shop-modal-header">
              <h3>💎 符文商店</h3>
              <button class="shop-modal-close" @click="showRuneShop = false">✕</button>
            </div>
            <div class="shop-modal-body">
              <div class="shop-diamond-row">
                <span>当前钻石：</span>
                <span class="shop-diamond-value">{{ playerStore.diamond }} 💎</span>
              </div>
              <div class="shop-grid">
                <div
                  v-for="type in runeTypesList"
                  :key="type.id"
                  class="shop-item"
                  :style="{ borderColor: type.color + '88', '--type-color': type.color }"
                  @click="buyRune(type.id)"
                >
                  <span class="shop-item-icon">{{ type.icon }}</span>
                  <span class="shop-item-name" :style="{ color: type.color }">{{ type.name }}</span>
                  <span class="shop-item-price">10 💎</span>
                </div>
              </div>
            </div>
            <p v-if="buyMessage" class="shop-message">{{ buyMessage }}</p>
          </div>
        </div>

        <div class="section equip-section">
          <h3 class="section-title">⬆️ 已装备符文（12个槽位）</h3>
          <div class="equip-grid">
            <div
              v-for="(rune, idx) in activeRunes"
              :key="'eq-' + idx"
              class="equip-slot"
              :class="{
                'equip-slot-filled': rune,
                'equip-slot-empty': !rune,
              }"
              :style="rune ? { borderColor: getTypeColor(rune.type) + 'aa', '--slot-color': getTypeColor(rune.type) } : {}"
              @click="handleEquipSlotClick(idx)"
            >
              <template v-if="rune">
                <span class="equip-rune-icon">{{ getTypeIcon(rune.type) }}</span>
                <span class="equip-rune-level">Lv.{{ rune.level }}</span>
              </template>
              <template v-else>
                <span class="equip-slot-empty-text">空</span>
              </template>
            </div>
          </div>
        </div>

        <div class="section actions-section">
          <button
            class="action-btn compose-btn"
            :disabled="!canCompose"
            @click="handleCompose"
          >
            🔄 合成（选中2个同级符文）
          </button>
          <button
            class="action-btn compose-all-btn"
            @click="onComposeAll"
          >
            ⚡ 一键合成
          </button>
          <button
            class="action-btn disassemble-btn"
            :disabled="!selectedForDisassemble"
            @click="handleDisassemble"
          >
            💎 分解选中符文
          </button>
        </div>

        <div class="section inventory-section">
          <h3 class="section-title">
            📦 符文背包（{{ runeStore.runes.length }}/100）
          </h3>
          <div class="inventory-grid">
            <div
              v-for="slotIdx in 100"
              :key="'inv-' + slotIdx"
              class="inv-slot"
              :class="{
                'inv-slot-filled': runeStore.runes[slotIdx - 1],
                'inv-slot-selected-compose': isSelectedForCompose(runeStore.runes[slotIdx - 1]?.id),
                'inv-slot-selected-disassemble': selectedForDisassemble === runeStore.runes[slotIdx - 1]?.id,
                'inv-slot-equipped': isEquipped(runeStore.runes[slotIdx - 1]?.id),
              }"
              :style="runeStore.runes[slotIdx - 1]
                ? { borderColor: getTypeColor(runeStore.runes[slotIdx - 1].type) + '88', '--slot-color': getTypeColor(runeStore.runes[slotIdx - 1].type) }
                : {}"
              @click="handleInventorySlotClick(slotIdx - 1)"
            >
              <template v-if="runeStore.runes[slotIdx - 1]">
                <span class="inv-rune-icon">{{ getTypeIcon(runeStore.runes[slotIdx - 1].type) }}</span>
                <span class="inv-rune-level">{{ runeStore.runes[slotIdx - 1].level }}</span>
                <span v-if="isEquipped(runeStore.runes[slotIdx - 1].id)" class="inv-equipped-badge">装</span>
                <span v-if="isSelectedForCompose(runeStore.runes[slotIdx - 1].id)" class="inv-select-badge compose-badge">合</span>
                <span v-if="selectedForDisassemble === runeStore.runes[slotIdx - 1].id" class="inv-select-badge disassemble-badge">分</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </div>

    <div v-if="showRuneDetail" class="detail-overlay" @click.self="showRuneDetail = null">
      <div class="detail-panel">
        <div class="detail-header">
          <h3>{{ showRuneDetail.rune.name || getTypeInfo(showRuneDetail.rune.type)?.name || '符文' }}</h3>
        </div>
        <div class="detail-icon-wrap">
          <span class="detail-large-icon">{{ getTypeIcon(showRuneDetail.rune.type) }}</span>
        </div>
        <div class="detail-rune-level">等级: Lv.{{ showRuneDetail.rune.level }}</div>
        <div class="detail-stats">
          <div v-for="(val, key) in getRuneBonusDetail(showRuneDetail.rune)" :key="key" class="detail-stat-row">
            <span>{{ runeBonusLabelMap[key] || key }}</span>
            <span class="detail-stat-val">+{{ val }}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="detail-btn unequip-btn" @click="onUnequipFromDetail">卸下</button>
        </div>
        <button class="detail-close" @click="showRuneDetail = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuneStore } from '@/stores/rune'
import { usePlayerStore } from '@/stores/player'
import { RUNE_TYPES, RUNE_LEVELS, RUNE_BONUS } from '@/data/runes'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const runeStore = useRuneStore()
const playerStore = usePlayerStore()

const selectedForCompose = ref([])
const selectedForDisassemble = ref(null)
const showRuneShop = ref(false)
const buyMessage = ref('')
const toastMsg = ref('')
let toastTimer = null

const showRuneDetail = ref(null)

const runeBonusLabelMap = {
  attack: '攻击力',
  defense: '防御力',
  maxHp: '生命值',
  speed: '速度',
  magic: '魔力',
  criticalRate: '暴击率',
  critDamage: '爆伤',
  dodgeRate: '闪避率',
  magicRegen: '魔力回复',
}

const runeTypesList = Object.values(RUNE_TYPES)
const activeRunes = computed(() => runeStore.activeRunes)

function close() {
  emit('update:modelValue', false)
}

function getTypeInfo(typeId) {
  return runeTypesList.find((t) => t.id === typeId) || null
}

function getTypeIcon(typeId) {
  const info = getTypeInfo(typeId)
  return info ? info.icon : '❓'
}

function getTypeColor(typeId) {
  const info = getTypeInfo(typeId)
  return info ? info.color : '#888888'
}

function isEquipped(runeId) {
  if (!runeId) return false
  return runeStore.activeRunes.some((r) => r && r.id === runeId)
}

function isSelectedForCompose(runeId) {
  if (!runeId) return false
  return selectedForCompose.value.includes(runeId)
}

const canCompose = computed(() => {
  if (selectedForCompose.value.length < 2) return false
  const runes = selectedForCompose.value
    .map((id) => runeStore.runes.find((r) => r.id === id))
    .filter(Boolean)
  if (runes.length < 2) return false
  const firstLevel = runes[0].level
  return runes.every((r) => r.level === firstLevel) && firstLevel < 10
})

function buyRune(typeId) {
  buyMessage.value = ''
  if (playerStore.diamond < 10) {
    buyMessage.value = '钻石不足！'
    return
  }

  playerStore.diamond -= 10
  const result = runeStore.buyRune(typeId)

  if (result) {
    const info = getTypeInfo(typeId)
    buyMessage.value = `成功购买 ${info ? info.name : '符文'}！`
  } else {
    playerStore.diamond += 10
    buyMessage.value = '符文数量已满（100个）！'
  }
}

function handleEquipSlotClick(slotIdx) {
  const rune = runeStore.activeRunes[slotIdx]
  if (rune) {
    showRuneDetail.value = { rune, slotIdx }
  } else {
    const available = runeStore.runes.find((r) => {
      if (!r) return false
      if (isEquipped(r.id)) return false
      if (isSelectedForCompose(r.id)) return false
      if (selectedForDisassemble.value === r.id) return false
      return true
    })
    if (available) {
      runeStore.equipRune(available.id, slotIdx)
      showToast(`已装备 ${getTypeIcon(available.type)}`)
    } else {
      showToast('背包中没有可装备的符文')
    }
  }
}

function handleInventorySlotClick(slotIdx) {
  const rune = runeStore.runes[slotIdx]

  if (!rune) {
    return
  }

  const runeId = rune.id

  if (selectedForDisassemble.value === runeId) {
    selectedForDisassemble.value = null
    return
  }

  if (isSelectedForCompose(runeId)) {
    selectedForCompose.value = selectedForCompose.value.filter((id) => id !== runeId)
    selectedForDisassemble.value = runeId
    return
  }

  if (selectedForCompose.value.length < 2) {
    selectedForCompose.value = [...selectedForCompose.value, runeId]
    if (selectedForDisassemble.value === runeId) {
      selectedForDisassemble.value = null
    }
    return
  }

  if (isEquipped(runeId)) {
    const slotIdx2 = runeStore.activeRunes.findIndex((r) => r && r.id === runeId)
    if (slotIdx2 !== -1) {
      showRuneDetail.value = { rune, slotIdx: slotIdx2 }
    }
    return
  }

  const emptySlot = runeStore.activeRunes.findIndex((r) => !r)
  if (emptySlot !== -1) {
    runeStore.equipRune(runeId, emptySlot)
    showToast(`已装备 ${getTypeIcon(rune.type)}`)
  } else {
    showToast('所有符文槽已满')
  }
}

function handleCompose() {
  if (!canCompose.value) return

  const success = runeStore.composeRunes(selectedForCompose.value)
  if (success) {
    selectedForCompose.value = []
    selectedForDisassemble.value = null
  }
}

function handleDisassemble() {
  const runeId = selectedForDisassemble.value
  if (!runeId) return

  runeStore.disassembleRune(runeId)

  selectedForCompose.value = selectedForCompose.value.filter((id) => id !== runeId)
  selectedForDisassemble.value = null
}

function onComposeAll() {
  const result = runeStore.composeAll()
  showToast(result.message)
}

function getRuneBonusDetail(rune) {
  if (!rune) return {}
  const bonus = RUNE_BONUS[rune.type]
  if (!bonus) return {}
  const lvl = rune.level || 1
  const result = {}
  for (const [key, baseVal] of Object.entries(bonus.base)) {
    const perLevelVal = bonus.perLevel[key] || 0
    let val = baseVal + perLevelVal * (lvl - 1)
    if (key === 'criticalRate' || key === 'dodgeRate' || key === 'critDamage') {
      result[key] = (val * 100).toFixed(1) + '%'
    } else if (key === 'magicRegen') {
      result[key] = val.toFixed(1) + '/回合'
    } else {
      result[key] = Math.floor(val)
    }
  }
  return result
}

function onUnequipFromDetail() {
  if (!showRuneDetail.value) return
  const { rune, slotIdx } = showRuneDetail.value
  runeStore.unequipRune(slotIdx)
  selectedForCompose.value = selectedForCompose.value.filter((id) => id !== rune.id)
  if (selectedForDisassemble.value === rune.id) {
    selectedForDisassemble.value = null
  }
  showToast('符文已卸下')
  showRuneDetail.value = null
}

function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMsg.value = ''
  }, 2000)
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 12, 28, 0.7);
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-panel {
  width: 340px;
  height: 85vh;
  max-height: 85vh;
  background: linear-gradient(180deg, #0a1e35 0%, #08172b 30%, #061220 100%);
  border: 2px solid rgba(100, 180, 230, 0.35);
  border-radius: 20px;
  box-shadow:
    6px 0 30px rgba(0, 0, 0, 0.6),
    2px 0 20px rgba(60, 140, 210, 0.15);
  display: flex;
  flex-direction: column;
  transform: scale(0.9);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  overflow: hidden;
}

.sidebar-open {
  transform: scale(1);
  opacity: 1;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  background: linear-gradient(180deg, rgba(20, 55, 95, 0.9), rgba(8, 30, 55, 0.95));
  border-bottom: 1px solid rgba(80, 160, 220, 0.35);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #e0f0ff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(100, 180, 255, 0.3);
  letter-spacing: 1px;
  margin: 0;
}

.sidebar-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-close:hover {
  background: rgba(255, 80, 80, 0.25);
  border-color: rgba(255, 100, 100, 0.6);
  color: #ff8888;
}

.sidebar-close:active {
  transform: scale(0.9);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-body::-webkit-scrollbar {
  width: 4px;
}

.sidebar-body::-webkit-scrollbar-thumb {
  background: rgba(80, 150, 200, 0.4);
  border-radius: 4px;
}

.section {
  background: rgba(10, 30, 55, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(60, 130, 190, 0.25);
  padding: 12px;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #b8d8f8;
  margin: 0 0 10px 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
}

.shop-btn {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(20, 80, 130, 0.7), rgba(8, 40, 75, 0.8));
  border: 1.5px solid rgba(100, 190, 255, 0.5);
  color: #daf0ff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(180, 220, 255, 0.2);
}

.shop-btn:hover {
  background: linear-gradient(145deg, rgba(30, 100, 160, 0.75), rgba(12, 55, 95, 0.85));
  border-color: rgba(130, 210, 255, 0.7);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(80, 180, 255, 0.2),
    inset 0 1px 3px rgba(200, 235, 255, 0.25);
}

.shop-btn:active {
  transform: scale(0.97);
}

.shop-btn-icon {
  font-size: 1.1rem;
}

.shop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 5, 15, 0.8);
  z-index: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-modal {
  background: linear-gradient(160deg, #0f2845 0%, #091d32 50%, #061524 100%);
  border-radius: 20px;
  border: 2px solid rgba(100, 180, 230, 0.4);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(60, 150, 220, 0.15);
  max-width: 360px;
  width: 90%;
  overflow: hidden;
}

.shop-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: rgba(15, 45, 75, 0.9);
  border-bottom: 1px solid rgba(80, 160, 220, 0.3);
}

.shop-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #daf0ff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.shop-modal-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(120, 180, 220, 0.35);
  color: #b0d0f0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.shop-modal-close:hover {
  background: rgba(255, 60, 60, 0.2);
  border-color: rgba(255, 90, 90, 0.5);
}

.shop-modal-body {
  padding: 16px;
}

.shop-diamond-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 0.9rem;
  color: #c0daf8;
}

.shop-diamond-value {
  font-weight: 700;
  color: #aadcff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: 14px;
  background: rgba(15, 40, 70, 0.7);
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.2s;
}

.shop-item:hover {
  background: rgba(25, 60, 100, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px var(--type-color);
}

.shop-item:active {
  transform: scale(0.95);
}

.shop-item-icon {
  font-size: 1.6rem;
}

.shop-item-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.shop-item-price {
  font-size: 0.75rem;
  color: #c0daf8;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 8px;
}

.shop-message {
  margin: 10px 0 0 0;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: #a0e8c0;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.equip-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.equip-slot {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1.5px solid rgba(60, 130, 190, 0.35);
  background: rgba(5, 20, 40, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.equip-slot:hover {
  background: rgba(15, 40, 70, 0.8);
  border-color: rgba(100, 180, 230, 0.6);
  box-shadow: 0 0 15px rgba(60, 150, 220, 0.15);
}

.equip-slot:active {
  transform: scale(0.95);
}

.equip-slot-filled {
  background: rgba(10, 30, 60, 0.8);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 10px var(--slot-color);
}

.equip-rune-icon {
  font-size: 1.4rem;
}

.equip-rune-level {
  font-size: 0.65rem;
  font-weight: 700;
  color: #c0e0ff;
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 6px;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.equip-slot-empty-text {
  font-size: 0.75rem;
  color: #5a7a9a;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  border: 1.5px solid;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.action-btn:not(:disabled):active {
  transform: scale(0.97);
}

.compose-btn {
  background: linear-gradient(145deg, rgba(30, 90, 60, 0.7), rgba(10, 50, 30, 0.8));
  border-color: rgba(60, 200, 120, 0.45);
  color: #c0f0d0;
}

.compose-btn:not(:disabled):hover {
  background: linear-gradient(145deg, rgba(40, 110, 75, 0.75), rgba(15, 65, 40, 0.85));
  border-color: rgba(80, 230, 140, 0.6);
  box-shadow: 0 4px 15px rgba(40, 160, 80, 0.2);
}

.compose-all-btn {
  background: linear-gradient(145deg, rgba(30, 70, 100, 0.7), rgba(10, 40, 60, 0.8));
  border-color: rgba(100, 180, 255, 0.5);
  color: #c0e0ff;
}

.compose-all-btn:hover {
  background: linear-gradient(145deg, rgba(40, 90, 130, 0.75), rgba(15, 55, 80, 0.85));
  border-color: rgba(130, 210, 255, 0.7);
  box-shadow: 0 4px 15px rgba(60, 150, 220, 0.25);
}

.compose-all-btn:active {
  transform: scale(0.97);
}

.disassemble-btn {
  background: linear-gradient(145deg, rgba(90, 40, 90, 0.7), rgba(55, 20, 55, 0.8));
  border-color: rgba(180, 90, 220, 0.45);
  color: #e0c0f8;
}

.disassemble-btn:not(:disabled):hover {
  background: linear-gradient(145deg, rgba(110, 50, 110, 0.75), rgba(70, 30, 70, 0.85));
  border-color: rgba(200, 110, 240, 0.6);
  box-shadow: 0 4px 15px rgba(140, 60, 200, 0.2);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
}

.inv-slot {
  aspect-ratio: 1;
  border-radius: 5px;
  border: 1px solid rgba(50, 110, 160, 0.3);
  background: rgba(4, 16, 32, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.15s;
}

.inv-slot:hover {
  border-color: rgba(80, 160, 220, 0.6);
  background: rgba(10, 30, 55, 0.8);
  z-index: 2;
}

.inv-slot:active {
  transform: scale(0.9);
}

.inv-slot-filled {
  border-color: rgba(60, 130, 190, 0.4);
}

.inv-slot-equipped {
  background: rgba(10, 35, 65, 0.85);
  box-shadow: inset 0 0 6px rgba(80, 180, 255, 0.2);
}

.inv-slot-selected-compose {
  border-color: rgba(60, 220, 120, 0.7) !important;
  background: rgba(15, 60, 35, 0.7) !important;
  box-shadow: 0 0 8px rgba(40, 180, 80, 0.35) !important;
}

.inv-slot-selected-disassemble {
  border-color: rgba(200, 100, 240, 0.7) !important;
  background: rgba(45, 15, 55, 0.7) !important;
  box-shadow: 0 0 8px rgba(160, 70, 220, 0.35) !important;
}

.inv-rune-icon {
  font-size: 0.7rem;
  line-height: 1;
}

.inv-rune-level {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 0.45rem;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  padding: 0 2px;
  border-radius: 2px;
  line-height: 1.2;
}

.inv-equipped-badge {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.45rem;
  font-weight: 700;
  color: #a0d8ff;
  background: rgba(20, 60, 100, 0.9);
  padding: 0 2px;
  border-radius: 0 0 4px 0;
  line-height: 1.3;
}

.inv-select-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.45rem;
  font-weight: 700;
  padding: 0 2px;
  border-radius: 0 0 0 4px;
  line-height: 1.3;
}

.compose-badge {
  color: #a0f0b0;
  background: rgba(20, 100, 50, 0.9);
}

.disassemble-badge {
  color: #e0b0f8;
  background: rgba(80, 20, 100, 0.9);
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 30, 50, 0.95);
  border: 1px solid rgba(100, 180, 220, 0.5);
  color: #d0e8ff;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 1100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: toastFadeIn 0.3s ease;
  pointer-events: none;
}

@keyframes toastFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-panel {
  width: 85%;
  max-width: 300px;
  background: linear-gradient(135deg, #0f2845, #091d32);
  border-radius: 20px;
  border: 2px solid rgba(100, 180, 230, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(60, 150, 220, 0.2);
  padding: 20px;
  position: relative;
}

.detail-header h3 {
  font-size: 1.1rem;
  color: #fff;
  text-align: center;
  margin: 0 0 4px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.detail-icon-wrap {
  text-align: center;
  margin: 12px 0;
}

.detail-large-icon {
  font-size: 2.5rem;
}

.detail-rune-level {
  text-align: center;
  font-size: 0.9rem;
  color: #ffd76e;
  font-weight: 600;
  margin-bottom: 10px;
}

.detail-stats {
  margin: 10px 0;
}

.detail-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.85rem;
  color: rgba(200, 225, 255, 0.85);
  border-bottom: 1px solid rgba(100, 160, 200, 0.15);
}

.detail-stat-val {
  font-weight: 700;
  color: #7bed9f;
}

.detail-actions {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

.detail-btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid;
}

.unequip-btn {
  background: rgba(180, 100, 40, 0.35);
  border-color: rgba(220, 150, 60, 0.5);
  color: #ffc478;
}

.unequip-btn:hover {
  background: rgba(200, 120, 50, 0.45);
  border-color: rgba(240, 170, 70, 0.7);
  box-shadow: 0 0 15px rgba(220, 150, 60, 0.3);
}

.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
  border: 1px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.detail-close:hover {
  background: rgba(40, 80, 120, 0.9);
  transform: scale(1.1);
}
</style>
