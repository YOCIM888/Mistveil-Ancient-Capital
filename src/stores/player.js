import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'
import { CLASS_BASE_STATS } from '../data/classes.js'

function generateExpTable() {
  const table = []
  for (let level = 0; level <= 1000; level++) {
    if (level === 0) {
      table.push(0)
    } else {
      const base = 100 * Math.pow(level, 1.5) + 100 * level
      if (level <= 100) {
        table.push(Math.floor(base * 0.7))
      } else {
        table.push(Math.floor(base))
      }
    }
  }
  return table
}

const EXP_PER_LEVEL = generateExpTable()

export const usePlayerStore = defineStore('player', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const characterClass = computed({
    get: () => _user()?.characterClass || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.characterClass = val
      auth.saveAccounts()
    },
  })

  const level = computed({
    get: () => _user()?.level || 1,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.level = val
      auth.saveAccounts()
    },
  })

  const exp = computed({
    get: () => _user()?.exp || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.exp = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const gold = computed({
    get: () => _user()?.gold || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.gold = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const diamond = computed({
    get: () => _user()?.diamond || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.diamond = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const evolutionCoin = computed({
    get: () => _user()?.items?.evolutionCoin || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      if (!u.items) u.items = { evolutionCoin: 0 }
      u.items.evolutionCoin = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const classStats = computed(() => {
    const u = _user()
    if (!u) return { 力量: 0, 体质: 0, 敏捷: 0, 感知: 0, 智力: 0, 幸运: 0 }
    return { ...u.classStats }
  })

  const strength = computed({
    get: () => _user()?.classStats?.力量 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.力量 = val
      auth.saveAccounts()
    },
  })

  const constitution = computed({
    get: () => _user()?.classStats?.体质 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.体质 = val
      auth.saveAccounts()
    },
  })

  const agility = computed({
    get: () => _user()?.classStats?.敏捷 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.敏捷 = val
      auth.saveAccounts()
    },
  })

  const perception = computed({
    get: () => _user()?.classStats?.感知 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.感知 = val
      auth.saveAccounts()
    },
  })

  const intelligence = computed({
    get: () => _user()?.classStats?.智力 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.智力 = val
      auth.saveAccounts()
    },
  })

  const luck = computed({
    get: () => _user()?.classStats?.幸运 || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.classStats.幸运 = val
      auth.saveAccounts()
    },
  })

  const nickname = computed({
    get: () => _user()?.nickname || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.nickname = val
      auth.saveAccounts()
    },
  })

  const gender = computed({
    get: () => _user()?.gender || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.gender = val
      auth.saveAccounts()
    },
  })

  const signature = computed({
    get: () => _user()?.signature || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.signature = val
      auth.saveAccounts()
    },
  })

  const customAvatar = computed({
    get: () => _user()?.customAvatar || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.customAvatar = val
      auth.saveAccounts()
    },
  })

  const registrationTime = computed(() => _user()?.registrationTime || Date.now())

  const clearedFloors = computed({
    get: () => _user()?.clearedFloors || [],
    set: (val) => {
      const u = _user()
      if (!u) return
      u.clearedFloors = val
      auth.saveAccounts()
    },
  })

  const battleWins = computed({
    get: () => _user()?.battleWins || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.battleWins = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const totalCrits = computed({
    get: () => _user()?.totalCrits || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.totalCrits = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const totalGoldEarned = computed({
    get: () => _user()?.totalGoldEarned || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.totalGoldEarned = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const totalDiamondEarned = computed({
    get: () => _user()?.totalDiamondEarned || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.totalDiamondEarned = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const hasTamed = computed({
    get: () => _user()?.hasTamed || false,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.hasTamed = val
      auth.saveAccounts()
    },
  })

  const endlessWave = computed({
    get: () => _user()?.endlessWave || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.endlessWave = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const bossEvolutionCounts = computed(() => {
    const u = _user()
    if (!u) return {}
    return { ...u.bossEvolutionCounts }
  })

  const talents = computed(() => {
    const u = _user()
    if (!u) return {}
    return { ...u.talents }
  })

  const talentPoints = computed({
    get: () => _user()?.talentPoints || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.talentPoints = Math.max(0, val)
      auth.saveAccounts()
    },
  })

  const skills = computed(() => {
    const u = _user()
    if (!u) return {}
    return { ...u.skills }
  })

  const profileCompleted = computed({
    get: () => _user()?.profileCompleted || false,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.profileCompleted = val
      auth.saveAccounts()
    },
  })

  const redeemedCodes = computed(() => {
    const u = _user()
    if (!u) return []
    return [...(u.redeemedCodes || [])]
  })

  const giftPurchases = computed(() => {
    const u = _user()
    if (!u) return {}
    return { ...(u.giftPurchases || {}) }
  })

  const mistIslandClears = computed({
    get: () => _user()?.mistIslandClears || 0,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.mistIslandClears = val
      auth.saveAccounts()
    },
  })

  const achievements = computed({
    get: () => _user()?.achievements || [],
    set: (val) => {
      const u = _user()
      if (!u) return
      u.achievements = [...val]
      auth.saveAccounts()
    },
  })

  const lastNewbieCheckin = computed({
    get: () => _user()?.lastNewbieCheckin || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.lastNewbieCheckin = val
      auth.saveAccounts()
    },
  })

  const lastNewbieCheckinDate = computed({
    get: () => _user()?.lastNewbieCheckinDate || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.lastNewbieCheckinDate = val
      auth.saveAccounts()
    },
  })

  const newbieCheckinDay = computed({
    get: () => _user()?.newbieCheckinDay || 1,
    set: (val) => {
      const u = _user()
      if (!u) return
      u.newbieCheckinDay = val
      auth.saveAccounts()
    },
  })

  const lastMonthlyCheckin = computed({
    get: () => _user()?.lastMonthlyCheckin || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.lastMonthlyCheckin = val
      auth.saveAccounts()
    },
  })

  const lastMonthlyCheckinDate = computed({
    get: () => _user()?.lastMonthlyCheckinDate || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.lastMonthlyCheckinDate = val
      auth.saveAccounts()
    },
  })

  const monthlyCheckinDays = computed({
    get: () => _user()?.monthlyCheckinDays || [],
    set: (val) => {
      const u = _user()
      if (!u) return
      u.monthlyCheckinDays = val
      auth.saveAccounts()
    },
  })

  const monthlyCheckinMonth = computed({
    get: () => _user()?.monthlyCheckinMonth || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.monthlyCheckinMonth = val
      auth.saveAccounts()
    },
  })

  const lastWeeklyCheckin = computed({
    get: () => _user()?.lastWeeklyCheckin || '',
    set: (val) => {
      const u = _user()
      if (!u) return
      u.lastWeeklyCheckin = val
      auth.saveAccounts()
    },
  })

  const weeklyCheckinDays = computed({
    get: () => _user()?.weeklyCheckinDays || [],
    set: (val) => {
      const u = _user()
      if (!u) return
      u.weeklyCheckinDays = val
      auth.saveAccounts()
    },
  })

  const expToNextLevel = computed(() => {
    const lvl = level.value
    if (lvl >= maxLevel.value) return 0
    return EXP_PER_LEVEL[lvl]
  })

  const maxLevel = computed(() => EXP_PER_LEVEL.length - 1)

  function addExp(amount) {
    const u = _user()
    if (!u) return
    u.exp = Math.max(0, u.exp + amount)
    while (u.level < 1000 && u.exp >= EXP_PER_LEVEL[u.level]) {
      u.exp -= EXP_PER_LEVEL[u.level]
      u.level += 1
      u.talentPoints = (u.talentPoints || 0) + 1
    }
    if (u.level >= 1000) {
      u.exp = 0
    }
    auth.saveAccounts()
  }

  function addGold(amount) {
    const u = _user()
    if (!u) return
    u.gold = Math.max(0, (u.gold || 0) + amount)
    u.totalGoldEarned = Math.max(0, (u.totalGoldEarned || 0) + Math.max(0, amount))
    auth.saveAccounts()
  }

  function addDiamond(amount) {
    const u = _user()
    if (!u) return
    u.diamond = Math.max(0, (u.diamond || 0) + amount)
    u.totalDiamondEarned = Math.max(0, (u.totalDiamondEarned || 0) + Math.max(0, amount))
    auth.saveAccounts()
  }

  function addEvolutionCoin(amount) {
    const u = _user()
    if (!u) return
    if (!u.items) u.items = { evolutionCoin: 0 }
    u.items.evolutionCoin = Math.max(0, (u.items.evolutionCoin || 0) + amount)
    auth.saveAccounts()
  }

  function levelUp() {
    const u = _user()
    if (!u) return false
    if (u.level >= 1000) return false
    u.level += 1
    u.talentPoints = (u.talentPoints || 0) + 1
    u.exp = 0
    auth.saveAccounts()
    return true
  }

  function setCharacterClass(className) {
    const u = _user()
    if (!u) return
    u.characterClass = className
    u.firstLogin = false
    const baseStats = CLASS_BASE_STATS[className]
    if (baseStats && u.classStats) {
      u.classStats.力量 = baseStats.strength || 5
      u.classStats.体质 = baseStats.constitution || 5
      u.classStats.敏捷 = baseStats.agility || 5
      u.classStats.感知 = baseStats.perception || 5
      u.classStats.智力 = baseStats.intelligence || 5
      u.classStats.幸运 = baseStats.luck || 5
    }
    auth.saveAccounts()
  }

  function setProfile(nick, gdr, sig, avatar) {
    const u = _user()
    if (!u) return
    u.nickname = nick || ''
    u.gender = gdr || ''
    u.signature = sig || ''
    u.customAvatar = avatar || ''
    u.profileCompleted = true
    auth.saveAccounts()
  }

  function addTalent(talentId) {
    const u = _user()
    if (!u) return false
    if ((u.talentPoints || 0) <= 0) return false
    u.talents[talentId] = (u.talents[talentId] || 0) + 1
    u.talentPoints -= 1
    auth.saveAccounts()
    return true
  }

  function learnSkill(skillId) {
    const u = _user()
    if (!u) return
    u.skills[skillId] = (u.skills[skillId] || 0) + 1
    auth.saveAccounts()
  }

  function recordCrit() {
    const u = _user()
    if (!u) return
    u.totalCrits = (u.totalCrits || 0) + 1
    auth.saveAccounts()
  }

  function recordBattleWin() {
    const u = _user()
    if (!u) return
    u.battleWins = (u.battleWins || 0) + 1
    auth.saveAccounts()
  }

  function addBossEvolution(bossName) {
    const u = _user()
    if (!u) return
    if (!u.bossEvolutionCounts) u.bossEvolutionCounts = {}
    u.bossEvolutionCounts[bossName] = (u.bossEvolutionCounts[bossName] || 0) + 1
    auth.saveAccounts()
  }

  function setEndlessWave(wave) {
    const u = _user()
    if (!u) return
    u.endlessWave = Math.max(u.endlessWave || 0, wave)
    auth.saveAccounts()
  }

  function setRedeemedCode(code) {
    const u = _user()
    if (!u) return false
    if (!u.redeemedCodes) u.redeemedCodes = []
    if (u.redeemedCodes.includes(code)) return false
    u.redeemedCodes.push(code)
    auth.saveAccounts()
    return true
  }

  function recordGiftPurchase(giftId) {
    const u = _user()
    if (!u) return
    if (!u.giftPurchases) u.giftPurchases = {}
    u.giftPurchases[giftId] = (u.giftPurchases[giftId] || 0) + 1
    auth.saveAccounts()
  }

  function setHasTamed(val) {
    const u = _user()
    if (!u) return
    u.hasTamed = val
    auth.saveAccounts()
  }

  function resetTalents() {
    const u = _user()
    if (!u) return
    const spent = Object.values(u.talents || {}).reduce((sum, lvl) => sum + lvl, 0)
    u.talents = {}
    u.talentPoints = (u.talentPoints || 0) + spent
    auth.saveAccounts()
  }

  function unlockAchievement(achievementId) {
    const u = _user()
    if (!u) return false
    if (!u.achievements) u.achievements = []
    if (u.achievements.includes(achievementId)) return false
    u.achievements = [...u.achievements, achievementId]
    auth.saveAccounts()
    return true
  }

  function addMistIslandClear() {
    const u = _user()
    if (!u) return
    u.mistIslandClears = (u.mistIslandClears || 0) + 1
    auth.saveAccounts()
    if (u.mistIslandClears === 1) unlockAchievement('mist_1')
    if (u.mistIslandClears === 10) unlockAchievement('mist_10')
    if (u.mistIslandClears === 30) unlockAchievement('mist_30')
  }

  return {
    characterClass,
    level,
    exp,
    gold,
    diamond,
    evolutionCoin,
    classStats,
    strength,
    constitution,
    agility,
    perception,
    intelligence,
    luck,
    nickname,
    gender,
    signature,
    customAvatar,
    registrationTime,
    clearedFloors,
    battleWins,
    totalCrits,
    totalGoldEarned,
    totalDiamondEarned,
    hasTamed,
    endlessWave,
    bossEvolutionCounts,
    talents,
    talentPoints,
    skills,
    profileCompleted,
    redeemedCodes,
    giftPurchases,
    mistIslandClears,
    achievements,
    lastNewbieCheckin,
    lastNewbieCheckinDate,
    newbieCheckinDay,
    lastMonthlyCheckin,
    lastMonthlyCheckinDate,
    monthlyCheckinDays,
    monthlyCheckinMonth,
    lastWeeklyCheckin,
    weeklyCheckinDays,
    expToNextLevel,
    maxLevel,
    addExp,
    addGold,
    addDiamond,
    addEvolutionCoin,
    levelUp,
    setCharacterClass,
    setProfile,
    addTalent,
    learnSkill,
    recordCrit,
    recordBattleWin,
    addBossEvolution,
    setEndlessWave,
    setRedeemedCode,
    recordGiftPurchase,
    setHasTamed,
    resetTalents,
    unlockAchievement,
    addMistIslandClear,
  }
})
