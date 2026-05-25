import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'
import { usePlayerStore } from './player'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'

export const useInventoryStore = defineStore('inventory', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const backpackItems = computed({
    get: () => {
      const u = _user()
      if (!u) return []
      return u.backpackItems || []
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.backpackItems = val
      auth.saveAccounts()
    },
  })

  const backpackCapacity = computed({
    get: () => {
      const u = _user()
      if (!u) return 60
      return u.backpackCapacity || 60
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.backpackCapacity = Math.min(val, 200)
      auth.saveAccounts()
    },
  })

  const equippedItems = computed({
    get: () => {
      const u = _user()
      if (!u) {
        return { weapon: null, head: null, chest: null, legs: null, boots: null, accessory: null }
      }
      return u.equippedItems || { weapon: null, head: null, chest: null, legs: null, boots: null, accessory: null }
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.equippedItems = val
      auth.saveAccounts()
    },
  })

  const collectedEquipment = computed(() => {
    const u = _user()
    if (!u) return []
    return [...(u.collectedEquipment || [])]
  })

  const collectedItems = computed(() => {
    const u = _user()
    if (!u) return []
    return [...(u.collectedItems || [])]
  })

  function findFreeSlot() {
    const occupied = new Set(backpackItems.value.map((item) => item.slot))
    const cap = backpackCapacity.value
    for (let i = 0; i < cap; i++) {
      if (!occupied.has(i)) return i
    }
    return -1
  }

  function addItem(item) {
    const u = _user()
    if (!u) return false
    if (!u.backpackItems) u.backpackItems = []

    const stackableTypes = ['consumable', 'material', 'heal', 'mana', 'exp', 'tame', 'buff']
    if (stackableTypes.includes(item.type)) {
      const maxStack = item.maxStack || ITEMS[item.name]?.maxStack || 999
      const existing = u.backpackItems.find(
        (i) => i.name === item.name && i.type === item.type && (i.quantity || 1) < maxStack
      )
      if (existing) {
        const currentQty = existing.quantity || 1
        const addQty = item.quantity || 1
        const canAdd = maxStack - currentQty
        if (canAdd >= addQty) {
          existing.quantity = currentQty + addQty
          auth.saveAccounts()
          return true
        } else {
          existing.quantity = maxStack
          const remaining = addQty - canAdd
          const slot = findFreeSlot()
          if (slot === -1) {
            auth.saveAccounts()
            return true
          }
          u.backpackItems.push({
            name: item.name,
            icon: item.icon || '',
            type: item.type,
            itemType: item.itemType || item.type || 'other',
            effect: item.effect || null,
            quantity: remaining,
            maxStack: maxStack,
          })
          auth.saveAccounts()
          return true
        }
      }
    }

    const slot = findFreeSlot()
    if (slot === -1) return false

    const equipData = EQUIPMENT[item.name] || {}

    const newItem = {
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: item.name || '未知物品',
      icon: item.icon || '',
      img: item.img || equipData.img || '',
      type: item.type || 'material',
      itemType: item.itemType || equipData.type || 'other',
      rarity: item.rarity || equipData.rarity || 'common',
      enhancedLevel: item.enhancedLevel || 0,
      equipmentLevel: item.equipmentLevel || 0,
      effect: item.effect || null,
      slot,
      quantity: item.quantity || 1,
    }

    if (item.name) {
      if (!u.collectedItems) u.collectedItems = []
      if (!u.collectedItems.includes(item.name)) {
        u.collectedItems.push(item.name)
      }
    }

    u.backpackItems.push(newItem)
    auth.saveAccounts()
    return true
  }

  function removeItem(slotIndex, quantity) {
    const u = _user()
    if (!u) return false
    if (!u.backpackItems) return false

    const idx = u.backpackItems.findIndex((i) => i.slot === slotIndex)
    if (idx === -1) return false

    const item = u.backpackItems[idx]
    const removeQty = quantity || item.quantity || 1

    if (item.quantity && item.quantity > removeQty) {
      item.quantity -= removeQty
    } else {
      u.backpackItems.splice(idx, 1)
    }
    auth.saveAccounts()
    return true
  }

  function equipItem(item, slot) {
    const u = _user()
    if (!u) return false

    const validSlots = ['weapon', 'head', 'chest', 'legs', 'boots', 'accessory']
    if (!validSlots.includes(slot)) return false

    if (!u.equippedItems) {
      u.equippedItems = { weapon: null, head: null, chest: null, legs: null, boots: null, accessory: null }
    }

    if (u.equippedItems[slot]) {
      const freeSlot = findFreeSlotForReturn()
      if (freeSlot === -1) return false
      const oldEquip = { ...u.equippedItems[slot], slot: freeSlot }
      if (!u.backpackItems) u.backpackItems = []
      u.backpackItems.push(oldEquip)
    }

    const itemIdx = u.backpackItems.findIndex((i) => i.slot === item.slot)
    if (itemIdx !== -1) {
      u.backpackItems.splice(itemIdx, 1)
    }

    u.equippedItems[slot] = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      img: item.img || '',
      type: item.type,
      rarity: item.rarity || 'common',
      enhancedLevel: item.enhancedLevel || 0,
      equipmentLevel: item.equipmentLevel || 0,
    }

    if (item.name) {
      if (!u.collectedEquipment) u.collectedEquipment = []
      if (!u.collectedEquipment.includes(item.name)) {
        u.collectedEquipment.push(item.name)
      }
    }

    auth.saveAccounts()
    return true
  }

  function findFreeSlotForReturn() {
    const u = _user()
    if (!u) return -1
    if (!u.backpackItems) u.backpackItems = []
    const occupied = new Set(u.backpackItems.map((i) => i.slot))
    const cap = backpackCapacity.value
    for (let i = 0; i < cap; i++) {
      if (!occupied.has(i)) return i
    }
    return -1
  }

  function unequipItem(slot) {
    const u = _user()
    if (!u) return false

    if (!u.equippedItems || !u.equippedItems[slot]) return false

    const freeSlot = findFreeSlot()
    if (freeSlot === -1) return false

    const equip = u.equippedItems[slot]
    if (!u.backpackItems) u.backpackItems = []
    u.backpackItems.push({
      id: equip.id,
      name: equip.name,
      icon: equip.icon || '',
      img: equip.img || '',
      type: equip.type || 'equipment',
      itemType: slot,
      rarity: equip.rarity || 'common',
      enhancedLevel: equip.enhancedLevel || 0,
      equipmentLevel: equip.equipmentLevel || 0,
      effect: null,
      slot: freeSlot,
      quantity: 1,
    })

    u.equippedItems[slot] = null
    auth.saveAccounts()
    return true
  }

  function enhanceEquipment(slot) {
    const u = _user()
    if (!u) return false

    if (!u.equippedItems || !u.equippedItems[slot]) return false

    const equip = u.equippedItems[slot]
    equip.enhancedLevel = (equip.enhancedLevel || 0) + 1
    auth.saveAccounts()
    return true
  }

  function dismantleEquipment(slotOrIndex) {
    const u = _user()
    if (!u) return false

    if (typeof slotOrIndex === 'number') {
      if (!u.backpackItems) return false
      const item = u.backpackItems.find((i) => i.slot === slotOrIndex)
      if (!item) return false
      if (item.type !== 'equipment' && item.itemType !== 'equipment') return false
      const dismantleGold = Math.floor(((item.equipmentLevel || 0) + 1) * 50)
      const playerStore = usePlayerStore()
      playerStore.addGold(dismantleGold)
      const idx = u.backpackItems.findIndex((i) => i.slot === slotOrIndex)
      if (idx !== -1) u.backpackItems.splice(idx, 1)
      auth.saveAccounts()
      return dismantleGold
    }

    if (!u.equippedItems || !u.equippedItems[slotOrIndex]) return false
    const dismantleGold = Math.floor(((u.equippedItems[slotOrIndex].enhancedLevel || 0) + 1) * 50)
    const playerStore = usePlayerStore()
    playerStore.addGold(dismantleGold)
    u.equippedItems[slotOrIndex] = null
    auth.saveAccounts()
    return dismantleGold
  }

  function sortBackpack(sortBy) {
    const u = _user()
    if (!u) return
    if (!u.backpackItems) return

    const items = [...u.backpackItems]

    switch (sortBy) {
      case 'quality': {
        const rarityOrder = { red: 0, legendary: 1, orange: 1, epic: 2, purple: 2, rare: 3, blue: 3, uncommon: 4, common: 5 }
        const isEquip = (item) => {
          if (!item) return false
          if (item.type === 'equipment') return true
          const equipTypes = ['weapon', 'head', 'chest', 'legs', 'boots', 'accessory']
          return equipTypes.includes(item.itemType)
        }
        items.sort((a, b) => {
          const aIsEquip = isEquip(a)
          const bIsEquip = isEquip(b)
          if (aIsEquip && !bIsEquip) return -1
          if (!aIsEquip && bIsEquip) return 1
          if (aIsEquip && bIsEquip) {
            return (rarityOrder[a.rarity] ?? 6) - (rarityOrder[b.rarity] ?? 6)
          }
          return (a.name || '').localeCompare(b.name || '')
        })
        break
      }
      case 'type':
        items.sort((a, b) => (a.type || '').localeCompare(b.type || ''))
        break
      case 'rarity': {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }
        items.sort((a, b) => (rarityOrder[a.rarity] || 5) - (rarityOrder[b.rarity] || 5))
        break
      }
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'quantity':
        items.sort((a, b) => (b.quantity || 1) - (a.quantity || 1))
        break
      default:
        items.sort((a, b) => a.slot - b.slot)
        break
    }

    items.forEach((item, idx) => {
      item.slot = idx
    })

    u.backpackItems = items
    auth.saveAccounts()
  }

  function getItemBySlot(slotIndex) {
    const u = _user()
    if (!u) return null
    if (!u.backpackItems) return null
    return u.backpackItems.find((i) => i.slot === slotIndex) || null
  }

  function hasItem(itemName) {
    const u = _user()
    if (!u) return false
    if (!u.backpackItems) return false
    return u.backpackItems.some((i) => i.name === itemName)
  }

  function getItemCount(itemName) {
    const u = _user()
    if (!u) return 0
    if (!u.backpackItems) return 0
    const item = u.backpackItems.find((i) => i.name === itemName)
    return item ? item.quantity || 1 : 0
  }

  function backpackItemCount() {
    const u = _user()
    if (!u) return 0
    if (!u.backpackItems) return 0
    return u.backpackItems.length
  }

  function upgradeEquipment(item) {
    const u = _user()
    if (!u) return false
    if (!u.backpackItems) return false
    const idx = u.backpackItems.findIndex(i => i.slot === item.slot || i.id === item.id)
    if (idx === -1) return false
    const equip = u.backpackItems[idx]
    equip.equipmentLevel = (equip.equipmentLevel || 0) + 1
    auth.saveAccounts()
    return true
  }

  return {
    backpackItems,
    backpackCapacity,
    equippedItems,
    collectedEquipment,
    collectedItems,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    enhanceEquipment,
    dismantleEquipment,
    sortBackpack,
    getItemBySlot,
    hasItem,
    getItemCount,
    backpackItemCount,
    upgradeEquipment,
  }
})
