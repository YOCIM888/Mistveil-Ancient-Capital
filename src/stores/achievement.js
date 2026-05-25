import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'
import { usePlayerStore } from './player'
import { useInventoryStore } from './inventory'
import { usePetStore } from './pet'
import { useRuneStore } from './rune'
import { useDungeonStore } from './dungeon'
import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS } from '@/data/monsters'
import { EQUIPMENT } from '@/data/equipment'
import { ITEMS } from '@/data/items'
import { TALENTS } from '@/data/talents'

const ACHIEVEMENT_DEFS = [
  {
    id: 'first_blood',
    name: '初战告捷',
    desc: '赢得第一场战斗',
    icon: '⚔️',
    check: (player) => player.battleWins >= 1,
  },
  {
    id: 'veteran',
    name: '身经百战',
    desc: '赢得100场战斗',
    icon: '🛡️',
    check: (player) => player.battleWins >= 100,
  },
  {
    id: 'war_hero',
    name: '战争英雄',
    desc: '赢得500场战斗',
    icon: '🏆',
    check: (player) => player.battleWins >= 500,
  },
  {
    id: 'first_floor',
    name: '初入地城',
    desc: '通关第1层',
    icon: '🚪',
    check: (player, dungeon) => dungeon.isFloorCleared(1),
  },
  {
    id: 'floor_10',
    name: '深入探索',
    desc: '通关第10层',
    icon: '⛏️',
    check: (player, dungeon) => dungeon.isFloorCleared(10),
  },
  {
    id: 'floor_50',
    name: '地城征服者',
    desc: '通关第50层',
    icon: '👑',
    check: (player, dungeon) => dungeon.isFloorCleared(50),
  },
  {
    id: 'level_10',
    name: '小有所成',
    desc: '达到10级',
    icon: '📈',
    check: (player) => player.level >= 10,
  },
  {
    id: 'level_30',
    name: '实力大增',
    desc: '达到30级',
    icon: '💪',
    check: (player) => player.level >= 30,
  },
  {
    id: 'level_50',
    name: '登峰造极',
    desc: '达到50级',
    icon: '🌟',
    check: (player) => player.level >= 50,
  },
  {
    id: 'rich_1000',
    name: '小有积蓄',
    desc: '累计获得1000金币',
    icon: '💰',
    check: (player) => player.totalGoldEarned >= 1000,
  },
  {
    id: 'rich_100k',
    name: '富甲一方',
    desc: '累计获得100000金币',
    icon: '💎',
    check: (player) => player.totalGoldEarned >= 100000,
  },
  {
    id: 'crit_master',
    name: '暴击大师',
    desc: '累计暴击100次',
    icon: '💥',
    check: (player) => player.totalCrits >= 100,
  },
  {
    id: 'crit_god',
    name: '暴击之神',
    desc: '累计暴击1000次',
    icon: '🔥',
    check: (player) => player.totalCrits >= 1000,
  },
  {
    id: 'first_tame',
    name: '初次驯服',
    desc: '驯服第一只宠物',
    icon: '🐾',
    check: (player) => player.hasTamed,
  },
  {
    id: 'pet_collector',
    name: '宠物收藏家',
    desc: '拥有10只宠物',
    icon: '🐕',
    check: (player, dungeon, inventory, pet) => pet.petCount() >= 10,
  },
  {
    id: 'equip_collector',
    name: '装备收藏家',
    desc: '收集20件不同装备',
    icon: '🗡️',
    check: (player, dungeon, inventory) => inventory.collectedEquipment.length >= 20,
  },
  {
    id: 'item_collector',
    name: '道具收藏家',
    desc: '收集30种不同道具',
    icon: '🎒',
    check: (player, dungeon, inventory) => inventory.collectedItems.length >= 30,
  },
  {
    id: 'endless_10',
    name: '无尽挑战者',
    desc: '无尽模式达到第10波',
    icon: '🌊',
    check: (player) => player.endlessWave >= 10,
  },
  {
    id: 'endless_30',
    name: '无尽勇士',
    desc: '无尽模式达到第30波',
    icon: '🌀',
    check: (player) => player.endlessWave >= 30,
  },
  {
    id: 'diamond_earner',
    name: '钻石猎人',
    desc: '累计获得100钻石',
    icon: '💠',
    check: (player) => player.totalDiamondEarned >= 100,
  },
  {
    id: 'rune_master',
    name: '符文大师',
    desc: '拥有20个符文',
    icon: '🔮',
    check: (player, dungeon, inventory, pet, rune) => rune.runeCount() >= 20,
  },
  {
    id: 'boss_slayer',
    name: 'boss猎手',
    desc: '击败10个boss',
    icon: '💀',
    check: (player, dungeon) => dungeon.getDefeatedCount('bosses') >= 10,
  },
  {
    id: 'elite_slayer',
    name: '精英猎手',
    desc: '击败50个精英怪物',
    icon: '👹',
    check: (player, dungeon) => dungeon.getDefeatedCount('elites') >= 50,
  },
  {
    id: 'normal_slayer',
    name: '清道夫',
    desc: '击败200个普通怪物',
    icon: '🧹',
    check: (player, dungeon) => dungeon.getDefeatedCount('normals') >= 200,
  },
  {
    id: 'profile_done',
    name: '完整档案',
    desc: '完成个人资料设置',
    icon: '📋',
    check: (player) => player.profileCompleted,
  },
  {
    id: 'all_floors_boss',
    name: 'boss征服者',
    desc: '击败所有楼层的boss',
    icon: '☠️',
    check: (player, dungeon) => {
      const cleared = player.clearedFloors || []
      const bosses = dungeon.defeatedMonsters.bosses || []
      return cleared.length > 0 && cleared.every((f) => bosses.includes(f))
    },
  },
  {
    id: 'first_enter',
    name: '初入王国',
    desc: '第一次进入游戏',
    icon: '🏰',
    check: () => true,
  },
  {
    id: 'level_80',
    name: '炉火纯青',
    desc: '达到80级',
    icon: '✨',
    check: (player) => player.level >= 80,
  },
  {
    id: 'level_100',
    name: '登峰造极',
    desc: '达到100级',
    icon: '👑',
    check: (player) => player.level >= 100,
  },
  {
    id: 'gold_10k',
    name: '富甲一方',
    desc: '累计获得10000金币',
    icon: '💰',
    check: (player) => player.totalGoldEarned >= 10000,
  },
  {
    id: 'boss_1',
    name: '屠龙勇士',
    desc: '击败第一个BOSS',
    icon: '🐉',
    check: (player, dungeon) => dungeon.getDefeatedCount('bosses') >= 1,
  },
  {
    id: 'boss_5',
    name: 'BOSS杀手',
    desc: '击败5个不同的BOSS',
    icon: '👹',
    check: (player, dungeon) => dungeon.getDefeatedCount('bosses') >= 5,
  },
  {
    id: 'boss_all',
    name: 'BOSS终结者',
    desc: '击败所有BOSS',
    icon: '👑',
    check: (player, dungeon) => {
      const allBossIds = Object.keys(BOSS_MONSTERS).map(Number)
      const defeated = dungeon.defeatedMonsters.bosses || []
      return allBossIds.every((id) => defeated.includes(id))
    },
  },
  {
    id: 'equip_1',
    name: '装备收藏家',
    desc: '收集第一件装备',
    icon: '🎒',
    check: (player, dungeon, inventory) => inventory.collectedEquipment.length >= 1,
  },
  {
    id: 'equip_10',
    name: '装备大师',
    desc: '收集10件不同的装备',
    icon: '⚔️',
    check: (player, dungeon, inventory) => inventory.collectedEquipment.length >= 10,
  },
  {
    id: 'equip_all',
    name: '装备之王',
    desc: '收集所有装备',
    icon: '👑',
    check: (player, dungeon, inventory) => {
      const allEquip = Object.keys(EQUIPMENT)
      return inventory.collectedEquipment.length >= allEquip.length
    },
  },
  {
    id: 'item_1',
    name: '道具收藏家',
    desc: '收集第一种道具',
    icon: '📦',
    check: (player, dungeon, inventory) => inventory.collectedItems.length >= 1,
  },
  {
    id: 'item_all',
    name: '道具大师',
    desc: '收集所有道具',
    icon: '🎁',
    check: (player, dungeon, inventory) => {
      const allItems = Object.keys(ITEMS)
      return inventory.collectedItems.length >= allItems.length
    },
  },
  {
    id: 'monster_10',
    name: '怪物猎人',
    desc: '击败10种不同的怪物',
    icon: '🐺',
    check: (player, dungeon) =>
      dungeon.getDefeatedCount('normals') + dungeon.getDefeatedCount('elites') >= 10,
  },
  {
    id: 'monster_all',
    name: '怪物图鉴全',
    desc: '击败所有怪物',
    icon: '📖',
    check: (player, dungeon) => {
      const normalCount = dungeon.getDefeatedCount('normals')
      const eliteCount = dungeon.getDefeatedCount('elites')
      const bossCount = dungeon.getDefeatedCount('bosses')
      const totalMonsterTypes =
        Object.keys(MONSTERS).length +
        Object.keys(ELITE_MONSTERS).length +
        Object.keys(BOSS_MONSTERS).length
      return normalCount + eliteCount + bossCount >= totalMonsterTypes
    },
  },
  {
    id: 'pet_1',
    name: '驯宠新手',
    desc: '获得第一只宠物',
    icon: '🐾',
    check: (player, dungeon, inventory, pet) => pet.petCount() >= 1,
  },
  {
    id: 'pet_5',
    name: '驯宠达人',
    desc: '获得5只宠物',
    icon: '🐕',
    check: (player, dungeon, inventory, pet) => pet.petCount() >= 5,
  },
  {
    id: 'pet_legend',
    name: '传说宠物',
    desc: '获得一只传说级宠物',
    icon: '⭐',
    check: (player, dungeon, inventory, pet) => pet.pets.some((p) => p.rarity === 'legendary'),
  },
  {
    id: 'talent_1',
    name: '天赋觉醒',
    desc: '激活第一个天赋',
    icon: '🌟',
    check: (player) => Object.values(player.talents).some((lv) => lv > 0),
  },
  {
    id: 'talent_all',
    name: '天赋大成',
    desc: '所有天赋达到满级',
    icon: '✨',
    check: (player) => {
      const className = player.characterClass
      const classTalents = TALENTS[className] || []
      const userTalents = player.talents || {}
      return classTalents.every((talent) => (userTalents[talent.id] || 0) >= talent.maxLevel)
    },
  },
  {
    id: 'rune_1',
    name: '符文入门',
    desc: '获得第一个符文',
    icon: '🔮',
    check: (player, dungeon, inventory, pet, rune) => rune.runeCount() >= 1,
  },
  {
    id: 'rune_6',
    name: '符文大师',
    desc: '装备满6个符文',
    icon: '✨',
    check: (player, dungeon, inventory, pet, rune) => rune.activeRuneCount() >= 6,
  },
  {
    id: 'rune_5',
    name: '5级符文',
    desc: '合成一个5级符文',
    icon: '💎',
    check: (player, dungeon, inventory, pet, rune) => rune.runes.some((r) => r.level >= 5),
  },
  {
    id: 'endless_50',
    name: '无尽王者',
    desc: '无尽模式达到50波',
    icon: '👑',
    check: (player) => player.endlessWave >= 50,
  },
  {
    id: 'evolution_1',
    name: '超进化',
    desc: '成功挑战一次进化BOSS',
    icon: '👑',
    check: (player) => Object.values(player.bossEvolutionCounts).some((count) => count > 0),
  },
]

export const useAchievementStore = defineStore('achievement', () => {
  const auth = useAuthStore()
  const unlockedAchievements = ref([])
  const lastChecked = ref(0)

  function _user() {
    if (!auth.currentUser) return null
    return auth.accounts[auth.currentUser]
  }

  function checkAchievements() {
    if (!auth.currentUser) return []

    const player = usePlayerStore()
    const dungeon = useDungeonStore()
    const inventory = useInventoryStore()
    const pet = usePetStore()
    const rune = useRuneStore()

    const newlyUnlocked = []

    for (const def of ACHIEVEMENT_DEFS) {
      if (unlockedAchievements.value.includes(def.id)) continue

      try {
        if (def.check(player, dungeon, inventory, pet, rune)) {
          unlockedAchievements.value.push(def.id)
          newlyUnlocked.push(def)
        }
      } catch {
        continue
      }
    }

    lastChecked.value = Date.now()

    if (newlyUnlocked.length > 0) {
      const u = _user()
      if (u) {
        if (!u.achievements) u.achievements = []
        for (const def of newlyUnlocked) {
          if (!u.achievements.includes(def.id)) {
            u.achievements.push(def.id)
          }
        }
        auth.saveAccounts()
      }
    }

    return newlyUnlocked
  }

  const achievements = computed(() => {
    return ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      unlocked: unlockedAchievements.value.includes(def.id),
    }))
  })

  const unlockedCount = computed(() => unlockedAchievements.value.length)

  const totalCount = computed(() => ACHIEVEMENT_DEFS.length)

  const completionRate = computed(() => {
    if (ACHIEVEMENT_DEFS.length === 0) return 0
    return Math.round((unlockedAchievements.value.length / ACHIEVEMENT_DEFS.length) * 100)
  })

  const isAchievementUnlocked = (id) => {
    return unlockedAchievements.value.includes(id)
  }

  function getAchievementById(id) {
    const def = ACHIEVEMENT_DEFS.find((d) => d.id === id)
    if (!def) return null
    return {
      ...def,
      unlocked: unlockedAchievements.value.includes(id),
    }
  }

  function loadAchievements() {
    let loaded = []
    const raw = localStorage.getItem('frozen_kingdom_achievements')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data[auth.currentUser]) {
          loaded = data[auth.currentUser] || []
        }
      } catch {
        loaded = []
      }
    }
    const player = usePlayerStore()
    const playerAchs = player.achievements || []
    const merged = new Set([...loaded, ...playerAchs])
    unlockedAchievements.value = [...merged]
  }

  function saveAchievements() {
    let allData = {}
    try {
      const raw = localStorage.getItem('frozen_kingdom_achievements')
      if (raw) allData = JSON.parse(raw)
    } catch {
      allData = {}
    }
    if (auth.currentUser) {
      allData[auth.currentUser] = unlockedAchievements.value
      localStorage.setItem('frozen_kingdom_achievements', JSON.stringify(allData))
    }
  }

  if (auth.currentUser) {
    loadAchievements()
  }

  function resetAchievements() {
    unlockedAchievements.value = []
    saveAchievements()
  }

  return {
    achievements,
    unlockedCount,
    totalCount,
    completionRate,
    checkAchievements,
    isAchievementUnlocked,
    getAchievementById,
    loadAchievements,
    saveAchievements,
    resetAchievements,
    lastChecked,
  }
})
