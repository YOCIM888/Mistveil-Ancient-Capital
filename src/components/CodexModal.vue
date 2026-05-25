<template>
  <div v-if="modelValue" class="codex-overlay" @click.self="close">
    <div class="codex-content">
      <div class="codex-header">
        <h2 class="codex-title">📖 千雾图鉴</h2>
        <button class="codex-close" @click="close">✕</button>
      </div>

      <div class="codex-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="codex-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="codex-body">
        <div v-if="activeTab === 'equipment'" class="tab-content">
          <div class="codex-summary">已收集 {{ equipmentCollected }} / {{ equipmentTotal }}</div>
          <div class="equipment-grid">
            <div
              v-for="eq in allEquipment"
              :key="eq.name"
              class="equip-card"
              :class="{ locked: !isEquipmentCollected(eq.name) }"
            >
              <div class="equip-rarity" :style="{ background: rarityColor(eq.rarity) }"></div>
              <div class="equip-icon-frame">
                <img v-if="isEquipmentCollected(eq.name)" :src="eq.img" :alt="eq.name" class="equip-img" />
                <span v-else class="equip-icon locked-icon">🔒</span>
              </div>
              <span class="equip-name">{{ isEquipmentCollected(eq.name) ? eq.name : '???' }}</span>
              <span v-if="isEquipmentCollected(eq.name)" class="equip-rarity-text" :style="{ color: rarityColor(eq.rarity) }">
                {{ rarityLabel(eq.rarity) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'items'" class="tab-content">
          <div class="codex-summary">已收集 {{ itemsCollected }} / {{ itemsTotal }}</div>
          <div class="items-grid">
            <div
              v-for="item in allItems"
              :key="item.name"
              class="item-card"
              :class="{ locked: !isItemCollected(item.name) }"
            >
              <img v-if="isItemCollected(item.name) && item.img" :src="item.img" :alt="item.name" class="item-img" />
              <span v-else class="item-icon">{{ isItemCollected(item.name) ? item.icon : '❓' }}</span>
              <span class="item-name">{{ isItemCollected(item.name) ? item.name : '???' }}</span>
              <span v-if="isItemCollected(item.name)" class="item-desc">{{ item.desc }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'monsters'" class="tab-content">
          <div class="monster-section" v-if="uniqueNormals.length">
            <h3 class="monster-category">⚔️ 普通怪物</h3>
            <div class="monster-grid">
              <div
                v-for="m in uniqueNormals"
                :key="m.name"
                class="monster-card"
                :class="{ locked: !m.defeated }"
              >
                <div class="monster-img-frame">
                  <img
                    v-if="m.defeated"
                    :src="`/image/monster/${m.img}`"
                    :alt="m.name"
                    class="monster-img"
                    @error="onImgError"
                  >
                  <span v-else class="monster-silhouette">👤</span>
                </div>
                <span class="monster-name">{{ m.defeated ? m.name : '???' }}</span>
              </div>
            </div>
          </div>

          <div class="monster-section" v-if="uniqueElites.length">
            <h3 class="monster-category">🛡️ 精英怪物</h3>
            <div class="monster-grid">
              <div
                v-for="m in uniqueElites"
                :key="m.name"
                class="monster-card"
                :class="{ locked: !m.defeated }"
              >
                <div class="monster-img-frame">
                  <img
                    v-if="m.defeated"
                    :src="`/image/monster/${m.img}`"
                    :alt="m.name"
                    class="monster-img"
                    @error="onImgError"
                  >
                  <span v-else class="monster-silhouette">👤</span>
                </div>
                <span class="monster-name">{{ m.defeated ? m.name : '???' }}</span>
              </div>
            </div>
          </div>

          <div class="monster-section" v-if="uniqueBosses.length">
            <h3 class="monster-category monster-category-boss">💀 BOSS</h3>
            <div class="monster-grid">
              <div
                v-for="m in uniqueBosses"
                :key="m.name"
                class="monster-card monster-card-boss"
                :class="{ locked: !m.defeated }"
              >
                <div class="monster-img-frame boss-frame">
                  <img
                    v-if="m.defeated"
                    :src="`/image/monster/${m.img}`"
                    :alt="m.name"
                    class="monster-img"
                    @error="onImgError"
                  >
                  <span v-else class="monster-silhouette">👤</span>
                </div>
                <span class="monster-name">{{ m.defeated ? m.name : '???' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'achievements'" class="tab-content">
          <div class="codex-summary">
            已完成 {{ allAchievements.filter(a => a.unlocked).length }} / {{ allAchievements.length }}
            <span class="ach-rate">({{ Math.round(allAchievements.filter(a => a.unlocked).length / allAchievements.length * 100) }}%)</span>
          </div>
          
          <div class="achievement-section-title">🎯 游戏成就</div>
          <div class="achievement-list">
            <div
              v-for="ach in gameAchievements"
              :key="ach.id"
              class="ach-card"
              :class="{ unlocked: ach.unlocked }"
            >
              <span class="ach-icon">{{ ach.icon }}</span>
              <div class="ach-info">
                <span class="ach-name">{{ ach.name }}</span>
                <span class="ach-desc">{{ ach.desc }}</span>
              </div>
              <div class="ach-status">
                <span v-if="ach.unlocked" class="ach-done">✓</span>
                <span v-else class="ach-undone">—</span>
              </div>
            </div>
          </div>
          
          <div class="achievement-section-title" style="margin-top: 16px;">🌫️ 迷雾岛成就</div>
          <div class="achievement-list">
            <div
              v-for="ach in mistIslandAchievements"
              :key="ach.id"
              class="ach-card"
              :class="{ unlocked: ach.unlocked }"
            >
              <span class="ach-icon">{{ ach.icon }}</span>
              <div class="ach-info">
                <span class="ach-name">{{ ach.name }}</span>
                <span class="ach-desc">{{ ach.desc }}</span>
              </div>
              <div class="ach-status">
                <span v-if="ach.unlocked" class="ach-done">✓</span>
                <span v-else class="ach-undone">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS } from '@/data/monsters'
import { useInventoryStore } from '@/stores/inventory'
import { useDungeonStore } from '@/stores/dungeon'
import { useAchievementStore } from '@/stores/achievement'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const inventoryStore = useInventoryStore()
const dungeonStore = useDungeonStore()
const achievementStore = useAchievementStore()
const playerStore = usePlayerStore()

const activeTab = ref('equipment')

const MIST_ISLAND_ACHIEVEMENTS = [
  { id: 'mist_1', name: '迷雾初探', desc: '通关1次迷雾岛', icon: '🌫️' },
  { id: 'mist_10', name: '迷雾行者', desc: '通关10次迷雾岛', icon: '🌊' },
  { id: 'mist_30', name: '迷雾之主', desc: '通关30次迷雾岛', icon: '👑' },
]

const gameAchievements = computed(() => achievementStore.achievements)

const mistIslandAchievements = computed(() => {
  const cleared = playerStore.mistIslandClears || 0
  const unlockedIds = playerStore.achievements || []
  return MIST_ISLAND_ACHIEVEMENTS.map(ach => ({
    ...ach,
    unlocked: unlockedIds.includes(ach.id) || cleared >= parseInt(ach.id.split('_')[1])
  }))
})

const allAchievements = computed(() => [
  ...gameAchievements.value,
  ...mistIslandAchievements.value
])

const tabs = [
  { key: 'equipment', label: '装备' },
  { key: 'items', label: '道具' },
  { key: 'monsters', label: '怪物' },
  { key: 'achievements', label: '成就' }
]

function close() {
  emit('update:modelValue', false)
}

function onOpen() {
  achievementStore.checkAchievements()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    onOpen()
  }
})

const allEquipment = computed(() => Object.values(EQUIPMENT))

const allItems = computed(() => Object.values(ITEMS))

const equipmentCollected = computed(() => {
  const backpack = inventoryStore.backpackItems || []
  const equipped = inventoryStore.equippedItems || {}
  const collectedNames = new Set()
  backpack.forEach(item => { if (EQUIPMENT[item.name]) collectedNames.add(item.name) })
  Object.values(equipped).forEach(item => { if (item && EQUIPMENT[item.name]) collectedNames.add(item.name) })
  return collectedNames.size
})
const equipmentTotal = computed(() => allEquipment.value.length)

const itemsCollected = computed(() => {
  // 只统计 ITEMS 数据中存在的道具，排除装备名
  return inventoryStore.collectedItems.filter(name => ITEMS[name]).length
})
const itemsTotal = computed(() => allItems.value.length)

function isEquipmentCollected(name) {
  const backpack = inventoryStore.backpackItems || []
  const equipped = inventoryStore.equippedItems || {}
  const inBackpack = backpack.some(item => item.name === name)
  const inEquipped = Object.values(equipped).some(item => item && item.name === name)
  return inBackpack || inEquipped
}

function isItemCollected(name) {
  return inventoryStore.collectedItems.includes(name)
}

function rarityColor(rarity) {
  const map = {
    blue: '#4a9eff',
    purple: '#b44aff',
    orange: '#ff8c3a',
    red: '#ff3a3a'
  }
  return map[rarity] || '#aaa'
}

function rarityLabel(rarity) {
  const map = {
    blue: '稀有',
    purple: '史诗',
    orange: '传说',
    red: '神话'
  }
  return map[rarity] || rarity
}

function equipIcon(type) {
  const map = {
    weapon: '⚔️',
    head: '⛑️',
    chest: '🛡️',
    legs: '👖',
    boots: '👢',
    accessory: '💍'
  }
  return map[type] || '📦'
}

function dedupeMonsters(source, defeatedFloors) {
  const seen = new Map()
  Object.entries(source).forEach(([floor, m]) => {
    const f = Number(floor)
    if (!seen.has(m.name)) {
      seen.set(m.name, {
        name: m.name,
        img: m.img,
        floor: f,
        defeated: defeatedFloors.includes(f)
      })
    } else if (!seen.get(m.name).defeated && defeatedFloors.includes(f)) {
      seen.get(m.name).defeated = true
    }
  })
  return Array.from(seen.values())
}

const uniqueNormals = computed(() =>
  dedupeMonsters(MONSTERS, dungeonStore.defeatedMonsters.normals)
)

const uniqueElites = computed(() =>
  dedupeMonsters(ELITE_MONSTERS, dungeonStore.defeatedMonsters.elites)
)

const uniqueBosses = computed(() =>
  dedupeMonsters(BOSS_MONSTERS, dungeonStore.defeatedMonsters.bosses)
)

function onImgError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.codex-overlay {
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

.codex-content {
  width: 92%;
  max-width: 440px;
  height: 85vh;
  background: linear-gradient(135deg, rgba(20, 20, 25, 0.98), rgba(10, 10, 15, 0.98));
  border-radius: 20px;
  border: 1.5px solid rgba(120, 110, 90, 0.5);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(80, 70, 50, 0.25),
    0 0 80px rgba(100, 90, 70, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.codex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(100, 90, 70, 0.3);
  flex-shrink: 0;
}

.codex-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #d8d0c8;
  text-shadow: 0 0 12px rgba(150, 140, 120, 0.5), 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
}

.codex-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(30, 30, 35, 0.8);
  border: 1.5px solid rgba(100, 90, 70, 0.4);
  color: #c0b8b0;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.codex-close:hover {
  transform: scale(1.1);
  background: rgba(50, 50, 55, 0.9);
  border-color: rgba(150, 140, 120, 0.7);
  box-shadow: 0 0 15px rgba(120, 110, 90, 0.3);
}

.codex-tabs {
  display: flex;
  gap: 2px;
  padding: 0 20px;
  background: rgba(10, 10, 15, 0.6);
  border-bottom: 1px solid rgba(80, 70, 50, 0.2);
  flex-shrink: 0;
}

.codex-tab {
  flex: 1;
  padding: 10px 4px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #a0a0a8;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.codex-tab:hover {
  color: #c8c8c8;
}

.codex-tab.active {
  color: #d8d0c8;
  border-bottom-color: #b0a080;
  text-shadow: 0 0 10px rgba(150, 140, 120, 0.6);
}

.codex-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.tab-content {
  min-height: 200px;
}

.codex-summary {
  font-size: 0.85rem;
  color: #b0a8a0;
  margin-bottom: 14px;
  padding: 8px 14px;
  background: rgba(20, 20, 25, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(100, 90, 70, 0.25);
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ---------- 装备网格 ---------- */
.equipment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.equip-card {
  background: linear-gradient(145deg, rgba(25, 25, 30, 0.85), rgba(10, 10, 15, 0.9));
  border-radius: 14px;
  padding: 10px 6px 8px;
  border: 1px solid rgba(100, 90, 70, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.equip-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(150, 140, 120, 0.6);
  box-shadow: 0 6px 20px rgba(80, 70, 50, 0.25);
}

.equip-card.locked {
  opacity: 0.5;
  border-color: rgba(60, 55, 45, 0.2);
}

.equip-rarity {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}

.equip-icon-frame {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(15, 15, 20, 0.8);
  border: 1px solid rgba(100, 90, 70, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.equip-icon.locked-icon {
  font-size: 1.2rem;
  opacity: 0.6;
}

.equip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.equip-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: #d0c8c0;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.equip-card.locked .equip-name {
  color: #707078;
}

.equip-rarity-text {
  font-size: 0.65rem;
  font-weight: 600;
}

/* ---------- 道具网格 ---------- */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.item-card {
  background: linear-gradient(145deg, rgba(25, 25, 30, 0.85), rgba(10, 10, 15, 0.9));
  border-radius: 14px;
  padding: 12px 8px 10px;
  border: 1px solid rgba(100, 90, 70, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
}

.item-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(150, 140, 120, 0.6);
  box-shadow: 0 6px 20px rgba(80, 70, 50, 0.25);
}

.item-card.locked {
  opacity: 0.5;
  border-color: rgba(60, 55, 45, 0.2);
}

.item-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.item-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  background: rgba(20, 40, 60, 0.3);
}

.item-card.locked .item-icon {
  filter: grayscale(1);
}

.item-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d0c8c0;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.item-card.locked .item-name {
  color: #707078;
}

.item-desc {
  font-size: 0.62rem;
  color: #6a9ab8;
  text-align: center;
  line-height: 1.3;
}

/* ---------- 怪物分区 ---------- */
.monster-section {
  margin-bottom: 20px;
}

.monster-section:last-child {
  margin-bottom: 0;
}

.monster-category {
  font-size: 0.9rem;
  font-weight: 700;
  color: #d0c8c0;
  margin: 0 0 10px 0;
  padding: 6px 12px;
  background: rgba(20, 20, 25, 0.7);
  border-radius: 8px;
  border-left: 3px solid #a09070;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.monster-category-boss {
  border-left-color: #c06060;
  background: rgba(30, 15, 15, 0.5);
  color: #d8a0a0;
}

.monster-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.monster-card {
  background: linear-gradient(145deg, rgba(25, 25, 30, 0.85), rgba(10, 10, 15, 0.9));
  border-radius: 14px;
  padding: 10px 6px 8px;
  border: 1px solid rgba(100, 90, 70, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.25s ease;
}

.monster-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(150, 140, 120, 0.6);
  box-shadow: 0 6px 20px rgba(80, 70, 50, 0.25);
}

.monster-card.locked {
  opacity: 0.5;
  border-color: rgba(60, 55, 45, 0.2);
}

.monster-card-boss {
  border-color: rgba(180, 80, 80, 0.4);
}

.monster-card-boss:hover:not(.locked) {
  border-color: rgba(200, 100, 100, 0.7);
  box-shadow: 0 6px 20px rgba(180, 70, 70, 0.3);
}

.monster-img-frame {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(15, 15, 20, 0.8);
  border: 1px solid rgba(100, 90, 70, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.boss-frame {
  border-color: rgba(180, 80, 80, 0.5);
  background: rgba(25, 10, 10, 0.8);
}

.monster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.monster-silhouette {
  font-size: 1.8rem;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.monster-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #c8dff8;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.monster-card.locked .monster-name {
  color: #557a9a;
}

/* ---------- 成就列表 ---------- */
.achievement-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #c0b8a8;
  margin-bottom: 10px;
  padding: 4px 8px;
}

.ach-rate {
  color: #a0a0a8;
  font-size: 0.8rem;
  margin-left: 4px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ach-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.85), rgba(10, 10, 15, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(90, 80, 60, 0.25);
  transition: all 0.25s ease;
}

.ach-card.unlocked {
  border-color: rgba(150, 140, 120, 0.5);
  background: linear-gradient(145deg, rgba(25, 25, 30, 0.9), rgba(12, 12, 18, 0.92));
  box-shadow: 0 0 15px rgba(100, 90, 70, 0.15);
}

.ach-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 38px;
  text-align: center;
}

.ach-card:not(.unlocked) .ach-icon {
  filter: grayscale(0.8);
  opacity: 0.5;
}

.ach-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ach-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #d0c8c0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.ach-card:not(.unlocked) .ach-name {
  color: #808088;
}

.ach-desc {
  font-size: 0.72rem;
  color: #a0a0a8;
  line-height: 1.3;
}

.ach-status {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.ach-done {
  color: #a0c8a0;
  background: rgba(60, 80, 60, 0.4);
  border: 1.5px solid rgba(120, 160, 120, 0.5);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ach-undone {
  color: #707078;
  font-size: 1rem;
}

/* ---------- 滚动条 ---------- */
.codex-body::-webkit-scrollbar {
  width: 5px;
}

.codex-body::-webkit-scrollbar-track {
  background: rgba(15, 15, 20, 0.4);
  border-radius: 3px;
}

.codex-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #807060, #504538);
  border-radius: 3px;
  border: 1px solid rgba(100, 90, 70, 0.3);
}

.codex-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #908070, #605548);
}

/* ---------- 响应式 ---------- */
@media (max-width: 440px) {
  .codex-content {
    max-width: 100%;
    border-radius: 16px;
  }

  .equipment-grid,
  .items-grid,
  .monster-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .equip-name,
  .item-name,
  .monster-name {
    font-size: 0.68rem;
  }

  .equip-icon-frame,
  .monster-img-frame {
    width: 42px;
    height: 42px;
  }

  .codex-body {
    padding: 12px 14px;
  }
}
</style>
