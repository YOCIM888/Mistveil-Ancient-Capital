import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'

export const useDungeonStore = defineStore('dungeon', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const clearedFloors = computed({
    get: () => {
      const u = _user()
      if (!u) return []
      return u.clearedFloors || []
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.clearedFloors = val
      auth.saveAccounts()
    },
  })

  const defeatedMonsters = computed(() => {
    const u = _user()
    if (!u) return { normals: [], elites: [], bosses: [] }
    return {
      normals: [...(u.defeatedMonsters?.normals || [])],
      elites: [...(u.defeatedMonsters?.elites || [])],
      bosses: [...(u.defeatedMonsters?.bosses || [])],
    }
  })

  function clearFloor(floorNum) {
    const u = _user()
    if (!u) return false
    if (!u.clearedFloors) u.clearedFloors = []

    if (u.clearedFloors.includes(floorNum)) return false

    u.clearedFloors = [...u.clearedFloors, floorNum].sort((a, b) => a - b)
    auth.saveAccounts()
    return true
  }

  function recordDefeated(floorNum, monsterType) {
    const u = _user()
    if (!u) return false
    if (!u.defeatedMonsters) {
      u.defeatedMonsters = { normals: [], elites: [], bosses: [] }
    }

    const validTypes = ['normals', 'elites', 'bosses']
    if (!validTypes.includes(monsterType)) return false

    if (!u.defeatedMonsters[monsterType]) {
      u.defeatedMonsters[monsterType] = []
    }

    if (u.defeatedMonsters[monsterType].includes(floorNum)) return false

    u.defeatedMonsters[monsterType].push(floorNum)
    u.defeatedMonsters[monsterType].sort((a, b) => a - b)
    auth.saveAccounts()
    return true
  }

  function getHighestClearedFloor() {
    const u = _user()
    if (!u) return 0
    if (!u.clearedFloors || u.clearedFloors.length === 0) return 0
    return Math.max(...u.clearedFloors)
  }

  function getFloorCount() {
    const u = _user()
    if (!u) return 0
    if (!u.clearedFloors) return 0
    return u.clearedFloors.length
  }

  function getDefeatedCount(monsterType) {
    const u = _user()
    if (!u) return 0
    if (!u.defeatedMonsters || !u.defeatedMonsters[monsterType]) return 0
    return u.defeatedMonsters[monsterType].length
  }

  function isFloorCleared(floorNum) {
    const u = _user()
    if (!u) return false
    if (!u.clearedFloors) return false
    return u.clearedFloors.includes(floorNum)
  }

  return {
    clearedFloors,
    defeatedMonsters,
    clearFloor,
    recordDefeated,
    getHighestClearedFloor,
    getFloorCount,
    getDefeatedCount,
    isFloorCleared,
  }
})
