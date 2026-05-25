<template>
  <div class="village-page">
    <div class="village-bg"></div>

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
          <button :class="['checkin-tab', { active: checkinTab === 'weekly' }]" @click="checkinTab = 'weekly'">周常签到</button>
        </div>

        <div v-if="checkinTab === 'newbie'" class="checkin-grid newbie-grid">
          <div class="checkin-day" :class="{ active: newbieDay > 1, claimed: newbieClaimed >= 1 }">
            <span class="day-num">第1天</span>
            <span class="day-reward">2000金币 + 30💎 + 3⭐</span>
          </div>
          <div class="checkin-day" :class="{ active: newbieDay > 2, claimed: newbieClaimed >= 2 }">
            <span class="day-num">第2天</span>
            <span class="day-reward">5进化币 + 1通灵卷轴</span>
          </div>
          <div class="checkin-day" :class="{ active: newbieDay > 3, claimed: newbieClaimed >= 3 }">
            <span class="day-num">第3天</span>
            <span class="day-reward">墨韵六件套</span>
          </div>
        </div>

        <div v-if="checkinTab === 'weekly'" class="checkin-grid weekly-grid">
          <div v-for="(r, i) in weeklyRewards" :key="i" class="checkin-day" :class="{ active: weeklyDay > i + 1, claimed: weeklyClaimed.includes(i + 1) }">
            <span class="day-num">{{ weekLabels[i] }}</span>
            <span class="day-reward">{{ r }}</span>
          </div>
        </div>

        <button class="checkin-btn" :disabled="currentClaimed" @click="doCheckin">
          {{ currentClaimed ? '今日已签到' : '签到领取' }}
        </button>
      </div>
    </div>
    <MistIslandModal v-model="showMistIsland" />
    
    <Transition name="toast">
      <div v-if="showToast" class="village-toast">
        {{ toastMessage }}
      </div>
    </Transition>
    
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
    const spd = stats.speed || 0
    const mag = stats.magic || 0
    const crit = (stats.criticalRate || 0) * 100
    const dodge = (stats.dodgeRate || 0) * 100
    const regen = (stats.magicRegen || 0) * 10
    return atk * 2 + def * 1.5 + hp * 0.5 + spd * 3 + mag * 2 + crit + dodge + regen
  } catch (e) {
    return 0
  }
})

const playerAvatar = computed(() => {
  const cls = playerStore.characterClass || '平民'
  return playerStore.customAvatar || '/image/role/' + cls + '.webp'
})

const checkinTab = ref('newbie')
const newbieDay = ref(1)
const newbieClaimed = ref(0)
const weeklyDay = ref(1)
const weeklyClaimed = ref([])

const weeklyRewards = ['1000金币', '2000金币', '3000金币', '20钻石', '30钻石', '5进化币', '已领完']

const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const currentTime = ref('')
let timeInterval = null

function updateCurrentTime() {
  const now = new Date()
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  currentTime.value = utc8.toISOString().slice(11, 19)
}

function isSameDay(timestamp1, timestamp2) {
  if (!timestamp1 || !timestamp2) return false
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)
  return date1.toDateString() === date2.toDateString()
}

function isSameWeek(timestamp1, timestamp2) {
  if (!timestamp1 || !timestamp2) return false
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)
  const startOfWeek = (d) => {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
  }
  return startOfWeek(date1).toDateString() === startOfWeek(date2).toDateString()
}

const lastNewbieCheckin = ref(playerStore.lastNewbieCheckin || 0)
const lastWeeklyCheckin = ref(playerStore.lastWeeklyCheckin || 0)

const currentClaimed = computed(() => {
  const now = Date.now()
  if (checkinTab.value === 'newbie') {
    if (newbieClaimed.value >= newbieDay.value) return true
    return isSameDay(lastNewbieCheckin.value, now)
  } else {
    const today = new Date()
    const todayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    if (playerStore.weeklyCheckinDays.includes(todayOfWeek)) return true
    return isSameWeek(lastWeeklyCheckin.value, now) && playerStore.weeklyCheckinDays.includes(todayOfWeek)
  }
})

function doCheckin() {
  if (currentClaimed.value) return

  const now = Date.now()

  if (checkinTab.value === 'newbie') {
    const d = newbieDay.value
    if (d === 1) {
      playerStore.addGold(2000)
      playerStore.addDiamond(30)
      for (let i = 0; i < 3; i++) {
        inventoryStore.addItem({ ...ITEMS['小经验瓶'], id: now + i })
      }
      villageMessage.value = '新手第1天签到成功！获得2000金币+30钻石+3小经验瓶'
    } else if (d === 2) {
      playerStore.evolutionCoin = (playerStore.evolutionCoin || 0) + 5
      inventoryStore.addItem({ ...ITEMS['通灵卷轴'], id: now })
      villageMessage.value = '新手第2天签到成功！获得5进化币+1通灵卷轴'
    } else if (d === 3) {
      const moEquips = ['墨韵之剑', '墨韵发冠', '墨韵长衫', '墨韵下裳', '墨韵步履', '墨韵玉佩']
      moEquips.forEach((name, i) => {
        const eq = EQUIPMENT[name]
        if (eq) inventoryStore.addItem({ ...eq, id: now + i + 100, level: 1 })
      })
      villageMessage.value = '新手第3天签到成功！获得墨韵六件套！'
    }
    newbieClaimed.value = d
    lastNewbieCheckin.value = now
    playerStore.lastNewbieCheckin = now
    if (d < 3) newbieDay.value = d + 1
  } else {
    const today = new Date()
    const todayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    
    if (!playerStore.weeklyCheckinDays.includes(todayOfWeek)) {
      playerStore.weeklyCheckinDays = [...playerStore.weeklyCheckinDays, todayOfWeek]
      weeklyClaimed.value = [...weeklyClaimed.value, todayOfWeek]
      
      if (todayOfWeek <= 3) {
        playerStore.addGold(todayOfWeek * 1000)
        villageMessage.value = `周常签到成功！获得${todayOfWeek * 1000}金币`
      } else if (todayOfWeek === 4) {
        playerStore.addDiamond(20)
        villageMessage.value = '周常签到成功！获得20钻石'
      } else if (todayOfWeek === 5) {
        playerStore.addDiamond(30)
        villageMessage.value = '周常签到成功！获得30钻石'
      } else if (todayOfWeek === 6) {
        playerStore.evolutionCoin = (playerStore.evolutionCoin || 0) + 5
        villageMessage.value = '周常签到成功！获得5进化币'
      } else if (todayOfWeek === 7) {
        playerStore.addGold(5000)
        playerStore.addDiamond(50)
        villageMessage.value = '周常签到完成！获得5000金币+50钻石'
      }
    }
    
    lastWeeklyCheckin.value = now
    playerStore.lastWeeklyCheckin = now
    
    weeklyDay.value = todayOfWeek
  }
  setTimeout(() => { showCheckin.value = false }, 1000)
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
  background: url('/image/main/村庄.webp') center/cover no-repeat;
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
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.right-btn-img {
  width: 46px;
  height: 46px;
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
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 4px;
  padding: 0 8px;
  max-width: calc(100vw - 16px);
  overflow-x: visible;
}
.bottom-btn-img {
  width: 46px;
  height: 46px;
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
  background: linear-gradient(180deg, #2c2c34, #1a1a20);
  border: 1px solid rgba(180, 180, 200, 0.25);
  border-radius: 16px;
  padding: 16px 18px 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}
.checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
}
.newbie-grid {
  grid-template-columns: repeat(3, 1fr);
}
.weekly-grid {
  grid-template-columns: repeat(4, 1fr);
}
.checkin-day {
  text-align: center;
  padding: 10px 4px;
  background: rgba(40, 40, 48, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(120, 120, 140, 0.15);
  transition: all 0.2s;
}
.checkin-day.active {
  background: rgba(60, 100, 80, 0.3);
  border-color: rgba(150, 200, 170, 0.3);
}
.checkin-day.claimed {
  background: rgba(50, 50, 55, 0.6);
}
.day-num {
  display: block;
  font-size: 10px;
  color: #a0a0a8;
  margin-bottom: 3px;
}
.day-reward {
  display: block;
  font-size: 8px;
  color: #c8a850;
  font-weight: 600;
  line-height: 1.3;
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
</style>
