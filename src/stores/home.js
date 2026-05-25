import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useHomeStore = defineStore('home', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const homeLevel = computed({
    get: () => {
      const u = _user()
      return u?.homeLevel || 1
    },
    set: (v) => {
      const u = _user()
      if (u) { u.homeLevel = v; auth.saveAccounts() }
    }
  })

  const homeCoins = computed({
    get: () => {
      const u = _user()
      return u?.homeCoins || 0
    },
    set: (v) => {
      const u = _user()
      if (u) { u.homeCoins = v; auth.saveAccounts() }
    }
  })

  const fishCooldown = computed({
    get: () => {
      const u = _user()
      return u?.fishCooldown || 0
    },
    set: (v) => {
      const u = _user()
      if (u) { u.fishCooldown = v; auth.saveAccounts() }
    }
  })

  const plantCooldown = computed({
    get: () => {
      const u = _user()
      return u?.plantCooldown || 0
    },
    set: (v) => {
      const u = _user()
      if (u) { u.plantCooldown = v; auth.saveAccounts() }
    }
  })

  const workEndTime = computed({
    get: () => {
      const u = _user()
      return u?.workEndTime || 0
    },
    set: (v) => {
      const u = _user()
      if (u) { u.workEndTime = v; auth.saveAccounts() }
    }
  })

  function getUpgradeCost() {
    const lv = homeLevel.value
    return 100 * Math.pow(2, lv - 1)
  }

  function upgradeHome() {
    const cost = getUpgradeCost()
    if (homeLevel.value >= 10) return { ok: false, msg: '家园已满级' }
    if (homeCoins.value < cost) return { ok: false, msg: `家园币不足，需要 ${cost}` }
    homeCoins.value -= cost
    homeLevel.value += 1
    return { ok: true, msg: `家园升级至 Lv.${homeLevel.value}！` }
  }

  function getFishingReward() {
    return homeLevel.value >= 10 ? 10 : 1 + Math.floor((homeLevel.value - 1) * 1)
  }

  function getPlantingReward() {
    return homeLevel.value >= 10 ? 1000 : 100 + (homeLevel.value - 1) * 100
  }

  return {
    homeLevel,
    homeCoins,
    fishCooldown,
    plantCooldown,
    workEndTime,
    getUpgradeCost,
    upgradeHome,
    getFishingReward,
    getPlantingReward,
  }
})
