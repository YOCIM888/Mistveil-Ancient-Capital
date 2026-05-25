import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_ACCOUNTS = 'frozen_kingdom_accounts'
const STORAGE_CURRENT_USER = 'frozen_current_user'

function createDefaultAccount(password) {
  return {
    password,
    firstLogin: true,
    createdAt: Date.now(),
    characterClass: '',
    classStats: { 力量: 5, 体质: 5, 敏捷: 5, 感知: 5, 智力: 5, 幸运: 5 },
    level: 1,
    exp: 0,
    gold: 0,
    diamond: 0,
    items: { evolutionCoin: 0 },
    backpackItems: [],
    equippedItems: { weapon: null, head: null, chest: null, legs: null, boots: null, accessory: null },
    pets: [],
    activePets: [null, null, null],
    runes: [],
    activeRunes: [null, null, null, null, null, null],
    clearedFloors: [],
    talents: {},
    talentPoints: 0,
    skills: {},
    defeatedMonsters: { normals: [], elites: [], bosses: [] },
    collectedEquipment: [],
    collectedItems: [],
    battleWins: 0,
    totalCrits: 0,
    totalGoldEarned: 0,
    totalDiamondEarned: 0,
    hasTamed: false,
    endlessWave: 0,
    bossEvolutionCounts: {},
    nickname: '',
    gender: '',
    signature: '',
    customAvatar: '',
    profileCompleted: false,
    registrationTime: Date.now(),
    redeemedCodes: [],
    giftPurchases: {},
    homeLevel: 1,
    homeCoins: 0,
    fishCooldown: 0,
    plantCooldown: 0,
    workEndTime: 0,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accounts = ref({})
  const currentUser = ref(null)

  function loadAccounts() {
    try {
      const raw = localStorage.getItem(STORAGE_ACCOUNTS)
      accounts.value = raw ? JSON.parse(raw) : {}
    } catch {
      accounts.value = {}
    }
    try {
      const user = localStorage.getItem(STORAGE_CURRENT_USER)
      if (user && accounts.value[user]) {
        currentUser.value = user
      } else {
        currentUser.value = null
        localStorage.removeItem(STORAGE_CURRENT_USER)
      }
    } catch {
      currentUser.value = null
      localStorage.removeItem(STORAGE_CURRENT_USER)
    }
  }

  function saveAccounts() {
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts.value))
    if (currentUser.value) {
      localStorage.setItem(STORAGE_CURRENT_USER, currentUser.value)
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER)
    }
  }

  function login(username, password) {
    const key = username.trim()
    if (!key) {
      return { success: false, isNew: false, message: '用户名不能为空' }
    }

    if (accounts.value[key]) {
      if (accounts.value[key].password !== password) {
        return { success: false, isNew: false, message: '密码错误' }
      }
      currentUser.value = key
      saveAccounts()
      return { success: true, isNew: false }
    }

    accounts.value[key] = createDefaultAccount(password)
    currentUser.value = key
    saveAccounts()
    return { success: true, isNew: true }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(STORAGE_CURRENT_USER)
  }

  function switchAccount(username) {
    const key = username.trim()
    if (accounts.value[key]) {
      currentUser.value = key
      saveAccounts()
      return true
    }
    return false
  }

  function deleteAccount(username) {
    const key = username.trim()
    if (accounts.value[key]) {
      delete accounts.value[key]
      if (currentUser.value === key) {
        currentUser.value = null
        localStorage.removeItem(STORAGE_CURRENT_USER)
      }
      saveAccounts()
      return true
    }
    return false
  }

  const isLoggedIn = computed(() => currentUser.value !== null)

  const currentUserData = computed(() => {
    if (!currentUser.value) return null
    return accounts.value[currentUser.value] || null
  })

  loadAccounts()

  return {
    accounts,
    currentUser,
    loadAccounts,
    saveAccounts,
    login,
    logout,
    switchAccount,
    deleteAccount,
    isLoggedIn,
    currentUserData,
  }
})
