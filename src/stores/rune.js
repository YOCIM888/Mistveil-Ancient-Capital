import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from './auth'
import { RUNE_TYPES, RUNE_LEVELS } from '@/data/runes'

export const useRuneStore = defineStore('rune', () => {
  const auth = useAuthStore()

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  const runes = computed({
    get: () => {
      const u = _user()
      if (!u) return []
      return u.runes || []
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.runes = val
      auth.saveAccounts()
    },
  })

  const activeRunes = computed({
    get: () => {
      const u = _user()
      if (!u) return Array(12).fill(null)
      const arr = u.activeRunes
      if (!arr || !Array.isArray(arr)) return Array(12).fill(null)
      if (arr.length >= 12) return arr
      const padded = [...arr]
      while (padded.length < 12) padded.push(null)
      return padded
    },
    set: (val) => {
      const u = _user()
      if (!u) return
      u.activeRunes = val
      auth.saveAccounts()
    },
  })

  function buyRune(type) {
    const u = _user()
    if (!u) return false
    if (!u.runes) u.runes = []
    if (u.runes.length >= 100) return false

    const runeTypes = {
      attack: { name: '攻击符文', color: '#ff6b6b' },
      defense: { name: '防御符文', color: '#70a1ff' },
      health: { name: '生命符文', color: '#ff7675' },
      speed: { name: '速度符文', color: '#7bed9f' },
      magic: { name: '魔力符文', color: '#a29bfe' },
      critical: { name: '暴击符文', color: '#fdcb6e' },
      dodge: { name: '闪避符文', color: '#eccc68' },
      regen: { name: '回复符文', color: '#81ecec' },
    }

    const typeInfo = runeTypes[type] || { name: '未知符文', color: '#888888' }

    const newRune = {
      id: `rune_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      level: 1,
      name: typeInfo.name,
      icon: '',
      color: typeInfo.color,
    }

    u.runes.push(newRune)
    auth.saveAccounts()
    return true
  }

  function equipRune(runeId, slot) {
    const u = _user()
    if (!u) return false
    if (slot < 0 || slot > 11) return false

    if (!u.activeRunes) u.activeRunes = Array(12).fill(null)
    if (!u.runes) u.runes = []

    if (runeId === null) {
      const newActive = [...(u.activeRunes || Array(12).fill(null))]
      newActive[slot] = null
      u.activeRunes = newActive
      auth.saveAccounts()
      return true
    }

    const rune = u.runes.find((r) => r.id === runeId)
    if (!rune) return false

    const existingSlot = u.activeRunes.findIndex((ar) => ar && ar.id === runeId)

    const newActive = [...(u.activeRunes || Array(12).fill(null))]
    if (existingSlot !== -1) {
      const temp = newActive[slot]
      newActive[slot] = newActive[existingSlot]
      newActive[existingSlot] = temp
    } else {
      newActive[slot] = rune
    }
    u.activeRunes = newActive
    auth.saveAccounts()
    return true
  }

  function unequipRune(slot) {
    const u = _user()
    if (!u) return false
    if (slot < 0 || slot > 11) return false

    if (!u.activeRunes) u.activeRunes = Array(12).fill(null)
    const newActive = [...u.activeRunes]
    newActive[slot] = null
    u.activeRunes = newActive
    auth.saveAccounts()
    return true
  }

  function composeRunes(selectedIds) {
    const u = _user()
    if (!u) return false
    if (!u.runes) return false

    if (!selectedIds || selectedIds.length < 2) return false

    const indices = selectedIds
      .map((id) => u.runes.findIndex((r) => r.id === id))
      .filter((i) => i !== -1)
      .sort((a, b) => b - a)

    if (indices.length < 2) return false

    const usedRunes = indices.map((i) => u.runes[i])
    const highestLevel = Math.max(...usedRunes.map((r) => r.level || 1))

    const composedRune = {
      id: `rune_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: usedRunes[0].type,
      level: Math.min(highestLevel + 1, 10),
      name: usedRunes[0].name,
      icon: usedRunes[0].icon || '',
      color: usedRunes[0].color || '#888888',
    }

    for (const idx of indices) {
      u.runes.splice(idx, 1)
    }
    u.runes.push(composedRune)

    if (!u.activeRunes) u.activeRunes = Array(12).fill(null)
    u.activeRunes = u.activeRunes.map((ar) => {
      if (ar && selectedIds.includes(ar.id)) return null
      return ar
    })

    auth.saveAccounts()
    return true
  }

  function disassembleRune(runeId) {
    const u = _user()
    if (!u) return false
    if (!u.runes) return false

    const idx = u.runes.findIndex((r) => r.id === runeId)
    if (idx === -1) return false

    const rune = u.runes[idx]
    const runeLevel = rune.level || 1
    const dustAmount = RUNE_LEVELS[runeLevel]?.disassembleReturn || (runeLevel * 10)
    u.diamond = (u.diamond || 0) + dustAmount

    u.runes.splice(idx, 1)

    if (!u.activeRunes) u.activeRunes = Array(12).fill(null)
    u.activeRunes = u.activeRunes.map((ar) => (ar && ar.id === runeId ? null : ar))

    auth.saveAccounts()
    return dustAmount
  }

  function getRuneById(id) {
    const u = _user()
    if (!u) return null
    if (!u.runes) return null
    return u.runes.find((r) => r.id === id) || null
  }

  function runeCount() {
    const u = _user()
    if (!u) return 0
    if (!u.runes) return 0
    return u.runes.length
  }

  function activeRuneCount() {
    const u = _user()
    if (!u) return 0
    if (!u.activeRunes) return 0
    return u.activeRunes.filter((ar) => ar !== null).length
  }

  function composeAll() {
    const u = _user()
    if (!u) return { composed: 0, message: '未登录' }
    if (!u.runes || u.runes.length < 2) return { composed: 0, message: '符文不足，无法合成' }

    const activeRuneIds = new Set((u.activeRunes || []).filter(Boolean).map(ar => ar.id))

    // 按 type_level 分组（排除已装备符文）
    const groups = new Map()
    for (const r of u.runes) {
      if (activeRuneIds.has(r.id)) continue
      const key = `${r.type}_${r.level || 1}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(r)
    }

    let composed = 0
    const removeIds = new Set()
    const newRunes = []

    for (const [key, group] of groups) {
      const pairs = Math.floor(group.length / 2)
      for (let i = 0; i < pairs; i++) {
        const r1 = group[i * 2]
        const r2 = group[i * 2 + 1]
        if (!r1 || !r2) continue
        removeIds.add(r1.id)
        removeIds.add(r2.id)
        const newLevel = Math.min((r1.level || 1) + 1, 10)
        const typeInfo = RUNE_TYPES[r1.type]
        newRunes.push({
          id: `rune_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_c${composed}`,
          type: r1.type,
          level: newLevel,
          name: typeInfo?.name || r1.name,
          icon: typeInfo?.icon || '',
          color: typeInfo?.color || '#888888',
        })
        composed++
      }
    }

    if (composed === 0) return { composed: 0, message: '没有可合成的符文' }

    // 原子替换：一次性过滤 + 追加
    u.runes = u.runes.filter(r => !removeIds.has(r.id))
    u.runes.push(...newRunes)

    // 清理已装备但被合成的符文
    if (u.activeRunes) {
      const currentIds = new Set(u.runes.map(r => r.id))
      u.activeRunes = u.activeRunes.map(ar => {
        if (ar && !currentIds.has(ar.id)) return null
        return ar
      })
    }

    auth.saveAccounts()
    return {
      composed,
      message: `一键合成完成，共合成 ${composed} 次`
    }
  }

  return {
    runes,
    activeRunes,
    buyRune,
    equipRune,
    unequipRune,
    composeRunes,
    composeAll,
    disassembleRune,
    getRuneById,
    runeCount,
    activeRuneCount,
  }
})
