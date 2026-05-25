import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'

export const usePetStore = defineStore('pet', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const pets = computed({
    get: () => {
      const u = _user()
      if (!u) return []
      return u.pets || []
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.pets = val
      auth.saveAccounts()
    },
  })

  const activePets = computed({
    get: () => {
      const u = _user()
      if (!u) return [null, null, null]
      return u.activePets || [null, null, null]
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.activePets = val
      auth.saveAccounts()
    },
  })

  function addPet(pet) {
    const u = _user()
    if (!u) return false
    if (!u.pets) u.pets = []

    const newPet = {
      id: pet.id || `pet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: pet.name || '未知宠物',
      rarity: pet.rarity || 'common',
      hp: pet.hp != null ? Math.floor(pet.hp * 0.5) : 100,
      atk: pet.atk != null ? Math.floor(pet.atk * 0.5) : 10,
      img: pet.img || '',
      level: pet.level || 1,
    }

    u.pets.push(newPet)
    u.hasTamed = true
    auth.saveAccounts()
    return true
  }

  function releasePet(id) {
    const u = _user()
    if (!u) return false
    if (!u.pets) return false

    const idx = u.pets.findIndex((p) => p.id === id)
    if (idx === -1) return false

    if (!u.activePets) u.activePets = [null, null, null]
    u.activePets = u.activePets.map((ap) => (ap && ap.id === id ? null : ap))

    u.pets.splice(idx, 1)
    auth.saveAccounts()
    return true
  }

  function setActivePet(petId, slot) {
    const u = _user()
    if (!u) return false
    if (slot < 0 || slot > 2) return false

    if (!u.activePets) u.activePets = [null, null, null]
    if (!u.pets) u.pets = []

    if (petId === null) {
      u.activePets[slot] = null
      auth.saveAccounts()
      return true
    }

    const pet = u.pets.find((p) => p.id === petId)
    if (!pet) return false

    const existingSlot = u.activePets.findIndex((ap) => ap && ap.id === petId)
    if (existingSlot !== -1) {
      u.activePets[existingSlot] = u.activePets[slot]
    }

    u.activePets[slot] = pet
    auth.saveAccounts()
    return true
  }

  function swapPet(fromSlot, toSlot) {
    const u = _user()
    if (!u) return false
    if (!u.activePets) u.activePets = [null, null, null]

    const temp = u.activePets[fromSlot]
    u.activePets[fromSlot] = u.activePets[toSlot]
    u.activePets[toSlot] = temp
    auth.saveAccounts()
    return true
  }

  function sortPets(sortBy) {
    const u = _user()
    if (!u) return
    if (!u.pets) return

    switch (sortBy) {
      case 'rarity': {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
        u.pets.sort((a, b) => (rarityOrder[a.rarity] || 5) - (rarityOrder[b.rarity] || 5))
        break
      }
      case 'level':
        u.pets.sort((a, b) => (b.level || 1) - (a.level || 1))
        break
      case 'name':
        u.pets.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'atk':
        u.pets.sort((a, b) => (b.atk || 0) - (a.atk || 0))
        break
      case 'hp':
        u.pets.sort((a, b) => (b.hp || 0) - (a.hp || 0))
        break
      default:
        break
    }
    auth.saveAccounts()
  }

  function getPetById(id) {
    const u = _user()
    if (!u) return null
    if (!u.pets) return null
    return u.pets.find((p) => p.id === id) || null
  }

  function petCount() {
    const u = _user()
    if (!u) return 0
    if (!u.pets) return 0
    return u.pets.length
  }

  function activePetCount() {
    const u = _user()
    if (!u) return 0
    if (!u.activePets) return 0
    return u.activePets.filter((ap) => ap !== null).length
  }

  return {
    pets,
    activePets,
    addPet,
    releasePet,
    setActivePet,
    swapPet,
    sortPets,
    getPetById,
    petCount,
    activePetCount,
  }
})
