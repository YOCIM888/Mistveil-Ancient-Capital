<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🛒 装备商店</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="shop-body">
        <div class="shop-sidebar">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="sidebar-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.sideLabel || tab.label }}
          </div>
        </div>

        <div class="shop-main">
          <div class="items-grid">
        <div
          v-for="item in filteredItems"
          :key="item.name"
          class="item-card"
          :class="{ 'not-purchasable': item.price === null }"
          :style="item.rarity ? { borderColor: rarityColor(item.rarity) } : {}"
          @click="selectItem(item)"
        >
          <div class="item-image">
            <img v-if="item.img" :src="item.img" :alt="item.name" class="item-img" />
            <span v-else class="item-emoji">{{ item.icon || '❓' }}</span>
          </div>
          <div class="item-name" :style="item.rarity ? { color: rarityColor(item.rarity) } : {}">
            {{ item.name }}
          </div>
          <div v-if="item.props" class="item-props">
            <span
              v-for="(val, key) in item.props"
              :key="key"
              class="prop-tag"
            >{{ PROP_LABELS[key] || key }}+{{ val }}</span>
          </div>
          <div v-if="item.desc && !item.props" class="item-desc">{{ item.desc }}</div>
          <div class="item-price">
            <template v-if="item.price === null">
              <span class="not-sale-label">非卖品</span>
            </template>
            <template v-else>
              <span class="currency-icon">{{ currencyIcon(item.currency || 'gold') }}</span>
              <span class="price-value">{{ item.price }}</span>
            </template>
          </div>
        </div>

        <div v-if="filteredItems.length === 0" class="empty-hint">
          该分类暂无物品
        </div>
      </div>

      <div class="currency-bar">
        <div class="currency-item">
          <span class="currency-icon">💰</span>
          <span class="currency-value">{{ playerStore.gold }}</span>
        </div>
        <div class="currency-item">
          <span class="currency-icon">💎</span>
          <span class="currency-value">{{ playerStore.diamond }}</span>
        </div>
        <div class="currency-item">
          <span class="currency-icon">🪙</span>
          <span class="currency-value">{{ playerStore.evolutionCoin }}</span>
        </div>
      </div>
        </div>
      </div>
    </div>

    <div v-if="selectedItem" class="modal-overlay confirm-overlay" @click.self="selectedItem = null">
      <div class="confirm-modal">
        <div class="confirm-header">⚠️ 确认购买</div>
        <div class="confirm-body">
          <p class="confirm-name" :style="selectedItem.rarity ? { color: rarityColor(selectedItem.rarity) } : {}">
            {{ selectedItem.name }}
          </p>
          <p class="confirm-price">
            单价：<span class="currency-icon">{{ currencyIcon(selectedItem.currency || 'gold') }}</span>
            <strong>{{ selectedItem.price }}</strong>
          </p>
          <div v-if="!isEquipment(selectedItem)" class="qty-row">
            <span class="qty-label">数量：</span>
            <div class="qty-stepper">
              <button class="qty-btn" @click="purchaseQuantity > 1 && purchaseQuantity--" :disabled="purchaseQuantity <= 1">−</button>
              <span class="qty-value">{{ purchaseQuantity }}</span>
              <button class="qty-btn" @click="purchaseQuantity < maxAffordable && purchaseQuantity++" :disabled="purchaseQuantity >= maxAffordable">+</button>
            </div>
          </div>
          <p class="confirm-total">
            总价：<span class="currency-icon">{{ currencyIcon(selectedItem.currency || 'gold') }}</span>
            <strong>{{ selectedItem.price * purchaseQuantity }}</strong>
          </p>
        </div>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="selectedItem = null">取消</button>
          <button class="btn-confirm" @click="confirmPurchase">确认购买</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { EQUIPMENT, EQUIPMENT_RARITY } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { showToast } from '@/utils/toast'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()

const activeTab = ref('all')
const selectedItem = ref(null)
const purchaseQuantity = ref(1)

const equipmentList = Object.values(EQUIPMENT)
const itemList = Object.values(ITEMS)

const tabs = [
  { key: 'all', label: '全部', sideLabel: '全' },
  { key: 'classSet', label: '职业套装', sideLabel: '职' },
  { key: 'traveler', label: '旅人套', sideLabel: '旅' },
  { key: 'ocean', label: '🌊 洋流套', sideLabel: '洋' },
  { key: 'angel', label: '👼 天使套', sideLabel: '天' },
  { key: 'emperor', label: '帝套', sideLabel: '帝' },
  { key: 'dark', label: '💀 暗黑套', sideLabel: '暗' },
  { key: 'dragon', label: '🐉 龙神套', sideLabel: '龙' },
  { key: 'creation', label: '创世套', sideLabel: '世' },
  { key: 'items', label: '道具', sideLabel: '道' }
]

const PROP_LABELS = {
  attack: '攻击',
  defense: '防御',
  maxHp: '生命',
  speed: '速度',
  magic: '魔力',
  criticalRate: '暴击率',
  critDamage: '爆伤',
  dodgeRate: '闪避率',
  magicRegen: '魔力回复',
  goldBonus: '金币加成'
}

const filteredItems = computed(() => {
  switch (activeTab.value) {
    case 'all':
      return [...equipmentList, ...itemList]

    case 'classSet':
      return equipmentList.filter(
        e => e.class === playerStore.characterClass && e.rarity === EQUIPMENT_RARITY.PURPLE
      )

    case 'traveler':
      return equipmentList.filter(
        e => e.class === 'all' && e.rarity === EQUIPMENT_RARITY.BLUE && e.price !== null
      )

    case 'ocean':
      return equipmentList.filter(e => e.name.includes('洋流'))

    case 'angel':
      return equipmentList.filter(
        e => e.currency === 'diamond' && e.rarity === EQUIPMENT_RARITY.ORANGE && e.name.startsWith('天使')
      )

    case 'emperor':
      return equipmentList.filter(
        e => e.currency === 'evoCoin' && e.rarity === EQUIPMENT_RARITY.ORANGE && e.name.startsWith('帝')
      )

    case 'dark':
      return equipmentList.filter(e => e.name.includes('暗黑'))

    case 'dragon':
      return equipmentList.filter(e => e.name.includes('龙神'))

    case 'creation':
      return equipmentList.filter(e => e.name.includes('创世'))

    case 'items':
      return itemList

    default:
      return [...equipmentList, ...itemList]
  }
})

function rarityColor(rarity) {
  const map = {
    blue: '#4a9eff',
    purple: '#b44eff',
    orange: '#ff8c00',
    red: '#ff3344',
    common: '#aaa'
  }
  return map[rarity] || '#aaa'
}

const maxAffordable = computed(() => {
  const item = selectedItem.value
  if (!item || item.price === null || item.price === 0) return 1
  if (isEquipment(item)) return 1
  const currency = item.currency || 'gold'
  let balance = 0
  if (currency === 'gold') balance = playerStore.gold
  else if (currency === 'diamond') balance = playerStore.diamond
  else if (currency === 'evoCoin') balance = playerStore.evolutionCoin
  return Math.max(1, Math.floor(balance / item.price))
})

function currencyIcon(currency) {
  const map = {
    gold: '💰',
    diamond: '💎',
    evoCoin: '🪙'
  }
  return map[currency] || '💰'
}

function isEquipment(item) {
  return item.type && ['weapon', 'head', 'chest', 'legs', 'boots', 'accessory'].includes(item.type)
}

function selectItem(item) {
  if (item.price === null) return
  selectedItem.value = item
  purchaseQuantity.value = 1
}

function canAddToBackpack(item) {
  if (item.type === 'consumable' || item.type === 'material') {
    const existing = inventoryStore.backpackItems.find(
      i => i.name === item.name && i.type === item.type
    )
    if (existing) return true
  }
  return inventoryStore.backpackItems.length < inventoryStore.backpackCapacity
}

function confirmPurchase() {
  const item = selectedItem.value
  if (!item || item.price === null) return

  const currency = item.currency || 'gold'
  const qty = isEquipment(item) ? 1 : purchaseQuantity.value
  const totalPrice = item.price * qty

  let currentBalance = 0

  if (currency === 'gold') {
    currentBalance = playerStore.gold
  } else if (currency === 'diamond') {
    currentBalance = playerStore.diamond
  } else if (currency === 'evoCoin') {
    currentBalance = playerStore.evolutionCoin
  }

  if (currentBalance < totalPrice) {
    showToast('余额不足！')
    return
  }

  const newItem = isEquipment(item)
    ? {
        id: `equip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: item.name,
        icon: '',
        img: item.img || '',
        type: 'equipment',
        itemType: item.type,
        rarity: item.rarity || 'common',
        effect: null,
        quantity: 1
      }
    : {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: item.name,
        icon: item.icon || '',
        img: item.img || '',
        type: item.type || 'consumable',
        itemType: item.itemType || 'other',
        effect: item.effect || null,
        quantity: qty
      }

  if (!canAddToBackpack(newItem)) {
    showToast('背包已满！')
    return
  }

  if (currency === 'gold') {
    playerStore.gold = playerStore.gold - totalPrice
  } else if (currency === 'diamond') {
    playerStore.diamond = playerStore.diamond - totalPrice
  } else if (currency === 'evoCoin') {
    playerStore.evolutionCoin = playerStore.evolutionCoin - totalPrice
  }

  const added = inventoryStore.addItem(newItem)
  if (!added) {
    if (currency === 'gold') {
      playerStore.gold = playerStore.gold + totalPrice
    } else if (currency === 'diamond') {
      playerStore.diamond = playerStore.diamond + totalPrice
    } else if (currency === 'evoCoin') {
      playerStore.evolutionCoin = playerStore.evolutionCoin + totalPrice
    }
    showToast('背包已满！')
    return
  }

  selectedItem.value = null
}

function close() {
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
  max-width: 540px;
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
  flex-shrink: 0;
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.tabs-scroll {
  display: none;
}

.shop-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  min-height: 0;
}

.shop-sidebar {
  width: 36px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 2px;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgba(120, 180, 220, 0.3);
  background: rgba(5, 15, 25, 0.5);
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.shop-sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-tab {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1.5px solid rgba(120, 180, 220, 0.35);
  background: rgba(10, 35, 55, 0.7);
  color: #90b8d8;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  user-select: none;
}

.sidebar-tab:hover {
  border-color: rgba(150, 210, 255, 0.7);
  background: rgba(20, 50, 80, 0.85);
  color: #d0e8ff;
}

.sidebar-tab.active {
  background: linear-gradient(135deg, #2a6a9a, #1a4a6a);
  border-color: rgba(150, 210, 255, 0.8);
  color: #fff;
  box-shadow: 0 0 12px rgba(80, 160, 220, 0.4);
}

.shop-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.items-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 10px 4px;
  align-content: start;
}

.items-grid::-webkit-scrollbar {
  width: 5px;
}

.items-grid::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.4);
  border-radius: 3px;
}

.items-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
}

.item-card {
  background: rgba(6, 25, 42, 0.9);
  border: 2px solid rgba(80, 140, 180, 0.35);
  border-radius: 12px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.item-card.not-purchasable {
  opacity: 0.6;
  cursor: not-allowed;
}

.item-card.not-purchasable:hover {
  transform: none;
  box-shadow: none;
}

.item-image {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 50, 80, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(120, 180, 220, 0.25);
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.item-emoji {
  font-size: 1.6rem;
}

.item-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  color: #e0f0ff;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.item-props {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
}

.prop-tag {
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 6px;
  background: rgba(40, 90, 130, 0.6);
  color: #c0e0ff;
  border: 1px solid rgba(100, 160, 200, 0.3);
}

.item-desc {
  font-size: 0.65rem;
  color: #90b8d8;
  text-align: center;
  line-height: 1.3;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
}

.currency-icon {
  font-size: 0.85rem;
}

.price-value {
  font-weight: 700;
  font-size: 0.85rem;
  color: #ffd76e;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.not-sale-label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 600;
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  color: rgba(180, 210, 240, 0.5);
  padding: 40px 0;
  font-size: 0.9rem;
}

.currency-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 8px 10px;
  border-top: 1px solid rgba(120, 180, 220, 0.3);
  flex-shrink: 0;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(20, 50, 80, 0.6);
  padding: 5px 12px;
  border-radius: 14px;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

.currency-item .currency-icon {
  font-size: 1rem;
}

.currency-value {
  font-weight: 700;
  color: #ffd76e;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
}

.confirm-overlay {
  z-index: 1010;
  background: rgba(0, 0, 0, 0.75);
}

.confirm-modal {
  width: 85%;
  max-width: 320px;
  background: linear-gradient(135deg, rgba(10, 35, 55, 0.98), rgba(5, 20, 35, 0.98));
  border-radius: 18px;
  border: 1.5px solid rgba(120, 180, 220, 0.5);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: modalPopIn 0.25s ease-out;
}

.confirm-header {
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffd76e;
  text-align: center;
  border-bottom: 1px solid rgba(120, 180, 220, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.confirm-body {
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.confirm-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.confirm-price {
  color: #c0d8f0;
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-price strong {
  color: #ffd76e;
  font-size: 1.05rem;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
}

.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  background: rgba(20, 50, 80, 0.7);
  color: #b0d0f0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(40, 80, 120, 0.8);
  border-color: rgba(150, 210, 255, 0.6);
}

.btn-confirm {
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3a8ab8, #2a5a80);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(40, 100, 160, 0.4);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #4a9ac8, #3a6a90);
  box-shadow: 0 4px 16px rgba(60, 130, 200, 0.5);
}

.btn-confirm:active {
  transform: scale(0.96);
}

/* ---------- Quantity Stepper ---------- */
.qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.qty-label {
  font-size: 0.9rem;
  color: #b0d0e8;
  font-weight: 600;
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid rgba(120, 180, 220, 0.4);
}

.qty-btn {
  width: 32px;
  height: 30px;
  border: none;
  background: rgba(20, 50, 80, 0.7);
  color: #b0d0f0;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background: rgba(40, 80, 120, 0.85);
  color: #fff;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  min-width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 30, 50, 0.8);
  color: #ffd76e;
  font-size: 0.95rem;
  font-weight: 700;
  border-left: 1px solid rgba(120, 180, 220, 0.3);
  border-right: 1px solid rgba(120, 180, 220, 0.3);
}

.confirm-total {
  color: #c0d8f0;
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-total strong {
  color: #ffd76e;
  font-size: 1.05rem;
}
</style>
