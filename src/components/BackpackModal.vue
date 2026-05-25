<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🎒 背包</h2>
        <button class="sort-btn" @click="onSort" title="整理背包">📦 整理</button>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="modal-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'backpack' }"
          @click="activeTab = 'backpack'"
        >背包</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'attributes' }"
          @click="activeTab = 'attributes'"
        >属性</button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'forge' }"
          @click="activeTab = 'forge'"
        >🔨 锻造</button>
      </div>

      <div class="equipment-section">
        <div
          v-for="slot in equipSlots"
          :key="slot.key"
          class="equip-slot"
          :class="{ filled: equippedItems[slot.key], selected: selectedEquip?.slot === slot.key }"
          @click="onEquipSlotClick(slot.key)"
        >
          <template v-if="equippedItems[slot.key]">
            <img v-if="equippedItems[slot.key].img" :src="equippedItems[slot.key].img" :alt="equippedItems[slot.key].name" class="equip-img" />
            <span v-else class="equip-icon">{{ getEquipIcon(equippedItems[slot.key]) }}</span>
            <span class="equip-lv" v-if="equippedItems[slot.key].enhancedLevel">
              +{{ equippedItems[slot.key].enhancedLevel }}
            </span>
            <span class="equip-lv forge-lv" v-if="equippedItems[slot.key].equipmentLevel">
              Lv.{{ equippedItems[slot.key].equipmentLevel }}
            </span>
          </template>
          <template v-else>
            <span class="equip-placeholder">{{ slot.icon }}</span>
          </template>
          <span class="equip-label">{{ slot.label }}</span>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="activeTab === 'backpack'" class="backpack-grid">
          <div
            v-for="i in inventoryStore.backpackCapacity"
            :key="i - 1"
            class="grid-slot"
            :class="{
              filled: getSlotItem(i - 1),
              selected: selectedItem?.slot === i - 1
            }"
            @click="onGridSlotClick(i - 1)"
          >
            <template v-if="getSlotItem(i - 1)">
              <img v-if="getSlotItem(i - 1).img" :src="getSlotItem(i - 1).img" :alt="getSlotItem(i - 1).name" class="item-img" />
              <span v-else class="item-icon">{{ getSlotItem(i - 1).icon || '📦' }}</span>
              <span
                v-if="getSlotItem(i - 1).quantity > 1"
                class="item-qty"
              >{{ getSlotItem(i - 1).quantity }}</span>
            </template>
          </div>
        </div>

        <div v-if="activeTab === 'attributes'" class="attributes-panel">
          <div class="attr-row">
            <span class="attr-label">❤️ 生命值</span>
            <span class="attr-value">{{ computedStats.maxHp }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">⚔️ 攻击力</span>
            <span class="attr-value">{{ computedStats.attack }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">🛡️ 防御力</span>
            <span class="attr-value">{{ computedStats.defense }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">⚡ 速度</span>
            <span class="attr-value">{{ computedStats.speed }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">💥 暴击率</span>
            <span class="attr-value">{{ (computedStats.criticalRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">💢 爆伤</span>
            <span class="attr-value">{{ (computedStats.critDamage * 100).toFixed(0) }}%</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">👻 闪避率</span>
            <span class="attr-value">{{ (computedStats.dodgeRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">✨ 魔力</span>
            <span class="attr-value">{{ computedStats.magic }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">🔄 魔力回复</span>
            <span class="attr-value">{{ computedStats.magicRegen }}/回合</span>
          </div>

          <div class="attr-section-title">基础属性</div>
          <div class="attr-row">
            <span class="attr-label">💪 力量</span>
            <span class="attr-value">{{ playerStore.classStats?.力量 || 0 }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">❤️ 体质</span>
            <span class="attr-value">{{ playerStore.classStats?.体质 || 0 }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">🏃 敏捷</span>
            <span class="attr-value">{{ playerStore.classStats?.敏捷 || 0 }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">👁️ 感知</span>
            <span class="attr-value">{{ playerStore.classStats?.感知 || 0 }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">🧠 智力</span>
            <span class="attr-value">{{ playerStore.classStats?.智力 || 0 }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">🍀 幸运</span>
            <span class="attr-value">{{ playerStore.classStats?.幸运 || 0 }}</span>
          </div>

          <div v-if="equipBonusSummary.length" class="attr-section-title">装备加成</div>
          <div v-for="(bonus, idx) in equipBonusSummary" :key="'eb'+idx" class="attr-row attr-row-bonus">
            <span class="attr-label">{{ bonus.label }}</span>
            <span class="attr-value attr-value-positive">+{{ bonus.value }}</span>
          </div>

          <div v-if="runeBonusSummary.length" class="attr-section-title">符文加成</div>
          <div v-for="(bonus, idx) in runeBonusSummary" :key="'rb'+idx" class="attr-row attr-row-bonus">
            <span class="attr-label">{{ bonus.label }}</span>
            <span class="attr-value attr-value-positive">+{{ bonus.value }}</span>
          </div>

          <div v-if="talentSummary.length" class="attr-section-title">天赋加成</div>
          <div v-for="(t, idx) in talentSummary" :key="'t'+idx" class="attr-row attr-row-bonus">
            <span class="attr-label">{{ t.label }}</span>
            <span class="attr-value attr-value-positive">{{ t.value }}</span>
          </div>
        </div>

        <div v-if="activeTab === 'forge'" class="forge-panel">
          <div class="forge-gold-bar">
            <span>💰 持有金币：<strong>{{ playerStore.gold }}</strong></span>
          </div>
          <div class="forge-list">
            <div v-for="(item, idx) in forgeItems" :key="'f' + idx" class="forge-item" :class="{ 'forge-item-equipped': item.isEquipped }">
              <img v-if="item.img" :src="item.img" :alt="item.name" class="forge-item-img" />
              <span v-else class="forge-item-icon">📦</span>
              <div class="forge-item-info">
                <span class="forge-item-name">{{ item.name }}<span v-if="item.isEquipped" class="forge-equipped-tag">已装备</span></span>
                <span class="forge-item-level">当前等级: {{ item.equipmentLevel || 0 }}/60</span>
                <span class="forge-item-cost">升级费用: {{ forgeCost(item) }}💰</span>
                <span class="forge-item-growth" v-if="forgeGrowthPreview(item)">升级提升: {{ forgeGrowthPreview(item) }}</span>
              </div>
              <button
                v-if="(item.equipmentLevel || 0) < 60"
                class="forge-upgrade-btn"
                :disabled="!canForge(item)"
                @click="onForgeUpgrade(item)"
              >升级</button>
              <span v-else class="forge-max">已满级</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'backpack'" class="modal-footer">
        <span class="slot-count">{{ usedSlots }} / {{ inventoryStore.backpackCapacity }}</span>
      </div>
    </div>

    <div v-if="showEquipDetail && selectedEquip" class="detail-overlay" @click.self="closeEquipDetail">
      <div class="detail-panel">
        <div class="detail-header">
          <h3>{{ selectedEquip.name }}</h3>
          <span class="detail-rarity" :style="{ color: rarityColor(selectedEquip.rarity) }">
            {{ rarityLabel(selectedEquip.rarity) }}
          </span>
        </div>
        <div class="detail-icon-wrap">
          <img v-if="selectedEquip.img" :src="selectedEquip.img" :alt="selectedEquip.name" class="detail-large-img" />
          <span v-else class="detail-large-icon">{{ getEquipIcon(selectedEquip) }}</span>
        </div>
        <div v-if="selectedEquip.enhancedLevel" class="detail-enhance">
          强化等级: +{{ selectedEquip.enhancedLevel }}
        </div>
        <div v-if="selectedEquip.equipmentLevel" class="detail-enhance">
          锻造等级: Lv.{{ selectedEquip.equipmentLevel }}
        </div>
        <div class="detail-stats" v-if="equipDetailStats.length">
          <div v-for="(stat, idx) in equipDetailStats" :key="'eds'+idx" class="detail-stat-row">
            <span>{{ stat.label }}</span>
            <span class="detail-stat-val">{{ stat.value }}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button v-if="isEquippedDetail" class="action-btn action-unequip" @click="onUnequip">卸下</button>
          <button v-if="!isEquippedDetail" class="action-btn action-equip" @click="onEquip">装备</button>
          <button class="action-btn action-dismantle" @click="onDismantle">分解</button>
        </div>
        <button class="detail-close" @click="closeEquipDetail">✕</button>
      </div>
    </div>

    <div v-if="showItemDetail && selectedItem" class="detail-overlay" @click.self="closeItemDetail">
      <div class="detail-panel">
        <div class="detail-header">
          <h3>{{ selectedItem.name }}</h3>
          <span class="detail-type-badge">{{ itemTypeLabel(selectedItem.type) }}</span>
        </div>
        <div class="detail-icon-wrap">
          <img v-if="selectedItem.img" :src="selectedItem.img" :alt="selectedItem.name" class="detail-large-img" />
          <span v-else class="detail-large-icon">{{ selectedItem.icon || '📦' }}</span>
        </div>
        <div v-if="selectedItem.quantity > 1" class="detail-qty">
          数量: {{ selectedItem.quantity }}
        </div>
        <div class="detail-desc" v-if="itemDescription">
          {{ itemDescription }}
        </div>
        <div class="detail-actions">
          <button v-if="canUseItem" class="action-btn action-use" @click="onUseItem">使用</button>
          <button v-if="canUseItem && (selectedItem?.quantity || 1) > 1" class="action-btn action-use" @click="onBatchUseClick">批量使用</button>
          <button class="action-btn action-delete" @click="onDeleteClick">删除</button>
        </div>
        <button class="detail-close" @click="closeItemDetail">✕</button>
      </div>
    </div>

    <div v-if="showDeletePanel" class="detail-overlay" @click.self="closeDeletePanel">
      <div class="detail-panel delete-panel">
        <h3 class="delete-title">删除物品</h3>
        <p class="delete-name">{{ selectedItem?.name }}</p>
        <div class="delete-qty-row">
          <button class="qty-btn" @click="deleteQty = Math.max(1, deleteQty - 1)">−</button>
          <span class="qty-value">{{ deleteQty }}</span>
          <button class="qty-btn" @click="deleteQty = Math.min(selectedItem?.quantity || 1, deleteQty + 1)">+</button>
          <button class="qty-btn qty-max" @click="deleteQty = selectedItem?.quantity || 1">最大</button>
        </div>
        <div class="delete-actions">
          <button class="action-btn action-delete-confirm" @click="onDeleteConfirm">确认删除</button>
          <button class="action-btn action-cancel" @click="closeDeletePanel">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showBatchUsePanel" class="detail-overlay" @click.self="closeBatchUsePanel">
      <div class="detail-panel delete-panel">
        <h3 class="delete-title" style="color:#90eea0">批量使用</h3>
        <p class="delete-name">{{ selectedItem?.name }}</p>
        <div class="delete-qty-row">
          <button class="qty-btn" @click="batchUseQty = Math.max(1, batchUseQty - 1)">−</button>
          <span class="qty-value">{{ batchUseQty }}</span>
          <button class="qty-btn" @click="batchUseQty = Math.min(selectedItem?.quantity || 1, batchUseQty + 1)">+</button>
          <button class="qty-btn qty-max" @click="batchUseQty = selectedItem?.quantity || 1">最大</button>
        </div>
        <div class="delete-actions">
          <button class="action-btn action-use" @click="onBatchUseConfirm">确认使用</button>
          <button class="action-btn action-cancel" @click="closeBatchUsePanel">取消</button>
        </div>
      </div>
    </div>

    <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { usePlayerStore } from '@/stores/player'
import { useRuneStore } from '@/stores/rune'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { RUNE_BONUS } from '@/data/runes'
import { getCharacterStats, getEquipmentBonus, getTotalRuneBonus, getTalentBonus } from '@/utils/game'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const playerStore = usePlayerStore()
const runeStore = useRuneStore()

const activeTab = ref('backpack')
const selectedItem = ref(null)
const selectedEquip = ref(null)
const showDeletePanel = ref(false)
const deleteQty = ref(1)
const showBatchUsePanel = ref(false)
const batchUseQty = ref(1)
const toastMsg = ref('')
let toastTimer = null

const equipSlots = [
  { key: 'weapon', label: '武器', icon: '⚔️' },
  { key: 'head', label: '头盔', icon: '⛑️' },
  { key: 'chest', label: '衣服', icon: '👕' },
  { key: 'legs', label: '裤子', icon: '👖' },
  { key: 'boots', label: '鞋子', icon: '👢' },
  { key: 'accessory', label: '饰品', icon: '💍' },
]

const equippedItems = computed(() => inventoryStore.equippedItems)
const backpackItems = computed(() => inventoryStore.backpackItems)

const forgeItems = computed(() => {
  const rarityOrder = { red: 0, legendary: 1, orange: 1, epic: 2, purple: 2, rare: 3, blue: 3, uncommon: 4, common: 5 }
  const sortByQuality = (a, b) => (rarityOrder[a.rarity] ?? 6) - (rarityOrder[b.rarity] ?? 6)
  const backpackEquip = [...backpackItems.value.filter(forgeFilter)].sort(sortByQuality)
  const equippedList = equipSlots
    .map((s) => {
      const e = equippedItems.value[s.key]
      if (!e) return null
      return { ...e, isEquipped: true, equipSlot: s.key }
    })
    .filter(Boolean)
    .sort(sortByQuality)
  return [...equippedList, ...backpackEquip]
})

const usedSlots = computed(() => backpackItems.value.length)

const showEquipDetail = computed(() => selectedEquip.value !== null)
const showItemDetail = computed(() => selectedItem.value !== null && !showDeletePanel.value && !showBatchUsePanel.value)

const isEquippedDetail = computed(() => {
  if (!selectedEquip.value) return false
  return equipSlots.some((s) => equippedItems.value[s.key]?.id === selectedEquip.value.id)
})

function getSlotItem(slotIndex) {
  return backpackItems.value.find((i) => i.slot === slotIndex) || null
}

function close() {
  emit('update:modelValue', false)
}

function onSort() {
  inventoryStore.sortBackpack('quality')
  showToast('背包已整理')
}

function onEquipSlotClick(slotKey) {
  const equip = equippedItems.value[slotKey]
  if (equip) {
    activeTab.value = 'backpack'
    selectedItem.value = null
    selectedEquip.value = { ...equip, slot: slotKey }
  }
}

function onGridSlotClick(slotIndex) {
  const item = getSlotItem(slotIndex)
  if (!item) return
  selectedEquip.value = null

  let equipType = item.itemType
  if (!equipType) {
    const equipData = EQUIPMENT[item.name]
    if (equipData) equipType = equipData.type
  }
  if (equipType && equipSlots.some((s) => s.key === equipType)) {
    selectedEquip.value = { ...item, slot: equipType, backpackIndex: slotIndex }
    selectedItem.value = null
    return
  }

  selectedItem.value = { ...item }
  selectedEquip.value = null
}

function closeEquipDetail() {
  selectedEquip.value = null
}

function closeItemDetail() {
  selectedItem.value = null
}

function onUnequip() {
  if (!selectedEquip.value) return
  const slot = selectedEquip.value.slot
  const ok = inventoryStore.unequipItem(slot)
  if (ok) {
    showToast('已卸下装备')
  } else {
    showToast('背包已满，无法卸下')
  }
  selectedEquip.value = null
}

function onEquip() {
  if (!selectedEquip.value) return
  const slotName = selectedEquip.value.slot || selectedEquip.value.itemType
  if (!slotName) return
  const item = backpackItems.value.find((i) => i.id === selectedEquip.value.id)
  if (!item) return
  const ok = inventoryStore.equipItem(item, slotName)
  if (ok) {
    showToast('装备成功')
  }
  selectedEquip.value = null
}

function onEnhance() {
  if (!selectedEquip.value) return
  const slot = selectedEquip.value.slot
  const ok = inventoryStore.enhanceEquipment(slot)
  if (ok) {
    showToast('强化成功')
    selectedEquip.value = { ...equippedItems.value[slot], slot }
  }
}

function onDismantle() {
  if (!selectedEquip.value) return
  const backpackIndex = selectedEquip.value.backpackIndex
  const slot = selectedEquip.value.slot
  const gold = inventoryStore.dismantleEquipment(backpackIndex !== undefined ? backpackIndex : slot)
  if (gold) {
    showToast(`分解成功，获得 ${gold} 金币`)
  }
  selectedEquip.value = null
}

function forgeFilter(item) {
  return !!(EQUIPMENT[item.name])
}

function forgeCost(item) {
  const baseCost = 500
  const lv = item.equipmentLevel || 0
  return baseCost + lv * 200
}

function forgeGrowthPreview(item) {
  const equipData = EQUIPMENT[item.name]
  if (!equipData || !equipData.growth) return ''
  const parts = []
  const statNames = { attack: '攻击', defense: '防御', hp: '生命', maxHp: '生命', mp: '魔力', magic: '魔力', atkSpeed: '攻速', speed: '速度', critRate: '暴击', criticalRate: '暴击', dodgeRate: '闪避' }
  for (const [key, value] of Object.entries(equipData.growth)) {
    const name = statNames[key] || key
    parts.push(name + '+' + value)
  }
  return parts.join('  ')
}

function canForge(item) {
  return playerStore.gold >= forgeCost(item)
}

function onForgeUpgrade(item) {
  if (!canForge(item)) return
  const cost = forgeCost(item)
  playerStore.gold = playerStore.gold - cost
  if (item.isEquipped) {
    const slot = item.equipSlot
    const equip = equippedItems.value[slot]
    if (equip) {
      equip.equipmentLevel = (equip.equipmentLevel || 0) + 1
      authStore.saveAccounts()
    }
  } else {
    inventoryStore.upgradeEquipment(item)
  }
  showToast(item.name + ' 升级成功！当前等级: ' + ((item.equipmentLevel || 0) + 1))
}

function onUseItem() {
  if (!selectedItem.value) return
  const item = selectedItem.value
  const itemData = ITEMS[item.name]
  if (!itemData) return

  const effectVal = itemData.effect || item.effect
  if (!effectVal) return

  const slotIndex = item.slot

  if (itemData.effect?.expandBackpack) {
    const expand = itemData.effect.expandBackpack
    const current = inventoryStore.backpackCapacity
    if (current >= 200) {
      showToast('背包已达最大容量（200格）')
      return
    }
    const newCap = Math.min(current + expand, 200)
    inventoryStore.backpackCapacity = newCap
    showToast(`背包已扩容至 ${newCap} 格！`)
    inventoryStore.removeItem(slotIndex, 1)
    const updated = getSlotItem(slotIndex)
    if (updated) {
      selectedItem.value = { ...updated }
    } else {
      selectedItem.value = null
    }
    return
  }

  switch (itemData.type) {
    case 'heal': {
      const healPct = typeof effectVal === 'number' ? effectVal : 0
      const maxHp = computedStats.value.maxHp
      const healAmount = Math.floor(maxHp * healPct)
      const currentHp = playerStore.currentHp || 0
      if (currentHp >= maxHp) {
        showToast('生命值已满')
        return
      }
      playerStore.currentHp = Math.min(maxHp, currentHp + healAmount)
      showToast(`恢复了 ${healAmount} 点生命值`)
      break
    }
    case 'mana': {
      const manaPct = typeof effectVal === 'number' ? effectVal : 0
      const maxMp = playerStore.maxMp || computedStats.value.magic * 2 || 100
      const restoreAmount = Math.floor(maxMp * manaPct)
      const currentMp = playerStore.currentMp || 0
      if (currentMp >= maxMp) {
        showToast('魔力值已满')
        return
      }
      playerStore.currentMp = Math.min(maxMp, currentMp + restoreAmount)
      showToast(`恢复了 ${restoreAmount} 点魔力值`)
      break
    }
    case 'exp': {
      const expAmount = typeof effectVal === 'number' ? effectVal : 500
      playerStore.addExp(expAmount)
      showToast(`获得了 ${expAmount} 点经验`)
      break
    }
    case 'buff': {
      if (!itemData.effect || typeof itemData.effect !== 'object') {
        showToast('无法使用此物品')
        return
      }
      const buffEntry = Object.entries(itemData.effect)[0]
      if (!buffEntry) return
      const [key, val] = buffEntry
      const u = authStore.accounts[authStore.currentUser]
      if (!u) return
      if (!u.activeBuffs) u.activeBuffs = {}
      u.activeBuffs[key] = (u.activeBuffs[key] || 0) + val
      authStore.saveAccounts()
      const buffLabels = {
        criticalRate: '暴击率',
        defense: '防御',
        speed: '速度',
        attack: '攻击',
      }
      showToast(`获得 ${buffLabels[key] || key} 增益`)
      break
    }
    case 'tame': {
      showToast('请在战斗中使用驯服物品')
      return
    }
    default:
      showToast('无法使用此物品')
      return
  }

  inventoryStore.removeItem(slotIndex, 1)

  const updated = getSlotItem(slotIndex)
  if (updated) {
    selectedItem.value = { ...updated }
  } else {
    selectedItem.value = null
  }
}

const canUseItem = computed(() => {
  if (!selectedItem.value) return false
  const itemData = ITEMS[selectedItem.value.name]
  if (!itemData) return false
  return ['heal', 'mana', 'exp', 'buff'].includes(itemData.type)
    || !!itemData.effect?.expandBackpack
})

const itemDescription = computed(() => {
  if (!selectedItem.value) return ''
  const itemData = ITEMS[selectedItem.value.name]
  if (itemData?.desc) return itemData.desc
  return ''
})

function itemTypeLabel(type) {
  const map = {
    consumable: '消耗品',
    material: '材料',
    equipment: '装备',
    heal: '回复',
    mana: '回魔',
    exp: '经验',
    buff: '增益',
    tame: '驯服',
  }
  return map[type] || type || '物品'
}

function onDeleteClick() {
  deleteQty.value = 1
  showDeletePanel.value = true
}

function closeDeletePanel() {
  showDeletePanel.value = false
  deleteQty.value = 1
}

function onDeleteConfirm() {
  if (!selectedItem.value) return
  const slotIndex = selectedItem.value.slot
  const qty = deleteQty.value
  inventoryStore.removeItem(slotIndex, qty)

  const remaining = getSlotItem(slotIndex)
  if (remaining) {
    selectedItem.value = { ...remaining }
  } else {
    selectedItem.value = null
  }

  showToast(`已删除 ${qty} 个物品`)
  closeDeletePanel()
}

function onBatchUseClick() {
  batchUseQty.value = 1
  showBatchUsePanel.value = true
}

function closeBatchUsePanel() {
  showBatchUsePanel.value = false
  batchUseQty.value = 1
}

function onBatchUseConfirm() {
  if (!selectedItem.value) return
  const item = selectedItem.value
  const itemData = ITEMS[item.name]
  if (!itemData) { closeBatchUsePanel(); return }

  const qty = batchUseQty.value
  const slotIndex = item.slot
  const effectVal = itemData.effect || item.effect

  if (itemData.effect?.expandBackpack) {
    const expand = itemData.effect.expandBackpack
    const current = inventoryStore.backpackCapacity
    if (current >= 200) {
      showToast('背包已达最大容量（200格）')
      closeBatchUsePanel()
      return
    }
    const newCap = Math.min(current + expand * qty, 200)
    inventoryStore.backpackCapacity = newCap
    inventoryStore.removeItem(slotIndex, qty)
    showToast(`背包已扩容至 ${newCap} 格！`)
    closeBatchUsePanel()
    const updated = getSlotItem(slotIndex)
    selectedItem.value = updated ? { ...updated } : null
    return
  }

  switch (itemData.type) {
    case 'heal': {
      const healPct = typeof effectVal === 'number' ? effectVal : 0
      const maxHp = computedStats.value.maxHp
      const currentHp = playerStore.currentHp || 0
      if (currentHp >= maxHp) {
        showToast('生命值已满')
        closeBatchUsePanel()
        return
      }
      const healAmount = Math.floor(maxHp * healPct * qty)
      playerStore.currentHp = Math.min(maxHp, currentHp + healAmount)
      showToast(`恢复了 ${healAmount} 点生命值（使用了${qty}个）`)
      break
    }
    case 'mana': {
      const manaPct = typeof effectVal === 'number' ? effectVal : 0
      const maxMp = playerStore.maxMp || computedStats.value.magic * 2 || 100
      const currentMp = playerStore.currentMp || 0
      if (currentMp >= maxMp) {
        showToast('魔力值已满')
        closeBatchUsePanel()
        return
      }
      const restoreAmount = Math.floor(maxMp * manaPct * qty)
      playerStore.currentMp = Math.min(maxMp, currentMp + restoreAmount)
      showToast(`恢复了 ${restoreAmount} 点魔力值（使用了${qty}个）`)
      break
    }
    case 'exp': {
      const expAmount = (typeof effectVal === 'number' ? effectVal : 500) * qty
      playerStore.addExp(expAmount)
      showToast(`获得了 ${expAmount} 点经验（使用了${qty}个）`)
      break
    }
    case 'buff': {
      if (!itemData.effect || typeof itemData.effect !== 'object') {
        showToast('无法批量使用此物品')
        closeBatchUsePanel()
        return
      }
      const buffEntry = Object.entries(itemData.effect)[0]
      if (!buffEntry) { closeBatchUsePanel(); return }
      const [key, val] = buffEntry
      const u = authStore.accounts[authStore.currentUser]
      if (!u) { closeBatchUsePanel(); return }
      if (!u.activeBuffs) u.activeBuffs = {}
      u.activeBuffs[key] = (u.activeBuffs[key] || 0) + val * qty
      authStore.saveAccounts()
      const buffLabels = { criticalRate: '暴击率', defense: '防御', speed: '速度', attack: '攻击' }
      showToast(`获得 ${buffLabels[key] || key} 增益×${qty}（使用了${qty}个）`)
      break
    }
    default:
      showToast('无法批量使用此物品')
      closeBatchUsePanel()
      return
  }

  inventoryStore.removeItem(slotIndex, qty)
  const updated = getSlotItem(slotIndex)
  selectedItem.value = updated ? { ...updated } : null
  closeBatchUsePanel()
}

function getEquipIcon(equip) {
  if (equip.icon) return equip.icon
  const typeIcons = {
    weapon: '⚔️',
    head: '⛑️',
    chest: '👕',
    legs: '👖',
    boots: '👢',
    accessory: '💍',
  }
  return typeIcons[equip.itemType || equip.slot] || '📦'
}

function rarityColor(rarity) {
  const map = {
    common: '#9d9d9d',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    red: '#ff3333',
    orange: '#ff8000',
    purple: '#a335ee',
    blue: '#0070dd',
  }
  return map[rarity] || '#9d9d9d'
}

function rarityLabel(rarity) {
  const map = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
    red: '红色',
    orange: '橙色',
    purple: '紫色',
    blue: '蓝色',
  }
  return map[rarity] || rarity || '普通'
}

const equipDetailStats = computed(() => {
  if (!selectedEquip.value) return []
  const name = selectedEquip.value.name
  const data = EQUIPMENT[name]
  if (!data?.props) return []
  const stats = []
  const totalLevel = (selectedEquip.value.enhancedLevel || 0) + (selectedEquip.value.equipmentLevel || 0)
  const labels = {
    attack: '攻击力',
    defense: '防御力',
    maxHp: '生命值',
    speed: '速度',
    magic: '魔力',
    criticalRate: '暴击率',
    dodgeRate: '闪避率',
    magicRegen: '魔力回复',
    goldBonus: '金币加成',
  }
  for (const [key, baseVal] of Object.entries(data.props)) {
    const growth = data.growth?.[key] || 0
    const total = baseVal + growth * totalLevel
    if (typeof total === 'number' && total < 1 && total > 0) {
      stats.push({ label: labels[key] || key, value: (total * 100).toFixed(1) + '%' })
    } else if (key === 'goldBonus') {
      stats.push({ label: labels[key] || key, value: (total * 100).toFixed(1) + '%' })
    } else {
      stats.push({ label: labels[key] || key, value: Math.floor(total) })
    }
  }
  return stats
})

const computedStats = computed(() => {
  const className = playerStore.characterClass || '平民'
  const lvl = playerStore.level || 1
  const equipped = equippedItems.value || {}
  const equipBonus = getEquipmentBonus(equipped)
  const activeRunes = (runeStore.activeRunes || []).filter(r => r)
  const runeBonus = getTotalRuneBonus(activeRunes)
  const userTalents = playerStore.talents || {}
  const talentBonus = getTalentBonus(userTalents, className)
  const stats = getCharacterStats(className, lvl, equipBonus, runeBonus, talentBonus)
  return {
    maxHp: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.atkSpeed,
    criticalRate: stats.critRate,
    critDamage: stats.critDamage || 1.5,
    dodgeRate: stats.dodgeRate,
    magic: stats.magic || 0,
    magicRegen: (stats.magicRegen || 0).toFixed(1),
  }
})

const equipBonusSummary = computed(() => {
  const bonuses = {}
  for (const slotKey of Object.keys(equippedItems.value)) {
    const equip = equippedItems.value[slotKey]
    if (!equip || !equip.name) continue
    const data = EQUIPMENT[equip.name]
    if (!data?.props) continue
    const totalLevel = (equip.enhancedLevel || 0) + (equip.equipmentLevel || 0)
    for (const [key, base] of Object.entries(data.props)) {
      const growth = data.growth?.[key] || 0
      const val = base + growth * totalLevel
      if (!bonuses[key]) bonuses[key] = 0
      bonuses[key] += val
    }
  }
  const labels = {
    attack: '攻击力', defense: '防御力', maxHp: '生命值', speed: '速度',
    magic: '魔力', criticalRate: '暴击率', critDamage: '爆伤', dodgeRate: '闪避率',
    magicRegen: '魔力回复', goldBonus: '金币加成',
  }
  return Object.entries(bonuses).map(([k, v]) => {
    if (k === 'criticalRate' || k === 'dodgeRate' || k === 'goldBonus') {
      return { label: labels[k] || k, value: (v * 100).toFixed(1) + '%' }
    }
    if (k === 'critDamage') {
      return { label: labels[k] || k, value: '+'+ (v * 100).toFixed(1) + '%' }
    }
    return { label: labels[k] || k, value: Math.floor(v) }
  })
})

const runeBonusSummary = computed(() => {
  const activeRunes = runeStore.activeRunes || []
  const summary = []
  const labelMap = {
    attack: '攻击力', defense: '防御力', maxHp: '生命值', speed: '速度',
    magic: '魔力', criticalRate: '暴击率', critDamage: '爆伤', dodgeRate: '闪避率', magicRegen: '魔力回复',
  }
  for (const rune of activeRunes) {
    if (!rune) continue
    const bonus = RUNE_BONUS[rune.type]
    if (!bonus) continue
    const lvl = rune.level || 1
    for (const [statKey, baseVal] of Object.entries(bonus.base)) {
      const perLevelVal = bonus.perLevel[statKey] || 0
      const val = baseVal + perLevelVal * (lvl - 1)
      const label = labelMap[statKey] || statKey
      if (statKey === 'criticalRate' || statKey === 'dodgeRate') {
        summary.push({ label, value: (val * 100).toFixed(1) + '%' })
      } else if (statKey === 'critDamage') {
        summary.push({ label, value: '+'+ (val * 100).toFixed(1) + '%' })
      } else if (statKey === 'magicRegen') {
        summary.push({ label, value: val.toFixed(1) + '/回合' })
      } else {
        summary.push({ label, value: Math.floor(val) })
      }
    }
  }
  return summary
})

const talentSummary = computed(() => {
  const talents = playerStore.talents || {}
  const className = playerStore.characterClass || ''
  const result = []
  for (const [talentId, lvl] of Object.entries(talents)) {
    if (!lvl || lvl <= 0) continue
    const labelMap = {
      crit_rate: '暴击率', evasion: '闪避率', defense: '防御力',
      max_hp: '最大生命', dual_stat: '攻防', attack_speed: '攻速',
      magic_damage: '法术伤害', max_mana: '最大魔力', hp_bonus: '攻击力(低血)',
      armor_pierce: '破甲', lifesteal: '吸血', heal_bonus: '治疗效果',
      shield: '护盾概率', status_resist: '状态抗性', mana_cost: '魔力消耗',
      reflect: '反弹伤害', counter_crit: '反击暴击', hp_regen: '生命回复',
      drop_rate: '掉宝率', gold_bonus: '金币加成', all_stats: '全属性',
    }
    const talentNameMap = {
      warrior_bloodthirst: '嗜血', warrior_berserker: '狂战士', warrior_armor_pierce: '破甲',
      ranger_critical: '致命一击', ranger_evasion: '闪避', ranger_rapid_fire: '速射',
      priest_healing: '神圣治愈', priest_barrier: '神圣护盾', priest_purify: '净化',
      mage_mana_efficiency: '魔力精通', mage_elemental: '元素强化', mage_arcane: '奥术智慧',
      guardian_iron_wall: '铁壁', guardian_rebound: '反弹', guardian_vitality: '活力',
      monk_ki: '气', monk_counter: '反击', monk_meditation: '冥想',
      commoner_lucky: '幸运儿', commoner_economist: '理财', commoner_adapt: '适应',
    }
    result.push({
      label: talentNameMap[talentId] || talentId,
      value: `Lv.${lvl}`,
    })
  }
  return result
})

function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMsg.value = ''
  }, 2000)
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    activeTab.value = 'backpack'
    selectedItem.value = null
    selectedEquip.value = null
    showDeletePanel.value = false
    deleteQty.value = 1
  }
})
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
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 90%;
  max-width: 420px;
  height: 85vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalPopIn 0.25s ease-out;
}

@keyframes modalPopIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(120, 180, 220, 0.3);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
  flex: 1;
}

.sort-btn {
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(20, 60, 90, 0.85), rgba(8, 25, 40, 0.9));
  border: 1.5px solid rgba(120, 180, 220, 0.5);
  color: #b0d0f0;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-right: 8px;
  white-space: nowrap;
}

.sort-btn:hover {
  border-color: rgba(150, 210, 255, 0.8);
  box-shadow: 0 0 15px rgba(100, 180, 255, 0.25);
}

.sort-btn:active {
  transform: scale(0.95);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
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

.modal-tabs {
  display: flex;
  border-bottom: 1px solid rgba(120, 180, 220, 0.2);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: rgba(180, 210, 240, 0.6);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  font-family: inherit;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #777, #999);
  transition: width 0.25s ease;
}

.tab-btn:hover {
  color: rgba(200, 225, 255, 0.9);
}

.tab-btn.active {
  color: #fff;
}

.tab-btn.active::after {
  width: 60%;
}

.equipment-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  padding: 12px 12px 8px;
  flex-shrink: 0;
}

.equip-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  background: rgba(10, 30, 50, 0.8);
  border: 2px solid rgba(120, 180, 220, 0.3);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.equip-slot:hover {
  border-color: rgba(150, 210, 255, 0.7);
  box-shadow: 0 0 15px rgba(100, 180, 255, 0.2);
  transform: translateY(-2px);
}

.equip-slot.filled {
  background: linear-gradient(145deg, rgba(20, 55, 80, 0.9), rgba(10, 30, 50, 0.85));
  border-color: rgba(130, 190, 230, 0.5);
}

.equip-slot.selected {
  border-color: #7fb7e0;
  box-shadow: 0 0 20px rgba(100, 180, 255, 0.4);
}

.equip-icon {
  font-size: 1.6rem;
}

.equip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  image-rendering: crisp-edges;
  position: absolute;
  top: 0;
  left: 0;
}

.equip-lv {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.forge-lv {
  top: auto;
  bottom: 14px;
  right: 2px;
  background: rgba(255, 180, 50, 0.3);
  color: #ffb432;
  border-color: rgba(255, 180, 50, 0.5);
}

.equip-placeholder {
  font-size: 1.4rem;
  opacity: 0.4;
}

.equip-label {
  font-size: 0.6rem;
  color: rgba(180, 210, 240, 0.7);
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 1;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 12px;
  min-height: 0;
}

.modal-body::-webkit-scrollbar {
  width: 5px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.4);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3a6a8a, #1a4060);
  border-radius: 3px;
  border: 1px solid rgba(100, 160, 200, 0.3);
}

.backpack-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.grid-slot {
  aspect-ratio: 1;
  background: rgba(8, 25, 42, 0.7);
  border: 1.5px solid rgba(100, 160, 200, 0.2);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.grid-slot:hover {
  border-color: rgba(150, 210, 255, 0.5);
  box-shadow: 0 0 10px rgba(100, 180, 255, 0.15);
}

.grid-slot.filled {
  background: rgba(12, 35, 55, 0.85);
  border-color: rgba(120, 180, 220, 0.3);
}

.grid-slot.selected {
  border-color: #7fb7e0;
  box-shadow: 0 0 15px rgba(100, 180, 255, 0.35);
}

.item-icon {
  font-size: 1.15rem;
  pointer-events: none;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  pointer-events: none;
  image-rendering: crisp-edges;
}

.item-qty {
  position: absolute;
  bottom: 1px;
  right: 3px;
  font-size: 0.55rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8);
}



.modal-footer {
  padding: 10px 16px;
  border-top: 1px solid rgba(120, 180, 220, 0.2);
  text-align: center;
  flex-shrink: 0;
}

.slot-count {
  font-size: 0.8rem;
  color: rgba(180, 210, 240, 0.7);
  font-weight: 600;
}

.attributes-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attr-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #7fb7e0;
  margin-top: 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(120, 180, 220, 0.2);
}

.attr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(10, 30, 50, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(100, 160, 200, 0.15);
}

.attr-row-bonus {
  background: rgba(20, 50, 80, 0.5);
}

.attr-label {
  font-size: 0.85rem;
  color: rgba(200, 225, 255, 0.9);
}

.attr-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffd76e;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.attr-value-positive {
  color: #7bed9f;
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.15s ease-out;
}

.detail-panel {
  width: 85%;
  max-width: 320px;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  padding: 20px;
  position: relative;
  animation: modalPopIn 0.2s ease-out;
}

.detail-header {
  text-align: center;
  margin-bottom: 12px;
}

.detail-header h3 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 4px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.detail-rarity {
  font-size: 0.8rem;
  font-weight: 700;
}

.detail-type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(100, 160, 200, 0.3);
  color: #b0d0f0;
  font-size: 0.75rem;
}

.detail-icon-wrap {
  text-align: center;
  margin: 12px 0;
}

.detail-large-icon {
  font-size: 2.8rem;
}

.detail-large-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(20, 50, 80, 0.5);
  padding: 6px;
  border: 1px solid rgba(120, 180, 220, 0.3);
}

.detail-enhance {
  text-align: center;
  font-size: 0.9rem;
  color: #ffd700;
  font-weight: 700;
  margin-bottom: 8px;
}

.detail-stats {
  margin: 10px 0;
}

.detail-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.85rem;
  color: rgba(200, 225, 255, 0.85);
  border-bottom: 1px solid rgba(100, 160, 200, 0.15);
}

.detail-stat-val {
  font-weight: 700;
  color: #ffd76e;
}

.detail-qty {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(200, 225, 255, 0.8);
  margin-bottom: 8px;
}

.detail-desc {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(180, 210, 240, 0.7);
  margin: 8px 0;
  padding: 8px;
  background: rgba(10, 30, 50, 0.5);
  border-radius: 10px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;
}

.action-btn {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1.5px solid;
  font-family: inherit;
}

.action-equip {
  background: linear-gradient(145deg, rgba(30, 80, 120, 0.9), rgba(15, 45, 70, 0.9));
  border-color: rgba(120, 200, 255, 0.6);
  color: #d0e8ff;
}

.action-equip:hover {
  box-shadow: 0 0 15px rgba(100, 200, 255, 0.3);
}

.action-unequip {
  background: rgba(180, 100, 40, 0.3);
  border-color: rgba(220, 150, 60, 0.5);
  color: #ffc478;
}

.action-unequip:hover {
  box-shadow: 0 0 12px rgba(220, 150, 60, 0.3);
}

.action-enhance {
  background: linear-gradient(145deg, rgba(40, 30, 100, 0.9), rgba(20, 15, 60, 0.9));
  border-color: rgba(150, 120, 255, 0.6);
  color: #c8b8ff;
}

.action-enhance:hover {
  box-shadow: 0 0 15px rgba(150, 120, 255, 0.3);
}

.action-dismantle {
  background: rgba(180, 40, 40, 0.3);
  border-color: rgba(220, 60, 60, 0.5);
  color: #ff7878;
}

.action-dismantle:hover {
  box-shadow: 0 0 12px rgba(220, 60, 60, 0.3);
}

.action-use {
  background: linear-gradient(145deg, rgba(30, 100, 60, 0.9), rgba(15, 55, 35, 0.9));
  border-color: rgba(80, 200, 120, 0.6);
  color: #90eea0;
}

.action-use:hover {
  box-shadow: 0 0 15px rgba(80, 200, 120, 0.3);
}

.action-delete {
  background: rgba(160, 50, 50, 0.3);
  border-color: rgba(200, 80, 80, 0.5);
  color: #ff9999;
}

.action-delete:hover {
  box-shadow: 0 0 12px rgba(200, 80, 80, 0.3);
}

.action-delete-confirm {
  background: rgba(200, 50, 50, 0.5);
  border-color: rgba(240, 80, 80, 0.7);
  color: #ff6666;
}

.action-cancel {
  background: rgba(60, 60, 60, 0.5);
  border-color: rgba(140, 140, 140, 0.5);
  color: #ccc;
}

.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
  border: 1px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
}

.delete-panel {
  text-align: center;
}

.delete-title {
  color: #ff9999;
  margin-bottom: 8px;
}

.delete-name {
  color: rgba(200, 225, 255, 0.85);
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.delete-qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(30, 30, 30, 0.8);
  border: 1.5px solid rgba(150, 150, 150, 0.4);
  color: #bbb;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  border-color: rgba(150, 210, 255, 0.7);
}

.qty-max {
  font-size: 0.75rem;
  width: 42px;
}

.qty-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffd76e;
  min-width: 40px;
  text-align: center;
}

.delete-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1200;
  padding: 10px 24px;
  border-radius: 20px;
  background: rgba(10, 35, 55, 0.95);
  border: 1px solid rgba(120, 180, 220, 0.5);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  animation: toastIn 0.3s ease-out;
  pointer-events: none;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.forge-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.forge-gold-bar {
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(40, 30, 10, 0.8), rgba(20, 15, 5, 0.8));
  border-radius: 12px;
  border: 1px solid rgba(200, 160, 40, 0.4);
  text-align: center;
  color: #ffd76e;
  font-size: 0.9rem;
}

.forge-gold-bar strong {
  font-size: 1.05rem;
}

.forge-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.forge-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(10, 30, 50, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(100, 160, 200, 0.2);
  transition: all 0.2s ease;
}

.forge-item:hover {
  border-color: rgba(150, 210, 255, 0.5);
  box-shadow: 0 0 10px rgba(100, 180, 255, 0.15);
}

.forge-item-img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  border-radius: 6px;
  background: rgba(20, 50, 80, 0.5);
  padding: 3px;
  border: 1px solid rgba(120, 180, 220, 0.25);
  flex-shrink: 0;
}

.forge-item-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.forge-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.forge-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e0e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.forge-item-level {
  font-size: 0.72rem;
  color: rgba(180, 210, 240, 0.7);
}

.forge-item-cost {
  font-size: 0.72rem;
  color: #ffd76e;
}

.forge-item-growth {
  font-size: 0.7rem;
  color: #7bed9f;
}

.forge-upgrade-btn {
  padding: 6px 16px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(30, 100, 60, 0.9), rgba(15, 55, 35, 0.9));
  border: 1.5px solid rgba(80, 200, 120, 0.6);
  color: #90eea0;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  flex-shrink: 0;
  white-space: nowrap;
}

.forge-upgrade-btn:hover:not(:disabled) {
  box-shadow: 0 0 15px rgba(80, 200, 120, 0.3);
  transform: translateY(-1px);
}

.forge-upgrade-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.forge-upgrade-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.forge-max {
  font-size: 0.75rem;
  color: #7bed9f;
  font-weight: 700;
  flex-shrink: 0;
}

.forge-item-equipped {
  border-color: rgba(255, 200, 60, 0.4);
  background: rgba(40, 35, 10, 0.5);
}

.forge-equipped-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 200, 60, 0.25);
  border: 1px solid rgba(255, 200, 60, 0.5);
  color: #ffd76e;
  font-size: 0.6rem;
  font-weight: 700;
  vertical-align: middle;
}

@media (max-width: 440px) {
  .modal-content {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px;
  }

  .equipment-section {
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .backpack-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 3px;
  }

  .item-icon {
    font-size: 1rem;
  }
}

</style>
