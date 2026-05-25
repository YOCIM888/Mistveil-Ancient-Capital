<script>
import { ref } from 'vue'
export const oneHitKill = ref(false)
export const instantKill = ref(false)
export const hpLocked = ref(false)
export const mpLocked = ref(false)
export const forceTame = ref(false)
</script>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useAchievementStore } from '@/stores/achievement'
import { useDungeonStore } from '@/stores/dungeon'
import { useHomeStore } from '@/stores/home'
import { useRuneStore } from '@/stores/rune'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { RUNE_TYPES } from '@/data/runes'

const CLASS_STAT_BONUSES = {
  狂战: { 力量: 3, 体质: 2, 敏捷: 1, 感知: 1, 智力: 1, 幸运: 1 },
  游侠: { 力量: 2, 体质: 1, 敏捷: 3, 感知: 1, 智力: 1, 幸运: 1 },
  牧师: { 力量: 1, 体质: 1, 敏捷: 1, 感知: 3, 智力: 2, 幸运: 1 },
  法师: { 力量: 1, 体质: 1, 敏捷: 1, 感知: 1, 智力: 3, 幸运: 2 },
  盾骑: { 力量: 2, 体质: 3, 敏捷: 1, 感知: 1, 智力: 1, 幸运: 1 },
  武僧: { 力量: 2, 体质: 2, 敏捷: 2, 感知: 1, 智力: 1, 幸运: 1 },
  平民: { 力量: 1, 体质: 1, 敏捷: 1, 感知: 1, 智力: 1, 幸运: 4 },
}

const TOP_ITEMS = [
  '生命之水',
  '附魔之水',
  '经验圣典',
  '契约卷轴',
  '通灵卷轴',
  '暴戾卷轴',
  '金甲卷轴',
  '飓风卷轴',
  '威能卷轴',
]

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

const inputRef = ref(null)
const historyEl = ref(null)
const commandInput = ref('')
const toastMsg = ref('')

const history = ref([
  {
    command: '',
    response: '欢迎使用作弊控制台！输入 /help 查看帮助',
  },
])

function scrollToBottom() {
  nextTick(() => {
    if (historyEl.value) {
      historyEl.value.scrollTop = historyEl.value.scrollHeight
    }
  })
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function pushHistory(cmd, response) {
  history.value.push({ command: cmd, response })
  scrollToBottom()
}

function recalcStats(level) {
  const user = authStore.accounts?.[authStore.currentUser]
  if (!user) return
  const charClass = user.characterClass
  if (!charClass) return
  const bonus = CLASS_STAT_BONUSES[charClass]
  if (!bonus) return
  if (!user.classStats) {
    user.classStats = { 力量: 0, 体质: 0, 敏捷: 0, 感知: 0, 智力: 0, 幸运: 0 }
  }
  user.classStats.力量 = 5 + (bonus.力量 || 0) * level
  user.classStats.体质 = 5 + (bonus.体质 || 0) * level
  user.classStats.敏捷 = 5 + (bonus.敏捷 || 0) * level
  user.classStats.感知 = 5 + (bonus.感知 || 0) * level
  user.classStats.智力 = 5 + (bonus.智力 || 0) * level
  user.classStats.幸运 = 5 + (bonus.幸运 || 0) * level
  authStore.saveAccounts()
}

function executeCommand(cmd) {
  const trimmed = cmd.trim()
  if (!trimmed) return ''

  if (trimmed === '/help') {
    return [
      '═══════ 帮助 ═══════',
      '',
      '【资源类】',
      '  /add_gold {数量}       - 增加金币',
      '  /sub_gold {数量}       - 减少金币',
      '  /add_diamond {数量}    - 增加钻石',
      '  /sub_diamond {数量}    - 减少钻石',
      '  /add_evo {数量}        - 增加进化币',
      '  /sub_evo {数量}        - 减少进化币',
      '  /add_talent {数量}     - 增加天赋点',
      '  /sub_talent {数量}     - 减少天赋点',
      '',
      '【等级状态】',
      '  /set_level {等级}      - 设置等级（exp归零）',
      '  /reset_level           - 重置为1级',
      '',
      '【战斗作弊】',
      '  /god_on / god_off      - 锁血开关（无敌模式）',
      '  /mp_on / mp_off        - 锁蓝开关（蓝量不减）',
      '  /kill_on / kill_off    - 一击必杀开关',
      '  /tame_on / tame_off    - 强制驯服开关（100%成功率）',
      '',
      '【装备管理】',
      '  /equip_max             - 装备栏全部满级（60级）',
      '  /equip_reset           - 装备栏等级归零',
      '  /get_op                - 创世六件套（直接装备）',
      '  /get_new               - 新手六件套（直接装备）',
      '  /get_moyun             - 墨韵六件套（放入背包）',
      '',
      '【道具获取】',
      '  /add_contract {数量}   - 添加创世契约',
      '  /add_lifewater {数量}  - 添加生命之水',
      '  /add_enchantwater {数量} - 添加附魔之水',
      '  /get_items_道具名 数量 - 获得指定道具（如 /get_items_小经验瓶 10）',
      '',
      '【符文获取】',
      '  /get_rune_符文名_等级 数量 - 获得指定符文',
      '    符文名: 攻击/防御/生命/速度/魔力/暴击/爆伤/闪避/回复',
      '    示例: /get_rune_暴击_10 5  → 获得5个10级暴击符文',
      '',
      '【成就进度】',
      '  /all_achievement       - 解锁全部成就',
      '  /unlock_100floor       - 解锁1-100层地宫',
      '',
      '【家园作弊】',
      '  /reset_home_cd         - 免除家园所有等待冷却',
      '  /add_home_coins {数量} - 添加指定数量家园币',
    ].join('\n')
  }

  const addGoldMatch = trimmed.match(/^\/add_gold\s+(\d+)$/)
  if (addGoldMatch) {
    const amount = parseInt(addGoldMatch[1])
    playerStore.addGold(amount)
    return `已增加 ${amount} 金币，当前金币：${playerStore.gold}`
  }

  const subGoldMatch = trimmed.match(/^\/sub_gold\s+(\d+)$/)
  if (subGoldMatch) {
    const amount = parseInt(subGoldMatch[1])
    playerStore.gold = Math.max(0, playerStore.gold - amount)
    return `已减少 ${amount} 金币，当前金币：${playerStore.gold}`
  }

  const addDiamondMatch = trimmed.match(/^\/add_diamond\s+(\d+)$/)
  if (addDiamondMatch) {
    const amount = parseInt(addDiamondMatch[1])
    playerStore.addDiamond(amount)
    return `已增加 ${amount} 钻石，当前钻石：${playerStore.diamond}`
  }

  const subDiamondMatch = trimmed.match(/^\/sub_diamond\s+(\d+)$/)
  if (subDiamondMatch) {
    const amount = parseInt(subDiamondMatch[1])
    playerStore.diamond = Math.max(0, playerStore.diamond - amount)
    return `已减少 ${amount} 钻石，当前钻石：${playerStore.diamond}`
  }

  const addEvoMatch = trimmed.match(/^\/add_evo\s+(\d+)$/)
  if (addEvoMatch) {
    const amount = parseInt(addEvoMatch[1])
    playerStore.addEvolutionCoin(amount)
    return `已增加 ${amount} 进化币，当前进化币：${playerStore.evolutionCoin}`
  }

  const subEvoMatch = trimmed.match(/^\/sub_evo\s+(\d+)$/)
  if (subEvoMatch) {
    const amount = parseInt(subEvoMatch[1])
    playerStore.evolutionCoin = Math.max(0, playerStore.evolutionCoin - amount)
    return `已减少 ${amount} 进化币，当前进化币：${playerStore.evolutionCoin}`
  }

  const addTalentMatch = trimmed.match(/^\/add_talent\s+(\d+)$/)
  if (addTalentMatch) {
    const amount = parseInt(addTalentMatch[1])
    playerStore.talentPoints += amount
    return `已增加 ${amount} 天赋点，当前天赋点：${playerStore.talentPoints}`
  }

  const subTalentMatch = trimmed.match(/^\/sub_talent\s+(\d+)$/)
  if (subTalentMatch) {
    const amount = parseInt(subTalentMatch[1])
    playerStore.talentPoints = Math.max(0, playerStore.talentPoints - amount)
    return `已减少 ${amount} 天赋点，当前天赋点：${playerStore.talentPoints}`
  }

  const setLevelMatch = trimmed.match(/^\/set_level\s+(\d+)$/)
  if (setLevelMatch) {
    const targetLevel = parseInt(setLevelMatch[1])
    if (targetLevel < 1) return '等级不能小于 1'
    playerStore.level = targetLevel
    playerStore.exp = 0
    recalcStats(targetLevel)
    return `等级已设置为 Lv.${targetLevel}，属性已重新计算，经验已归零`
  }

  if (trimmed === '/reset_level') {
    playerStore.level = 1
    playerStore.exp = 0
    recalcStats(1)
    return '等级已重置为 Lv.1，属性已重新计算，经验已归零'
  }

  if (trimmed === '/god_on') {
    hpLocked.value = true
    return '锁血已开启（无敌模式）'
  }

  if (trimmed === '/god_off') {
    hpLocked.value = false
    return '锁血已关闭'
  }

  if (trimmed === '/mp_on') {
    mpLocked.value = true
    return '锁蓝已开启（蓝量不减）'
  }

  if (trimmed === '/mp_off') {
    mpLocked.value = false
    return '锁蓝已关闭'
  }

  if (trimmed === '/kill_on') {
    oneHitKill.value = true
    return '一击必杀已开启'
  }

  if (trimmed === '/kill_off') {
    oneHitKill.value = false
    return '一击必杀已关闭'
  }

  if (trimmed === '/tame_on') {
    forceTame.value = true
    return '强制驯服已开启（成功率100%）'
  }

  if (trimmed === '/tame_off') {
    forceTame.value = false
    return '强制驯服已关闭'
  }

  if (trimmed === '/equip_max') {
    const items = inventoryStore.backpackItems.filter(i => i.type === 'equipment')
    if (items.length === 0) return '背包中没有装备'
    for (const item of items) {
      item.equipmentLevel = 60
    }
    authStore.saveAccounts()
    return '背包中所有装备已满级（60级）'
  }

  if (trimmed === '/equip_reset') {
    const items = inventoryStore.backpackItems.filter(i => i.type === 'equipment')
    if (items.length === 0) return '背包中没有装备'
    for (const item of items) {
      item.equipmentLevel = 0
    }
    authStore.saveAccounts()
    return '背包中所有装备等级已归零'
  }

  if (trimmed === '/get_op') {
    const opEquips = ['创世神剑', '创世神盔', '创世神袍', '创世神裤', '创世神靴', '创世神戒']
    for (const name of opEquips) {
      const eq = EQUIPMENT[name]
      if (eq) {
        inventoryStore.addItem({ name: eq.name, type: 'equipment', equipmentLevel: 60 })
      }
    }
    return '已获得创世六件套（全部60级），已放入背包'
  }

  if (trimmed === '/get_new') {
    const newEquips = ['新手铁剑', '新手草帽', '新手上衣', '新手裤子', '新手靴子', '新手护符']
    for (const name of newEquips) {
      const eq = EQUIPMENT[name]
      if (eq) {
        inventoryStore.addItem({ name: eq.name, type: 'equipment', equipmentLevel: 1 })
      }
    }
    return '已获得新手六件套（全部1级），已放入背包'
  }

  if (trimmed === '/get_moyun') {
    const names = ['墨韵之剑', '墨韵发冠', '墨韵长衫', '墨韵下裳', '墨韵步履', '墨韵玉佩']
    for (const name of names) {
      const eq = EQUIPMENT[name]
      if (eq) {
        inventoryStore.addItem({ name: eq.name, type: 'equipment', equipmentLevel: 1 })
      }
    }
    return '✅ 已获得墨韵六件套！'
  }

  const addContractMatch = trimmed.match(/^\/add_contract\s+(\d+)$/)
  if (addContractMatch) {
    const amount = parseInt(addContractMatch[1])
    for (let i = 0; i < amount; i++) {
      inventoryStore.addItem({
        name: '创世契约',
        icon: ITEMS['创世契约']?.icon || '',
        img: ITEMS['创世契约']?.img || '',
        type: 'tame',
        effect: { type: 'all' },
        quantity: 1,
      })
    }
    return `已添加 ${amount} 个创世契约到背包`
  }

  const addLifewaterMatch = trimmed.match(/^\/add_lifewater\s+(\d+)$/)
  if (addLifewaterMatch) {
    const amount = parseInt(addLifewaterMatch[1])
    for (let i = 0; i < amount; i++) {
      inventoryStore.addItem({
        name: '生命之水',
        icon: ITEMS['生命之水']?.icon || '',
        img: ITEMS['生命之水']?.img || '',
        type: 'heal',
        effect: { healPercent: 1 },
        quantity: 1,
      })
    }
    return `已添加 ${amount} 个生命之水到背包`
  }

  const addEnchantwaterMatch = trimmed.match(/^\/add_enchantwater\s+(\d+)$/)
  if (addEnchantwaterMatch) {
    const amount = parseInt(addEnchantwaterMatch[1])
    for (let i = 0; i < amount; i++) {
      inventoryStore.addItem({
        name: '附魔之水',
        icon: ITEMS['附魔之水']?.icon || '',
        img: ITEMS['附魔之水']?.img || '',
        type: 'mana',
        effect: { manaPercent: 1 },
        quantity: 1,
      })
    }
    return `已添加 ${amount} 个附魔之水到背包`
  }

  const getRuneMatch = trimmed.match(/^\/get_rune_(攻击|防御|生命|速度|魔力|暴击|爆伤|闪避|回复)_(\d+)\s*(\d*)$/)
  if (getRuneMatch) {
    const runeNameMap = {
      '攻击': 'attack', '防御': 'defense', '生命': 'health', '速度': 'speed',
      '魔力': 'magic', '暴击': 'critical', '爆伤': 'critDmg', '闪避': 'dodge', '回复': 'regen',
    }
    const runeType = runeNameMap[getRuneMatch[1]]
    const runeLevel = Math.min(10, Math.max(1, parseInt(getRuneMatch[2])))
    const quantity = parseInt(getRuneMatch[3]) || 1
    if (!runeType) return `未知符文类型：${getRuneMatch[1]}`
    const runeStore = useRuneStore()
    const typeInfo = RUNE_TYPES[runeType]
    if (!typeInfo) return `未知符文类型：${getRuneMatch[1]}`
    const u = authStore.accounts?.[authStore.currentUser]
    if (!u) return '未登录'
    if (!u.runes) u.runes = []
    for (let i = 0; i < quantity; i++) {
      u.runes.push({
        id: `rune_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_c${i}`,
        type: runeType,
        level: runeLevel,
        name: typeInfo.name,
        icon: typeInfo.icon || '',
        color: typeInfo.color || '#888888',
      })
    }
    authStore.saveAccounts()
    return `已添加 ${quantity} 个 ${runeLevel}级${getRuneMatch[1]}符文`
  }

  const getItemsMatch = trimmed.match(/^\/get_items_(.+?)\s+(\d+)$/)
  if (getItemsMatch) {
    const itemName = getItemsMatch[1].trim()
    const quantity = parseInt(getItemsMatch[2])
    const itemData = ITEMS[itemName]
    if (!itemData) return `未知道具：${itemName}（可用道具：${Object.keys(ITEMS).join('、')}）`
    const stackableTypes = ['consumable', 'material', 'heal', 'mana', 'exp', 'tame', 'buff']
    const itemType = itemData.type === 'heal' || itemData.type === 'mana' || itemData.type === 'exp' ? 'consumable' : (stackableTypes.includes(itemData.type) ? itemData.type : 'material')
    inventoryStore.addItem({
      name: itemData.name,
      icon: itemData.icon || '',
      img: itemData.img || '',
      type: itemType,
      itemType: itemData.type || 'other',
      effect: itemData.effect || null,
      quantity: quantity,
    })
    return `已添加 ${quantity} 个 ${itemName} 到背包`
  }

  if (trimmed === '/all_achievement') {
    const achievementStore = useAchievementStore()
    const allIds = achievementStore.achievements.map(d => d.id)
    achievementStore.unlockedAchievements = [...allIds]
    achievementStore.saveAchievements()
    return `已解锁全部 ${allIds.length} 个成就`
  }

  if (trimmed === '/unlock_100floor') {
    const dungeonStore = useDungeonStore()
    for (let floor = 1; floor <= 100; floor++) {
      dungeonStore.clearFloor(floor)
      dungeonStore.recordDefeated(floor, 'normals')
      dungeonStore.recordDefeated(floor, 'elites')
      dungeonStore.recordDefeated(floor, 'bosses')
    }
    return '已解锁1-100层地宫（全部楼层已通关，全部怪物类型已记录）'
  }

  if (trimmed === '/reset_home_cd') {
    const homeStore = useHomeStore()
    homeStore.fishCooldown = 0
    homeStore.plantCooldown = 0
    homeStore.workEndTime = 0
    return '✅ 家园所有冷却已清零！'
  }

  const addHomeCoinsMatch = trimmed.match(/^\/add_home_coins\s+(\d+)$/)
  if (addHomeCoinsMatch) {
    const amount = parseInt(addHomeCoinsMatch[1])
    const homeStore = useHomeStore()
    homeStore.homeCoins = (homeStore.homeCoins || 0) + amount
    return `✅ 已添加 ${amount} 家园币！当前：${homeStore.homeCoins}`
  }

  return `未知命令：${trimmed}，输入 /help 查看帮助`
}

function onEnter() {
  const cmd = commandInput.value.trim()
  if (!cmd) return
  const response = executeCommand(cmd)
  pushHistory(cmd, response)
  commandInput.value = ''
  toastMsg.value = response
  setTimeout(() => {
    toastMsg.value = ''
  }, 2000)
}
</script>

<template>
  <div v-if="modelValue" class="console-float">
    <div class="console-titlebar">
      <span>🔧 指令控制台</span>
      <button class="console-close" @click="close">✕</button>
    </div>
    <div class="console-history" ref="historyEl">
      <div v-for="(h, idx) in history" :key="idx" class="console-entry">
        <div v-if="h.command" class="console-cmd">&gt; {{ h.command }}</div>
        <div class="console-resp">{{ h.response }}</div>
      </div>
    </div>
    <div class="console-input-row">
      <input v-model="commandInput" ref="inputRef" class="console-input" placeholder="输入指令..." @keydown.enter="onEnter" />
      <button class="console-run-btn" @click="onEnter">执行</button>
    </div>
    <div v-if="toastMsg" class="console-toast">{{ toastMsg }}</div>
  </div>
</template>

<style scoped>
.console-float {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: min(400px, calc(100vw - 32px));
  max-height: min(500px, calc(100vh - 120px));
  background: rgba(10, 20, 30, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(100, 160, 220, 0.4);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.console-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #0d1225;
  border-bottom: 1px solid #1a3a5c;
  border-radius: 8px 8px 0 0;
  color: #4dc9f6;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: move;
  user-select: none;
}

.console-close {
  background: none;
  border: none;
  color: #6a8a9a;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1;
  transition: all 0.2s ease;
}

.console-close:hover {
  color: #ff6a6a;
  background: rgba(255, 100, 100, 0.1);
}

.console-history {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  min-height: 0;
}

.console-history::-webkit-scrollbar {
  width: 5px;
}

.console-history::-webkit-scrollbar-track {
  background: #0a0e1a;
}

.console-history::-webkit-scrollbar-thumb {
  background: #1a3a5c;
  border-radius: 3px;
}

.console-entry {
  margin-bottom: 6px;
}

.console-cmd {
  color: #a0d8ef;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.console-resp {
  color: #6a8a9a;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  padding-left: 2px;
  line-height: 1.5;
}

.console-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid #1a3a5c;
  background: #0d1225;
  border-radius: 0 0 8px 8px;
}

.console-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid #1a3a5c;
  border-radius: 4px;
  outline: none;
  color: #d0e8f0;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 12px;
  padding: 5px 8px;
  caret-color: #4dc9f6;
}

.console-input::placeholder {
  color: #3a5a6a;
}

.console-input:focus {
  border-color: #4dc9f6;
}

.console-run-btn {
  padding: 5px 12px;
  border-radius: 4px;
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #a0d8ef;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.console-run-btn:hover {
  background: #2a5a8c;
  border-color: #4dc9f6;
  color: #d0e8f0;
}

.console-toast {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a3a5c;
  color: #4dc9f6;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Courier New', 'Consolas', monospace;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  animation: toastFadeIn 0.3s ease;
  pointer-events: none;
}

@keyframes toastFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
