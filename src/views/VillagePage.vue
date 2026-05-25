<template>
  <div class="village-page">
    <video class="village-bg" src="/vedio/bg.mp4" autoplay loop muted playsinline></video>

    <div class="top-status-bar">
      <div class="sb-avatar" @click="goToSettings">
        <img
          :src="playerAvatar"
          class="sb-avatar-img"
          @error="(e) => e.target.style.display='none'"
        />
      </div>

      <div class="sb-player-info">
        <span class="sb-nickname">{{ playerStore.nickname || '冒险者' }}</span>
        <span class="sb-class">{{ playerStore.characterClass || '平民' }}</span>
      </div>

      <div class="sb-currency gold">
        <span class="sb-currency-icon">🪙</span>
        <span class="sb-currency-val">{{ formatCurrency(playerStore.gold) }}</span>
      </div>

      <div class="sb-currency diamond">
        <span class="sb-currency-icon">💎</span>
        <span class="sb-currency-val">{{ formatCurrency(playerStore.diamond || 0) }}</span>
      </div>

      <div class="sb-currency evo">
        <span class="sb-currency-icon">✨</span>
        <span class="sb-currency-val">{{ formatCurrency(playerStore.evolutionCoin || 0) }}</span>
      </div>

      <div class="sb-power">
        <span class="sb-power-icon">⚔️</span>
        <span class="sb-power-val">{{ formatPower(combatPower) }}</span>
      </div>
    </div>

    <div class="sb-power-bar">
      <div class="sb-power-bar-fill" :style="{ width: powerBarPercent + '%' }"></div>
      <span class="sb-power-bar-label">Lv.{{ playerStore.level || 1 }} · {{ playerStore.exp || 0 }}/{{ playerStore.expToNextLevel || 100 }}</span>
    </div>

    <div class="quick-actions">
      <div class="qa-btn" @click="openModal('home')">
        <img src="/image/UI/住处.webp" class="qa-img" />
        <span class="qa-label">住处</span>
      </div>
      <div class="qa-btn" @click="showMistIsland = true">
        <img src="/image/UI/迷雾岛.webp" class="qa-img" />
        <span class="qa-label">迷雾岛</span>
      </div>
      <div class="qa-btn" @click="quickPlaceholder('通天路')">
        <img src="/image/UI/通天路.webp" class="qa-img" />
        <span class="qa-label">通天路</span>
      </div>
      <div class="qa-btn" @click="quickPlaceholder('天外境')">
        <img src="/image/UI/天外境.webp" class="qa-img" />
        <span class="qa-label">天外境</span>
      </div>
      <div class="qa-btn" @click="showSettings = true">
        <img src="/image/UI/设置 .webp" class="qa-img" />
        <span class="qa-label">设置</span>
      </div>
    </div>

    <div class="right-vertical-bar">
      <img
        v-for="btn in rightButtons" :key="btn.key"
        :src="btn.img" :alt="btn.label"
        class="right-btn-img"
        @click="openModal(btn.key)"
      />
    </div>

    <div class="bottom-nav-bar">
      <img
        v-for="btn in bottomButtons" :key="btn.key"
        :src="btn.img" :alt="btn.label"
        class="bottom-btn-img"
        @click="openModal(btn.key)"
      />
    </div>

    <BackpackModal v-model="showBackpack" />
    <PetModal v-model="showPet" />
    <RuneSidebar v-model="showRune" />
    <DungeonModal v-model="showDungeon" @start-battle="startBattle" />
    <SkillModal v-model="showSkill" />
    <TalentModal v-model="showTalent" />
    <ChallengeModal v-model="showChallenge" @start-battle="startBattle" />
    <ShopModal v-model="showShop" />
    <GiftModal v-model="showGift" />
    <CodexModal v-model="showCodex" />
    <RedeemModal v-model="showRedeem" @trigger-console="onConsoleTrigger" />
    <div v-if="showCheckin" class="checkin-overlay" @click.self="showCheckin = false">
      <div class="checkin-panel">
        <div class="checkin-header">
          <button class="checkin-close" @click="showCheckin = false">✕</button>
          <div class="checkin-time">UTC+8: {{ currentTime }}</div>
        </div>
        <div class="checkin-tabs">
          <button :class="['checkin-tab', { active: checkinTab === 'newbie' }]" @click="checkinTab = 'newbie'">新手签到</button>
          <button :class="['checkin-tab', { active: checkinTab === 'monthly' }]" @click="checkinTab = 'monthly'">月签到</button>
        </div>

        <!-- 新手签到 -->
        <div v-if="checkinTab === 'newbie'" class="checkin-newbie-list">
          <div v-for="(day, idx) in newbieRewards" :key="idx"
            class="newbie-day-card"
            :class="{ active: newbieDay > idx + 1, claimed: newbieClaimed >= idx + 1, today: newbieDay === idx + 1 && newbieClaimed < idx + 1 }">
            <div class="newbie-day-header">
              <span class="newbie-day-num">第{{ idx + 1 }}天</span>
              <span v-if="newbieClaimed >= idx + 1" class="newbie-check">✓</span>
              <span v-else-if="newbieDay > idx + 1" class="newbie-missed">已过期</span>
            </div>
            <div class="newbie-day-items">
              <div v-for="(r, ri) in day" :key="ri" class="newbie-reward-item">
                <img v-if="r.img" :src="r.img" :alt="r.label" class="reward-img" />
                <span v-else class="reward-icon">{{ r.icon || '🎁' }}</span>
                <span class="reward-label">{{ r.label }}</span>
                <span v-if="r.qty && r.qty > 1" class="reward-qty">×{{ r.qty }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 月签到 -->
        <div v-if="checkinTab === 'monthly'" class="checkin-monthly-grid">
          <div v-for="day in monthlyRewards" :key="day.day"
            class="monthly-day-cell"
            :class="{ claimed: monthlyClaimed.includes(day.day), today: monthlyToday === day.day }">
            <span class="monthly-day-num">{{ day.day }}</span>
            <span class="monthly-day-reward">{{ day.label }}</span>
          </div>
        </div>

        <div class="checkin-progress">
          <span v-if="checkinTab === 'newbie'">{{ newbieClaimed }}/7 天</span>
          <span v-else>{{ monthlyClaimed.length }}/28 天</span>
        </div>

        <button class="checkin-btn" :disabled="currentClaimed" @click="doCheckin">
          {{ currentClaimed ? (checkinTab === 'newbie' && newbieClaimed >= 7 ? '签到完成' : '今日已签到') : '签到领取' }}
        </button>
      </div>
    </div>
    <MistIslandModal v-model="showMistIsland" />
    
    <Transition name="toast">
      <div v-if="showToast" class="village-toast">
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
      <div class="settings-panel">
        <div class="settings-header">
          <span class="settings-title">⚙️ 游戏设置</span>
          <button class="settings-close" @click="showSettings = false">✕</button>
        </div>
        <div class="settings-body">
          <div class="setting-row">
            <span class="setting-label">🎵 游戏音乐</span>
            <label class="toggle-switch">
              <input v-model="musicEnabled" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <BattleModal v-show="battleActive" :battle-config="battleConfig" @close="endBattle" @victory="onBattleVictory" @defeat="onBattleDefeat" />
    <ConsoleModal v-model="showConsole" />
    <HomeModal :show="showHome" @close="showHome = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { useRuneStore } from '@/stores/rune'
import BackpackModal from '@/components/BackpackModal.vue'
import PetModal from '@/components/PetModal.vue'
import RuneSidebar from '@/components/RuneSidebar.vue'
import DungeonModal from '@/components/DungeonModal.vue'
import SkillModal from '@/components/SkillModal.vue'
import TalentModal from '@/components/TalentModal.vue'
import ChallengeModal from '@/components/ChallengeModal.vue'
import CodexModal from '@/components/CodexModal.vue'
import ShopModal from '@/components/ShopModal.vue'
import GiftModal from '@/components/GiftModal.vue'
import RedeemModal from '@/components/RedeemModal.vue'
import ConsoleModal from '@/components/ConsoleModal.vue'
import BattleModal from '@/components/BattleModal.vue'
import HomeModal from '@/components/HomeModal.vue'
import MistIslandModal from '@/components/MistIslandModal.vue'
import { getCharacterStats, getEquipmentBonus, getTalentBonus, getTotalRuneBonus } from '@/utils/game'
import { ITEMS } from '@/data/items'
import { EQUIPMENT } from '@/data/equipment'
import { musicEnabled } from '@/utils/audioState'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()
const runeStore = useRuneStore()

const villageMessage = ref('')

const showBackpack = ref(false)
const showPet = ref(false)
const showRune = ref(false)
const showDungeon = ref(false)
const showSkill = ref(false)
const showTalent = ref(false)
const showChallenge = ref(false)
const showCodex = ref(false)
const showShop = ref(false)
const showGift = ref(false)
const showRedeem = ref(false)
const showConsole = ref(false)
const showHome = ref(false)
const showMistIsland = ref(false)
const showCheckin = ref(false)
const showSettings = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const battleActive = ref(false)
const battleConfig = ref(null)

const bottomButtons = [
  { key: 'backpack', label: '背包', img: '/image/UI/背包.webp' },
  { key: 'pet', label: '宠物', img: '/image/UI/宠物.webp' },
  { key: 'rune', label: '符文', img: '/image/UI/符文.webp' },
  { key: 'dungeon', label: '战斗', img: '/image/UI/战斗.webp' },
  { key: 'skill', label: '技能', img: '/image/UI/技能.webp' },
  { key: 'talent', label: '天赋', img: '/image/UI/天赋.webp' },
  { key: 'challenge', label: '挑战', img: '/image/UI/挑战.webp' },
]

const rightButtons = [
  { key: 'shop', label: '商城', img: '/image/UI/商店.webp' },
  { key: 'gift', label: '礼包', img: '/image/UI/礼包.webp' },
  { key: 'codex', label: '图鉴', img: '/image/UI/图鉴.webp' },
  { key: 'checkin', label: '签到', img: '/image/UI/签到.webp' },
  { key: 'redeem', label: '兑换', img: '/image/UI/兑换.webp' },
]

const modalMap = {
  backpack: showBackpack,
  pet: showPet,
  rune: showRune,
  dungeon: showDungeon,
  skill: showSkill,
  talent: showTalent,
  challenge: showChallenge,
  codex: showCodex,
  checkin: showCheckin,
  shop: showShop,
  gift: showGift,
  redeem: showRedeem,
  home: showHome,
  console: showConsole,
}

function openModal(name) {
  const refVal = modalMap[name]
  if (refVal) {
    refVal.value = true
    villageMessage.value = `打开了 ${name} 面板`
  }
}

function quickPlaceholder(name) {
  toastMessage.value = `「${name}」即将开放，敬请期待！`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function startBattle(config) {
  battleConfig.value = config
  battleActive.value = true
}

function endBattle() {
  battleActive.value = false
  battleConfig.value = null
}

function onBattleVictory(rewards) {
  if (rewards && rewards.items) {
    rewards.items.forEach(item => {
      inventoryStore.addItem(item)
    })
  }
  endBattle()
}

function onBattleDefeat() {
  endBattle()
  villageMessage.value = '战斗失败，请提升实力后再来挑战！'
}

function goToSettings() {
  router.push('/settings')
}

function onConsoleTrigger() {
  showRedeem.value = false
  showConsole.value = true
}

const displayNickname = computed(() => {
  return playerStore.nickname || '冒险者'
})

const displayClass = computed(() => {
  return playerStore.characterClass || '平民'
})

const avatarSrc = computed(() => {
  if (playerStore.customAvatar) {
    return playerStore.customAvatar
  }
  const cls = playerStore.characterClass || '平民'
  return `/image/main/${cls}头像.webp`
})

const expToNext = computed(() => {
  return playerStore.expToNextLevel || 100
})

const expPercent = computed(() => {
  const total = expToNext.value
  if (total <= 0) return 100
  const pct = ((playerStore.exp || 0) / total) * 100
  return Math.min(100, Math.max(0, pct))
})

function formatCurrency(val) {
  const n = Number(val) || 0
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

function formatPower(val) {
  const n = Math.floor(val) || 0
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

const powerBarPercent = computed(() => {
  const currentExp = playerStore.exp || 0
  const nextExp = playerStore.expToNextLevel || 100
  if (nextExp <= 0) return 100
  return Math.min(100, (currentExp / nextExp) * 100)
})

const combatPower = computed(() => {
  try {
    const cls = playerStore.characterClass || '平民'
    const lvl = playerStore.level || 1
    const eq = getEquipmentBonus(inventoryStore.equippedItems || {})
    const rn = getTotalRuneBonus(runeStore.activeRunes || [])
    const tb = getTalentBonus(playerStore.talents || {}, cls)
    const stats = getCharacterStats(cls, lvl, eq, rn, tb)
    const atk = stats.attack || 0
    const def = stats.defense || 0
    const hp = stats.maxHp || 0
    const spd = stats.atkSpeed || 0
    const mag = stats.magic || 0
    const crit = (stats.critRate || 0) * 100
    const critDmg = Math.max(0, ((stats.critDamage || 1.5) - 1.5)) * 50
    const dodge = (stats.dodgeRate || 0) * 100
    const regen = (stats.magicRegen || 0) * 10
    return atk * 2 + def * 1.5 + hp * 0.5 + spd * 3 + mag * 2 + crit + critDmg + dodge + regen
  } catch (e) {
    return 0
  }
})

const playerAvatar = computed(() => {
  const cls = playerStore.characterClass || '平民'
  return playerStore.customAvatar || '/image/role/' + cls + '.webp'
})

const checkinTab = ref('newbie')

// 新手签到奖励定义（含物品图片）
const newbieRewards = [
  [ // 第1天
    { icon: '💰', label: '66666金币', img: '' },
    { img: '/image/items/高级血瓶.webp', label: '高级血瓶', qty: 3 },
    { img: '/image/items/高级魔瓶.webp', label: '高级魔瓶', qty: 3 },
  ],
  [ // 第2天
    { icon: '💎', label: '188钻石', img: '' },
    { img: '/image/items/通灵卷轴.webp', label: '通灵卷轴', qty: 10 },
  ],
  [ // 第3天
    { icon: '💎', label: '288钻石', img: '' },
    { img: '/image/items/中经验瓶.webp', label: '中经验瓶', qty: 30 },
  ],
  [ // 第4天
    { icon: '💎', label: '388钻石', img: '' },
    { img: '/image/items/大经验瓶.webp', label: '大经验瓶', qty: 20 },
  ],
  [ // 第5天
    { icon: '💎', label: '588钻石', img: '' },
    { img: '/image/items/经验圣典.webp', label: '经验圣典', qty: 10 },
  ],
  [ // 第6天
    { icon: '💎', label: '666钻石', img: '' },
    { img: '/image/items/生命之水.webp', label: '生命之水', qty: 5 },
    { img: '/image/items/附魔之水.webp', label: '附魔之水', qty: 5 },
  ],
  [ // 第7天
    { icon: '💎', label: '888钻石', img: '' },
    { img: '/image/equipment/墨韵之剑.webp', label: '墨韵之剑' },
    { img: '/image/equipment/墨韵发冠.webp', label: '墨韵发冠' },
    { img: '/image/equipment/墨韵长衫.webp', label: '墨韵长衫' },
    { img: '/image/equipment/墨韵下裳.webp', label: '墨韵下裳' },
    { img: '/image/equipment/墨韵步履.webp', label: '墨韵步履' },
    { img: '/image/equipment/墨韵玉佩.webp', label: '墨韵玉佩' },
  ],
]

// 新手签到天数
const newbieDay = computed(() => playerStore.newbieCheckinDay)
const newbieClaimed = computed(() => {
  const last = playerStore.lastNewbieCheckinDate
  if (!last) return 0
  // 按UTC+8日期判断已签到天数
  return playerStore.newbieCheckinDay - 1 + (isTodayClaimedNewbie() ? 1 : 0)
})

function isTodayClaimedNewbie() {
  return playerStore.lastNewbieCheckinDate === getUTC8DateStr()
}

// 月签到奖励定义
const monthlyRewards = (() => {
  const arr = []
  for (let d = 1; d <= 28; d++) {
    if (d <= 6) {
      arr.push({ day: d, label: `${d * 1000}💰`, type: 'gold', amount: d * 1000 })
    } else if (d === 7) {
      arr.push({ day: 7, label: '100💎', type: 'diamond', amount: 100 })
    } else if (d <= 13) {
      arr.push({ day: d, label: `${d - 7}🪙`, type: 'evo', amount: d - 7 })
    } else if (d === 14) {
      arr.push({ day: 14, label: '300💎', type: 'diamond', amount: 300 })
    } else if (d <= 20) {
      arr.push({ day: d, label: `${(d - 14) * 20}💎`, type: 'diamond', amount: (d - 14) * 20 })
    } else if (d <= 27) {
      arr.push({ day: d, label: `${(d - 14) * 20}💎`, type: 'diamond', amount: (d - 14) * 20 })
    } else {
      arr.push({ day: 28, label: '500💎', type: 'diamond', amount: 500 })
    }
  }
  return arr
})()

const monthlyClaimed = computed(() => playerStore.monthlyCheckinDays)
const monthlyToday = computed(() => {
  const utc8Month = getUTC8Month()
  if (playerStore.monthlyCheckinMonth !== utc8Month) return null
  return getUTC8Day()
})

function getUTC8DateStr() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return utc8.toISOString().slice(0, 10)
}

function getUTC8Day() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return utc8.getDate()
}

function getUTC8Month() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return `${utc8.getFullYear()}-${String(utc8.getMonth() + 1).padStart(2, '0')}`
}

const currentTime = ref('')
let timeInterval = null

function updateCurrentTime() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  currentTime.value = utc8.toISOString().slice(11, 19)
}

const currentClaimed = computed(() => {
  if (checkinTab.value === 'newbie') {
    if (newbieDay.value > 7) return true
    return isTodayClaimedNewbie()
  } else {
    const utc8Month = getUTC8Month()
    if (playerStore.monthlyCheckinMonth !== utc8Month) return false
    const todayDay = getUTC8Day()
    if (todayDay > 28) return true
    return playerStore.monthlyCheckinDays.includes(todayDay)
  }
})

function doCheckin() {
  if (currentClaimed.value) return

  const now = Date.now()
  const todayStr = getUTC8DateStr()

  if (checkinTab.value === 'newbie') {
    const day = newbieDay.value
    if (day > 7) return

    // 给予奖励
    if (day === 1) {
      playerStore.addGold(66666)
      for (let i = 0; i < 3; i++) {
        inventoryStore.addItem({ ...ITEMS['高级血瓶'], id: now + i, quantity: 1 })
        inventoryStore.addItem({ ...ITEMS['高级魔瓶'], id: now + i + 10, quantity: 1 })
      }
      villageMessage.value = '新手第1天签到成功！获得66666金币+3高级血瓶+3高级魔瓶'
    } else if (day === 2) {
      playerStore.addDiamond(188)
      for (let i = 0; i < 10; i++) {
        inventoryStore.addItem({ ...ITEMS['通灵卷轴'], id: now + i, quantity: 1 })
      }
      villageMessage.value = '新手第2天签到成功！获得188钻石+10通灵卷轴'
    } else if (day === 3) {
      playerStore.addDiamond(288)
      for (let i = 0; i < 30; i++) {
        inventoryStore.addItem({ ...ITEMS['中经验瓶'], id: now + i, quantity: 1 })
      }
      villageMessage.value = '新手第3天签到成功！获得288钻石+30中经验瓶'
    } else if (day === 4) {
      playerStore.addDiamond(388)
      for (let i = 0; i < 20; i++) {
        inventoryStore.addItem({ ...ITEMS['大经验瓶'], id: now + i, quantity: 1 })
      }
      villageMessage.value = '新手第4天签到成功！获得388钻石+20大经验瓶'
    } else if (day === 5) {
      playerStore.addDiamond(588)
      for (let i = 0; i < 10; i++) {
        inventoryStore.addItem({ ...ITEMS['经验圣典'], id: now + i, quantity: 1 })
      }
      villageMessage.value = '新手第5天签到成功！获得588钻石+10经验圣典'
    } else if (day === 6) {
      playerStore.addDiamond(666)
      for (let i = 0; i < 5; i++) {
        inventoryStore.addItem({ ...ITEMS['生命之水'], id: now + i, quantity: 1 })
        inventoryStore.addItem({ ...ITEMS['附魔之水'], id: now + i + 10, quantity: 1 })
      }
      villageMessage.value = '新手第6天签到成功！获得666钻石+5生命之水+5附魔之水'
    } else if (day === 7) {
      playerStore.addDiamond(888)
      const moEquips = ['墨韵之剑', '墨韵发冠', '墨韵长衫', '墨韵下裳', '墨韵步履', '墨韵玉佩']
      moEquips.forEach((name, i) => {
        const eq = EQUIPMENT[name]
        if (eq) inventoryStore.addItem({ ...eq, id: now + i + 100, level: 1 })
      })
      villageMessage.value = '新手第7天签到成功！获得888钻石+墨韵六件套！'
    }

    playerStore.lastNewbieCheckinDate = todayStr
    if (day < 7) {
      playerStore.newbieCheckinDay = day + 1
    }
  } else {
    // 月签到
    const todayDay = getUTC8Day()
    if (todayDay > 28) {
      villageMessage.value = '本月签到天数已过（仅1-28日可签到）'
      return
    }

    const utc8Month = getUTC8Month()
    // 新月重置
    if (playerStore.monthlyCheckinMonth !== utc8Month) {
      playerStore.monthlyCheckinDays = []
      playerStore.monthlyCheckinMonth = utc8Month
    }

    // 防重复
    if (playerStore.monthlyCheckinDays.includes(todayDay)) return

    const reward = monthlyRewards.find(r => r.day === todayDay)
    if (!reward) return

    if (reward.type === 'gold') {
      playerStore.addGold(reward.amount)
    } else if (reward.type === 'diamond') {
      playerStore.addDiamond(reward.amount)
    } else if (reward.type === 'evo') {
      playerStore.addEvolutionCoin(reward.amount)
    }

    playerStore.monthlyCheckinDays = [...playerStore.monthlyCheckinDays, todayDay]
    playerStore.lastMonthlyCheckinDate = todayStr
    villageMessage.value = `月签到第${todayDay}天成功！获得${reward.label}`
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.replace('/')
    return
  }
  villageMessage.value = '欢迎来到霜落村！'
  
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.village-page {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Microsoft YaHei', sans-serif;
}

.village-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* ===== 顶部状态栏 ===== */
.top-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: linear-gradient(180deg, rgba(30, 30, 36, 0.92) 0%, rgba(18, 18, 24, 0.88) 100%);
  border-bottom: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.sb-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(200, 200, 210, 0.5);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.sb-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 0 14px rgba(200, 200, 210, 0.35);
}
.sb-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: rgba(0, 0, 0, 0.3);
}

.sb-player-info {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 60px;
  max-width: 80px;
  line-height: 1.15;
}
.sb-nickname {
  font-size: 12px;
  font-weight: 700;
  color: #f0f0f0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-class {
  font-size: 10px;
  font-weight: 500;
  color: #b0b0b8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sb-currency {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: center;
}
.sb-currency-icon {
  font-size: 13px;
  flex-shrink: 0;
}
.sb-currency-val {
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
.sb-currency.gold .sb-currency-val { color: #d4a840; }
.sb-currency.diamond .sb-currency-val { color: #70b8b0; }
.sb-currency.evo .sb-currency-val { color: #a080c8; }

.sb-power {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 4px;
}
.sb-power-icon {
  font-size: 13px;
}
.sb-power-val {
  font-size: 12px;
  font-weight: 700;
  color: #ff9f43;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6), 0 0 8px rgba(255, 160, 60, 0.3);
}

/* ===== 战力进度条 ===== */
.sb-power-bar {
  position: absolute;
  top: 48px;
  left: 8px;
  right: 8px;
  z-index: 10;
  height: 8px;
  background: rgba(20, 20, 25, 0.8);
  border-radius: 4px;
  border: 1px solid rgba(180, 180, 200, 0.2);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}
.sb-power-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6b7b8d, #8b9db0, #a0b4c8);
  border-radius: 3px;
  transition: width 0.5s ease;
  box-shadow: 0 0 6px rgba(160, 180, 200, 0.3);
}
.sb-power-bar-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: 600;
  color: rgba(220, 220, 230, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

/* ===== 快捷入口 ===== */
.quick-actions {
  position: absolute;
  top: 60px;
  left: 8px;
  right: 8px;
  z-index: 8;
  display: flex;
  gap: 6px;
  justify-content: center;
}
.qa-btn {
  flex: 1;
  max-width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: transform 0.15s;
}
.qa-btn:hover {
  transform: scale(1.05);
}
.qa-img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}
.qa-label {
  font-size: 0.7rem;
  color: #c0c0c8;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

/* ===== 右侧竖排按钮 ===== */
.right-vertical-bar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: max(8px, env(safe-area-inset-right, 8px));
}
.right-btn-img {
  width: 42px;
  height: 42px;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  border-radius: 12px;
}
.right-btn-img:hover {
  transform: scale(1.12);
  filter: drop-shadow(0 0 10px rgba(150, 200, 255, 0.6)) brightness(1.2);
}
.right-btn-img:active {
  transform: scale(0.95);
}

/* ===== 底部导航栏 ===== */
.bottom-nav-bar {
  position: absolute;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 4px;
  padding: 0 max(8px, env(safe-area-inset-right, 8px)) 0 max(8px, env(safe-area-inset-left, 8px));
  width: 100%;
  max-width: calc(100vw - 16px);
  box-sizing: border-box;
  justify-content: center;
}
.bottom-btn-img {
  width: 42px;
  height: 42px;
  flex-shrink: 1;
  min-width: 36px;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  border-radius: 12px;
}
.bottom-btn-img:hover {
  transform: translateY(-4px) scale(1.1);
  filter: drop-shadow(0 0 12px rgba(150, 200, 255, 0.6)) brightness(1.2);
}
.bottom-btn-img:active {
  transform: translateY(0) scale(0.95);
}

/* ===== 签到面板 ===== */
.checkin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkin-panel {
  width: 88%;
  max-width: 360px;
  height: 85vh;
  background: linear-gradient(180deg, #2c2c34, #1a1a20);
  border: 1px solid rgba(180, 180, 200, 0.25);
  border-radius: 16px;
  padding: 16px 18px 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.checkin-time {
  font-size: 0.75rem;
  color: #80c0e0;
  font-weight: 500;
  font-family: monospace;
}
.checkin-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(60, 60, 70, 0.8);
  border: 1px solid rgba(160, 160, 180, 0.3);
  color: #c0c0c8;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkin-close:hover {
  background: rgba(80, 80, 90, 0.9);
}

.checkin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.checkin-tab {
  flex: 1;
  padding: 10px 0;
  background: rgba(40, 40, 48, 0.7);
  border: 1px solid rgba(140, 140, 155, 0.2);
  border-radius: 10px;
  color: #a0a0a8;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.checkin-tab.active {
  background: rgba(60, 100, 80, 0.35);
  border-color: rgba(150, 200, 170, 0.4);
  color: #c8e0c8;
}
.checkin-grid {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 新手签到列表 */
.checkin-newbie-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 2px;
}

.checkin-newbie-list::-webkit-scrollbar {
  width: 5px;
}

.checkin-newbie-list::-webkit-scrollbar-track {
  background: rgba(30, 30, 40, 0.5);
  border-radius: 3px;
}

.checkin-newbie-list::-webkit-scrollbar-thumb {
  background: rgba(140, 180, 200, 0.4);
  border-radius: 3px;
}

.checkin-newbie-list::-webkit-scrollbar-thumb:hover {
  background: rgba(160, 200, 220, 0.6);
}

.newbie-day-card {
  background: rgba(40, 40, 48, 0.7);
  border: 1px solid rgba(120, 120, 140, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  transition: all 0.2s;
}

.newbie-day-card.today {
  border-color: rgba(150, 200, 170, 0.5);
  background: rgba(60, 100, 80, 0.25);
}

.newbie-day-card.active {
  background: rgba(60, 100, 80, 0.15);
  border-color: rgba(150, 200, 170, 0.25);
}

.newbie-day-card.claimed {
  background: rgba(50, 55, 50, 0.5);
  border-color: rgba(100, 140, 110, 0.3);
}

.newbie-day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.newbie-day-num {
  font-size: 0.85rem;
  font-weight: 700;
  color: #c0c0c8;
}

.newbie-day-card.today .newbie-day-num {
  color: #d8e8c8;
}

.newbie-check {
  font-size: 0.75rem;
  color: #7bed9f;
  font-weight: 700;
}

.newbie-missed {
  font-size: 0.7rem;
  color: #808088;
}

.newbie-day-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.newbie-reward-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(20, 50, 70, 0.4);
  border: 1px solid rgba(100, 160, 200, 0.2);
  border-radius: 6px;
  padding: 3px 8px;
}

.reward-img {
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 3px;
  image-rendering: crisp-edges;
}

.reward-icon {
  font-size: 0.9rem;
}

.reward-label {
  font-size: 0.72rem;
  color: #d0e0f0;
  font-weight: 500;
}

.reward-qty {
  font-size: 0.68rem;
  color: #ffd76e;
  font-weight: 700;
}

/* 月签到网格 */
.checkin-monthly-grid {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  padding: 0 2px;
  margin-bottom: 8px;
}

.checkin-monthly-grid::-webkit-scrollbar {
  width: 5px;
}

.checkin-monthly-grid::-webkit-scrollbar-track {
  background: rgba(30, 30, 40, 0.5);
  border-radius: 3px;
}

.checkin-monthly-grid::-webkit-scrollbar-thumb {
  background: rgba(140, 180, 200, 0.4);
  border-radius: 3px;
}

.checkin-monthly-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(160, 200, 220, 0.6);
}

.monthly-day-cell {
  text-align: center;
  padding: 8px 2px;
  background: rgba(40, 40, 48, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(120, 120, 140, 0.15);
  transition: all 0.2s;
}

.monthly-day-cell.claimed {
  background: rgba(50, 55, 50, 0.5);
  border-color: rgba(100, 140, 110, 0.3);
}

.monthly-day-cell.today {
  border-color: rgba(150, 200, 170, 0.5);
  background: rgba(60, 100, 80, 0.25);
}

.monthly-day-num {
  display: block;
  font-size: 0.7rem;
  color: #a0a0a8;
  margin-bottom: 2px;
}

.monthly-day-cell.today .monthly-day-num {
  color: #c8e0c8;
  font-weight: 700;
}

.monthly-day-reward {
  display: block;
  font-size: 0.65rem;
  color: #c8a850;
  font-weight: 600;
  line-height: 1.3;
}

.checkin-progress {
  text-align: center;
  font-size: 0.75rem;
  color: #80c0e0;
  padding: 4px 0 8px;
  flex-shrink: 0;
  font-weight: 500;
}
.checkin-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(180deg, rgba(60, 100, 80, 0.6), rgba(40, 70, 50, 0.6));
  border: 1px solid rgba(150, 200, 170, 0.3);
  border-radius: 10px;
  color: #d8e8d8;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.checkin-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(70, 120, 90, 0.7), rgba(50, 85, 60, 0.7));
}
.checkin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast 提示 */
.village-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 28px;
  background: rgba(20, 20, 28, 0.92);
  border: 1px solid rgba(180, 160, 120, 0.4);
  border-radius: 16px;
  color: #d8c8a8;
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

/* ===== 设置弹窗 ===== */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-panel {
  width: 85%;
  max-width: 340px;
  background: linear-gradient(180deg, #2c2c34, #1a1a20);
  border: 1px solid rgba(180, 180, 200, 0.25);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(180, 180, 200, 0.15);
  background: rgba(20, 20, 28, 0.4);
}

.settings-title {
  font-size: 1rem;
  font-weight: 600;
  color: #d8d8e0;
  letter-spacing: 1px;
}

.settings-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(60, 60, 70, 0.8);
  border: 1px solid rgba(160, 160, 180, 0.3);
  color: #c0c0c8;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-close:hover {
  background: rgba(80, 80, 90, 0.9);
}

.settings-body {
  padding: 16px 18px 20px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(40, 40, 48, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(140, 140, 155, 0.15);
}

.setting-label {
  font-size: 0.95rem;
  color: #d0d0d8;
  font-weight: 500;
}

/* Toggle 开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(80, 80, 90, 0.6);
  border-radius: 26px;
  border: 1px solid rgba(140, 140, 155, 0.3);
  transition: all 0.25s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  top: 2px;
  background: #d0d0d8;
  border-radius: 50%;
  transition: transform 0.25s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(60, 140, 100, 0.5);
  border-color: rgba(100, 200, 140, 0.4);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}
</style>
