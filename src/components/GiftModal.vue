<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🎁 礼包商店</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div class="gift-grid">
          <div
            v-for="(pack, key) in GIFTPACKS"
            :key="key"
            class="gift-card"
          >
            <div class="gift-top">
              <span class="gift-icon">{{ giftIcons[key] || '🎁' }}</span>
              <span class="gift-name">{{ pack.name }}</span>
              <span
                v-if="isLimited(pack)"
                class="gift-limit-tag"
                :class="{ 'limit-reached': isLimitReached(pack) }"
              >
                {{ getLimitText(pack) }}
              </span>
            </div>

            <p class="gift-desc">{{ pack.desc }}</p>

            <div class="gift-contents">
              <div
                v-for="(item, idx) in pack.items"
                :key="idx"
                class="gift-content-item"
              >
                <img
                  v-if="getItemImg(item)"
                  :src="getItemImg(item)"
                  :alt="item.name"
                  class="content-img"
                />
                <span v-else class="content-icon">{{ getItemIcon(item).icon }}</span>
                <span class="content-name">{{ item.name }}</span>
                <span v-if="item.quantity > 1" class="content-qty">×{{ item.quantity }}</span>
              </div>
            </div>

            <div class="gift-bottom">
              <span class="gift-price">
                {{ pack.price === 0 ? '免费' : `${pack.price} ${currencyLabel(pack.currency)}` }}
              </span>
              <button
                class="gift-buy-btn"
                :disabled="isLimitReached(pack) || !canAfford(pack)"
                @click="buyGift(key, pack)"
              >
                {{ buyButtonText(pack) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { GIFTPACKS } from '@/data/shop'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { showToast, showConfirm } from '@/utils/toast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()

const giftIcons = {
  starter: '🎒',
  scroll: '📜',
  exp: '⭐',
  tame: '🔗',
}

function close() {
  emit('update:modelValue', false)
}

function currencyLabel(currency) {
  if (currency === 'diamond') return '💎'
  if (currency === 'gold') return '💰'
  return ''
}

function isLimited(pack) {
  return pack.limit !== null && pack.limit !== undefined
}

function isLimitReached(pack) {
  if (!isLimited(pack)) return false
  const purchases = playerStore.giftPurchases
  const count = purchases[pack.id] || 0
  return count >= pack.limit
}

function getLimitText(pack) {
  const purchases = playerStore.giftPurchases
  const count = purchases[pack.id] || 0
  return `${count}/${pack.limit}`
}

function canAfford(pack) {
  if (pack.price === 0) return true
  if (pack.currency === 'diamond') return playerStore.diamond >= pack.price
  if (pack.currency === 'gold') return playerStore.gold >= pack.price
  return false
}

function buyButtonText(pack) {
  if (isLimitReached(pack)) return '已达上限'
  if (!canAfford(pack)) return '货币不足'
  return '购买'
}

function getItemIcon(item) {
  if (item.type === 'equipment') {
    const eq = EQUIPMENT[item.name]
    return { icon: '⚔️', img: eq?.img || '' }
  }
  const it = ITEMS[item.name]
  return { icon: it?.icon || '📦', img: it?.img || '' }
}

function getItemImg(item) {
  if (item.type === 'equipment') {
    const eq = EQUIPMENT[item.name]
    return eq?.img || ''
  }
  const it = ITEMS[item.name]
  return it?.img || ''
}

async function buyGift(key, pack) {
  if (isLimitReached(pack)) return
  if (!canAfford(pack)) return

  if (pack.price > 0) {
    const currencyName = pack.currency === 'diamond' ? '钻石' : '金币'
    const confirmed = await showConfirm(`确定要花费 ${pack.price} ${currencyName} 购买「${pack.name}」吗？`)
    if (!confirmed) return
  }

  if (pack.currency === 'diamond') {
    playerStore.diamond -= pack.price
  } else if (pack.currency === 'gold') {
    playerStore.gold -= pack.price
  }

  for (const giftItem of pack.items) {
    if (giftItem.type === 'equipment') {
      const eq = EQUIPMENT[giftItem.name]
      if (eq) {
        inventoryStore.addItem({
          name: eq.name,
          icon: '',
          img: eq.img || '',
          type: 'equipment',
          itemType: eq.type,
          rarity: eq.rarity || 'common',
          enhancedLevel: 0,
        })
      }
    } else if (giftItem.type === 'item') {
      const it = ITEMS[giftItem.name]
      if (it) {
        inventoryStore.addItem({
          name: it.name,
          icon: it.icon || '',
          img: it.img || '',
          type: it.type === 'heal' || it.type === 'mana' || it.type === 'exp' ? 'consumable' : 'material',
          itemType: it.type || 'other',
          effect: it.effect || null,
          quantity: giftItem.quantity || 1,
        })
      }
    }
  }

  playerStore.recordGiftPurchase(pack.id)
  showToast(`成功购买「${pack.name}」！`)
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
  height: 85vh;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98), rgba(10, 10, 10, 0.98));
  border-radius: 20px;
  border: 1.5px solid rgba(160, 160, 160, 0.5);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.1);
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
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.modal-body {
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.gift-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gift-card {
  background: linear-gradient(135deg, rgba(12, 40, 60, 0.85), rgba(6, 22, 35, 0.9));
  border-radius: 16px;
  padding: 16px;
  border: 1.5px solid rgba(100, 160, 200, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  transition: all 0.25s ease;
}

.gift-card:hover {
  border-color: rgba(180, 180, 180, 0.6);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3);
}

.gift-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.gift-icon {
  font-size: 1.3rem;
}

.gift-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff5d6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  flex: 1;
}

.gift-limit-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  background: rgba(60, 140, 200, 0.3);
  border: 1px solid rgba(100, 180, 220, 0.5);
  color: #b0d8f8;
}

.gift-limit-tag.limit-reached {
  background: rgba(200, 60, 60, 0.3);
  border-color: rgba(220, 100, 100, 0.5);
  color: #f8b0b0;
}

.gift-desc {
  font-size: 0.82rem;
  color: #a0c8e8;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.gift-contents {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.gift-content-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(20, 50, 80, 0.5);
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid rgba(80, 140, 180, 0.3);
  font-size: 0.8rem;
}

.content-icon {
  font-size: 0.85rem;
}

.content-img {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  image-rendering: crisp-edges;
}

.content-name {
  color: #d0e8ff;
}

.content-qty {
  color: #ffd76e;
  font-weight: 600;
}

.gift-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gift-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffd76e;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.gift-buy-btn {
  padding: 8px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2a6a9a, #1a5080);
  border: 1.5px solid rgba(130, 200, 240, 0.5);
  color: #e0f0ff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
}

.gift-buy-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a7aaa, #2a6090);
  border-color: rgba(160, 220, 255, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 15px rgba(100, 180, 240, 0.2);
  transform: translateY(-1px);
}

.gift-buy-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.gift-buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.6);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a9ac8, #3a6a90);
}
</style>
