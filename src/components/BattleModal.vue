<template>
  <div v-show="battleState.inBattle || battleResult" class="battle-overlay" @click.self="noop">
    <div class="battle-modal">
      <div class="battle-header">
        <span class="battle-floor-text">
          <template v-if="battleState.challengeMode === 'endless'">无尽模式 第{{ displayWave }}波</template>
          <template v-else-if="battleState.challengeMode === 'bossEvolution'">BOSS超进化 第{{ displayFloor }}层</template>
          <template v-else-if="battleState.challengeMode === 'pvp'">PVP对战</template>
          <template v-else-if="battleState.challengeMode === 'mist-island'">🌫️ 迷雾岛</template>
          <template v-else-if="battleState.challengeMode === 'dungeon'">地宫 第{{ displayFloor }}层</template>
          <template v-else>地宫 第{{ displayFloor }}层</template>
        </span>
        <span class="battle-monster-label">{{ battleState.monsterName }}</span>
        <span v-if="battleState.monsterIsBoss" class="boss-tag">BOSS</span>
        <span v-else-if="battleState.monsterIsElite" class="elite-tag">精英</span>
        <button class="battle-close-btn" @click="handleSurrender">✕</button>
      </div>

      <div class="battle-arena">
        <div class="player-panel">
          <div class="panel-avatar-wrap">
            <img
              class="panel-avatar"
              :src="playerAvatar"
              alt="玩家"
              @error="onPlayerAvatarError"
            />
          </div>
          <div class="panel-info">
            <div class="panel-name-row">
              <span class="panel-name">{{ playerStore.nickname || '冒险者' }}</span>
              <span class="panel-class">{{ playerStore.characterClass }}</span>
              <span class="panel-level">Lv.{{ playerStore.level }}</span>
            </div>
            <div class="hp-bar-wrap">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill" :style="{ width: hpPercent + '%' }"></div>
              </div>
              <span class="hp-text">{{ battleState.playerHp }} / {{ battleState.playerMaxHp }}</span>
            </div>
            <div class="mp-bar-wrap">
              <div class="mp-bar-bg">
                <div class="mp-bar-fill" :style="{ width: mpPercent + '%' }"></div>
              </div>
              <span class="mp-text">{{ battleState.playerMagic }} / {{ battleState.playerMaxMagic }}</span>
            </div>
          </div>
          <div v-if="activeBattlePets.length > 0" class="pet-mini-list">
            <div
              v-for="pet in activeBattlePets"
              :key="pet.id"
              class="pet-mini-item"
              :class="{ dead: pet.hp <= 0 }"
            >
              <img class="pet-mini-avatar" :src="pet.img" :alt="pet.name" />
              <div class="pet-mini-hp-bg">
                <div
                  class="pet-mini-hp-fill"
                  :class="{ low: pet.hp / pet.maxHp < 0.3 }"
                  :style="{ width: (pet.maxHp > 0 ? (pet.hp / pet.maxHp) * 100 : 0) + '%' }"
                ></div>
              </div>
              <span class="pet-mini-name">{{ pet.name }}</span>
            </div>
          </div>
        </div>

        <div class="vs-divider">VS</div>

        <div class="monster-panel">
          <div class="panel-avatar-wrap monster-avatar-wrap">
            <img
              class="panel-avatar"
              :src="monsterImgSrc"
              :alt="battleState.monsterName"
              @error="onMonsterAvatarError"
            />
          </div>
          <div class="panel-info">
            <div class="panel-name-row monster-name-row">
              <span class="panel-name monster-name">{{ battleState.monsterName }}</span>
            </div>
            <div class="hp-bar-wrap">
              <div class="hp-bar-bg monster-hp-bg">
                <div class="hp-bar-fill monster-hp-fill" :style="{ width: monsterHpPercent + '%' }"></div>
              </div>
              <span class="hp-text">{{ battleState.monsterHp }} / {{ battleState.monsterMaxHp }}</span>
            </div>
            <div class="monster-stats">
              <span class="monster-stat">攻击: {{ battleState.monsterAtk }}</span>
              <span class="monster-stat">防御: {{ battleState.monsterDef }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="battle-log" ref="battleLogRef">
        <div
          v-for="(log, idx) in battleState.battleLog"
          :key="idx + '_' + log.length"
          class="battle-log-line"
          :class="{ 'log-reward': log.startsWith('获得'), 'log-danger': log.includes('💀'), 'log-gold': log.includes('🎉') }"
        >{{ log }}</div>
      </div>

      <div class="battle-actions">
        <button
          class="action-btn attack-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle"
          @click="playerAttack"
        >⚔️ 攻击</button>
        <button
          class="action-btn defend-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle"
          @click="playerDefend"
        >🛡️ 防御</button>
        <button
          class="action-btn skill-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle"
          @click="showSkillSelect = true"
        >✨ 技能</button>
        <button
          class="action-btn item-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle"
          @click="showItemSelect = true"
        >🎒 物品</button>
        <button
          class="action-btn tame-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle || !battleState.canTame"
          @click="playerTame"
        >🦊 凌驾</button>
        <button
          class="action-btn surrender-btn"
          :disabled="!battleState.isPlayerTurn || !battleState.inBattle"
          @click="handleSurrender"
        >🏳️ 投降</button>
      </div>

      <div v-if="battleResult" class="battle-result-overlay">
        <div class="battle-result-modal">
          <div class="battle-result-header" :class="{ 'victory': battleResult.type === 'victory', 'defeat': battleResult.type === 'defeat' }">
            {{ battleResult.type === 'victory' ? '🎉 通关成功！' : '💀 战斗失败' }}
          </div>
          <div class="battle-result-body">
            <div class="battle-result-floor">{{ battleResult.monsterName }} - 第{{ battleResult.floor }}层</div>
            <div v-if="battleResult.type === 'victory' && battleResult.rewards" class="battle-result-rewards">
              <div v-if="battleResult.rewards.exp" class="reward-item">✨ 经验 +{{ battleResult.rewards.exp }}</div>
              <div v-if="battleResult.rewards.gold" class="reward-item">💰 金币 +{{ battleResult.rewards.gold }}</div>
              <div v-if="battleResult.rewards.diamond" class="reward-item">💎 钻石 +{{ battleResult.rewards.diamond }}</div>
              <div v-if="battleResult.rewards.evolutionCoin" class="reward-item">🪙 进化币 +{{ battleResult.rewards.evolutionCoin }}</div>
            </div>
            <div v-if="battleResult.type === 'defeat'" class="battle-result-defeat-msg">
              请提升实力后再来挑战！
            </div>
          </div>
          <button class="battle-result-btn" @click="closeBattleResult">
            {{ battleResult.type === 'victory' ? '🎉 返回' : '💪 返回' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSkillSelect" class="sub-modal-overlay" @click.self="showSkillSelect = false">
      <div class="sub-modal skill-select-modal">
        <div class="sub-modal-header">
          <span>选择技能</span>
          <button class="sub-modal-close" @click="showSkillSelect = false">✕</button>
        </div>
        <div class="sub-modal-body">
          <div v-if="battleSkills.length === 0" class="sub-empty">没有可用技能</div>
          <div
            v-for="skill in battleSkills"
            :key="skill.id"
            class="skill-select-item"
            :class="{ disabled: battleState.playerMagic < skill.magicCost }"
            @click="useSkill(skill)"
          >
            <div class="skill-select-header">
              <span class="skill-select-name">{{ skill.name }}</span>
              <span class="skill-select-cost">🔮 {{ skill.magicCost }}</span>
              <span class="skill-select-level">Lv.{{ getSkillLevel(skill.id) }}</span>
            </div>
            <div class="skill-select-desc">{{ skill.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showItemSelect" class="sub-modal-overlay" @click.self="showItemSelect = false">
      <div class="sub-modal item-select-modal">
        <div class="sub-modal-header">
          <span>选择物品</span>
          <button class="sub-modal-close" @click="showItemSelect = false">✕</button>
        </div>
        <div class="sub-modal-body">
          <div v-if="battleItems.length === 0" class="sub-empty">没有可用物品</div>
          <div
            v-for="item in battleItems"
            :key="item.id"
            class="item-select-card"
            @click="useItem(item)"
          >
            <img v-if="item.img" :src="item.img" :alt="item.name" class="item-select-img" />
            <span v-else class="item-select-icon">{{ item.icon }}</span>
            <div class="item-select-info">
              <span class="item-select-name">{{ item.name }}</span>
              <span class="item-select-desc">{{ getItemDesc(item.name) }}</span>
            </div>
            <span class="item-select-qty">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { usePetStore } from '@/stores/pet'
import { useInventoryStore } from '@/stores/inventory'
import { useDungeonStore } from '@/stores/dungeon'
import { useAchievementStore } from '@/stores/achievement'
import { useRuneStore } from '@/stores/rune'
import {
  getCharacterStats,
  getEquipmentBonus,
  getTalentBonus,
  getTotalRuneBonus,
  calculateDamage,
  getMonsterData,
  calculateDrops,
  getFrostSlowEffect,
  generateEndlessMonster,
  generateBossEvolution,
  generatePvPOpponent,
  createPetFromMonster
} from '@/utils/game'
import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS, PET_TEMPLATES } from '@/data/monsters'
import { SKILLS, SKILL_TYPE } from '@/data/skills'
import { ITEMS } from '@/data/items'
import { oneHitKill, hpLocked, mpLocked, forceTame } from '@/components/ConsoleModal.vue'

const props = defineProps({
  battleConfig: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'victory', 'defeat'])

const playerStore = usePlayerStore()
const petStore = usePetStore()
const inventoryStore = useInventoryStore()
const dungeonStore = useDungeonStore()
const achievementStore = useAchievementStore()
const runeStore = useRuneStore()

const battleLogRef = ref(null)
const showSkillSelect = ref(false)
const showItemSelect = ref(false)

const defaultAvatar = '/image/main/平民头像.webp'
const defaultMonsterImg = '/image/monster/雪绒兔.webp'

const battleState = reactive({
  inBattle: false,
  currentFloor: 1,
  challengeMode: null,
  bossId: null,
  evoCount: 0,
  wave: null,
  playerHp: 0,
  playerMaxHp: 0,
  playerAtk: 0,
  playerDef: 0,
  playerAtkSpeed: 1.0,
  playerCritRate: 0,
  playerMagic: 0,
  playerMaxMagic: 0,
  playerBuffs: [],
  monsterDebuffs: [],
  monsterHp: 0,
  monsterMaxHp: 0,
  monsterAtk: 0,
  monsterDef: 0,
  monsterAtkSpeed: 1.0,
  monsterName: '',
  monsterImg: '',
  monsterIsBoss: false,
  monsterIsElite: false,
  monsterMagic: 0,
  monsterMaxMagic: 0,
  monsterCharacterClass: '',
  monsterDefending: false,
  isDefending: false,
  isPlayerTurn: true,
  battleLog: [],
  canTame: true,
  activePets: [],
  buffCriticalRate: 0,
  buffDefense: 0,
  buffSpeed: 0,
  buffAttack: 0,
  buffDodgeRate: 0,
  magicRegen: 0,
})

const battleResult = ref(null)

const displayFloor = computed(() => battleState.currentFloor)
const displayWave = computed(() => battleState.wave || battleState.currentFloor)

const hpPercent = computed(() => {
  if (battleState.playerMaxHp <= 0) return 0
  return Math.max(0, Math.min(100, (battleState.playerHp / battleState.playerMaxHp) * 100))
})

const mpPercent = computed(() => {
  if (battleState.playerMaxMagic <= 0) return 0
  return Math.max(0, Math.min(100, (battleState.playerMagic / battleState.playerMaxMagic) * 100))
})

const monsterHpPercent = computed(() => {
  if (battleState.monsterMaxHp <= 0) return 0
  return Math.max(0, Math.min(100, (battleState.monsterHp / battleState.monsterMaxHp) * 100))
})

const playerAvatar = ref(defaultAvatar)
const monsterAvatarSrc = ref(defaultMonsterImg)

const monsterImgSrc = computed(() => {
  if (battleState.challengeMode === 'pvp' && battleState.monsterImg) {
    return battleState.monsterImg
  }
  return monsterAvatarSrc.value
})

const activeBattlePets = computed(() => {
  return battleState.activePets.filter(p => p && p.id)
})

const battleSkills = computed(() => {
  const className = playerStore.characterClass
  if (!className || !SKILLS[className]) return []
  return SKILLS[className]
})

const battleItems = computed(() => {
  const items = inventoryStore.backpackItems || []
  return items.filter(item => {
    if (!item.quantity || item.quantity <= 0) return false
    const itemData = ITEMS[item.name]
    if (!itemData) return false
    return ['heal', 'mana', 'buff', 'tame'].includes(itemData.type)
  })
})

function getSkillLevel(skillId) {
  return playerStore.skills[skillId] || 1
}

function getItemDesc(itemName) {
  return ITEMS[itemName]?.desc || ''
}

function onPlayerAvatarError() {
  playerAvatar.value = defaultAvatar
}

function onMonsterAvatarError() {
  monsterAvatarSrc.value = defaultMonsterImg
}

function noop() {}

function addBattleLog(msg) {
  if (!Array.isArray(battleState.battleLog)) {
    battleState.battleLog = []
  }
  battleState.battleLog.push(msg)
  if (battleState.battleLog.length > 50) {
    battleState.battleLog.shift()
  }
}

function scrollLogToBottom() {
  nextTick(() => {
    if (battleLogRef.value) {
      battleLogRef.value.scrollTop = battleLogRef.value.scrollHeight
    }
  })
}

watch(() => battleState.battleLog.length, () => {
  scrollLogToBottom()
})

function getPlayerCombatStats() {
  const className = playerStore.characterClass || '平民'
  const lvl = playerStore.level || 1
  const equipped = inventoryStore.equippedItems || {}
  const equipBonus = getEquipmentBonus(equipped)

  const activeRunes = (runeStore.activeRunes || []).filter(r => r)
  const runeBonus = getTotalRuneBonus(activeRunes)

  const userTalents = playerStore.talents || {}
  const talentBonus = getTalentBonus(userTalents, className)

  const stats = getCharacterStats(className, lvl, equipBonus, runeBonus, talentBonus)
  stats.dodgeRate = (stats.dodgeRate || 0) + (equipBonus.dodgeRate || 0)
  stats.magicRegen = (stats.magicRegen || 0) + (equipBonus.magicRegen || 0)
  return stats
}

function buildMonsterFromConfig() {
  const config = props.battleConfig
  if (!config) return null

  if (config.mode === 'dungeon') {
    const floor = config.floor || 1
    return { monster: getMonsterData(floor), floor }
  }

  if (config.mode === 'pvp') {
    const opp = config.opponent
    if (opp) {
      return {
        monster: {
          name: opp.name,
          img: '/image/main/' + opp.characterClass + '头像.webp',
          hp: opp.hp || opp.maxHp || 500,
          maxHp: opp.maxHp || opp.hp || 500,
          attack: opp.atk || 50,
          defense: opp.def || 30,
          atkSpeed: opp.atkSpeed || 1.0,
          moveSpeed: 3.0,
          isBoss: false,
          isElite: false,
          level: opp.level || 1,
          isAI: true,
          characterClass: opp.characterClass,
          magic: opp.magic || 30,
          maxMagic: opp.maxMagic || opp.magic || 30,
        },
        floor: 0,
      }
    }
    const playerLvl = playerStore.level || 1
    const opponent = generatePvPOpponent(playerLvl)
    return {
      monster: {
        name: opponent.name,
        img: '/image/main/' + opponent.characterClass + '头像.webp',
        hp: opponent.maxHp,
        maxHp: opponent.maxHp,
        attack: opponent.attack,
        defense: opponent.defense,
        atkSpeed: opponent.atkSpeed || 1.0,
        moveSpeed: 3.0,
        isBoss: false,
        isElite: false,
        level: opponent.level,
        isAI: true,
        characterClass: opponent.characterClass,
        magic: opponent.magic || 30,
        maxMagic: opponent.maxMagic || opponent.magic || 30,
      },
      floor: 0,
    }
  }

  if (config.mode === 'endless') {
    const wave = config.wave || 1
    const monster = generateEndlessMonster(wave)
    return { monster, floor: wave, wave }
  }

  if (config.mode === 'bossEvolution') {
    const boss = config.boss
    if (boss) {
      return { monster: { ...boss, isBoss: true }, floor: boss.floor || 0 }
    }
    return null
  }

  if (config.mode === 'mist-island') {
    const monster = config.monster
    if (monster) {
      return {
        monster: {
          name: monster.name,
          img: monster.img || '/image/monster/雪绒兔.webp',
          hp: monster.hp || monster.maxHp || 100,
          maxHp: monster.maxHp || monster.hp || 100,
          attack: monster.attack || 10,
          defense: monster.defense || 5,
          atkSpeed: monster.atkSpeed || 1.0,
          moveSpeed: monster.moveSpeed || 3.0,
          isBoss: !!monster.isBoss,
          isElite: false,
        },
        floor: 0,
      }
    }
    return null
  }

  return null
}

function initBattle() {
  try {
    const config = props.battleConfig
    if (!config) return

    battleState.inBattle = false
    battleState.currentFloor = 1
    battleState.challengeMode = null
    battleState.bossId = null
    battleState.evoCount = 0
    battleState.wave = null
    battleState.monsterIsBoss = false
    battleState.monsterIsElite = false
    battleState.isDefending = false
    battleState.isPlayerTurn = true
    battleState.battleLog = []
    battleState.canTame = true
    battleState.playerBuffs = []
    battleState.monsterDebuffs = []
    battleState.buffCriticalRate = 0
    battleState.buffDefense = 0
    battleState.buffSpeed = 0
    battleState.buffAttack = 0
    battleState.buffDodgeRate = 0
    battleState.magicRegen = 0
    battleState.monsterMagic = 0
    battleState.monsterMaxMagic = 0
    battleState.monsterCharacterClass = ''
    battleState.monsterDefending = false

    const playerStats = getPlayerCombatStats()

    const built = buildMonsterFromConfig()
    if (!built) {
      console.error('[Battle] buildMonsterFromConfig returned null for config:', config)
      addBattleLog('❌ 战斗初始化失败：无法加载怪物数据')
      emit('close')
      return
    }

    const monster = built.monster
    const floor = built.floor || 1

    battleState.currentFloor = floor
    battleState.challengeMode = config.mode || 'dungeon'
    battleState.bossId = config.bossId || config.boss?.id || null
    battleState.evoCount = config.evoCount || 0
    battleState.wave = built.wave || null

    battleState.playerHp = playerStats.maxHp
    battleState.playerMaxHp = playerStats.maxHp
    battleState.playerAtk = playerStats.attack
    battleState.playerDef = playerStats.defense
    battleState.playerAtkSpeed = playerStats.atkSpeed
    battleState.playerCritRate = playerStats.critRate
    battleState.playerMagic = playerStats.magic || 30
    battleState.playerMaxMagic = playerStats.magic || 30
    battleState.buffDodgeRate = playerStats.dodgeRate || 0
    battleState.magicRegen = playerStats.magicRegen || 0

    battleState.monsterHp = monster.hp || monster.maxHp || 100
    battleState.monsterMaxHp = monster.maxHp || monster.hp || 100
    battleState.monsterAtk = monster.attack || 10
    battleState.monsterDef = monster.defense || 5
    battleState.monsterAtkSpeed = monster.atkSpeed || 1.0
    battleState.monsterName = monster.name || '未知怪物'
    battleState.monsterImg = monster.img || ''
    battleState.monsterIsBoss = monster.isBoss || false
    battleState.monsterIsElite = monster.isElite || false
    battleState.monsterMagic = monster.magic || 0
    battleState.monsterMaxMagic = monster.maxMagic || monster.magic || 0
    battleState.monsterCharacterClass = monster.characterClass || ''

    battleState.activePets = (petStore.activePets || [])
      .filter(pet => pet && pet.id)
      .map(pet => ({ ...pet, maxHp: pet.maxHp || pet.hp, hp: pet.hp || pet.maxHp || 0 }))

    const className = playerStore.characterClass || '平民'
    playerAvatar.value = playerStore.customAvatar || '/image/role/' + className + '.webp'

    if (monster.isAI) {
      const aiClass = monster.characterClass || '平民'
      monsterAvatarSrc.value = '/image/main/' + aiClass + '头像.webp'
    } else {
      monsterAvatarSrc.value = monster.img || defaultMonsterImg
    }

    battleState.inBattle = true

    if (config.mode === 'endless' && built.wave) {
      addBattleLog('第' + built.wave + '波：' + monster.name + '出现了！')
    } else if (config.mode === 'bossEvolution') {
      addBattleLog('👑 BOSS超进化：' + monster.name + '（进化' + (config.evoCount || 0) + '次）出现了！')
    } else if (config.mode === 'pvp') {
      addBattleLog('⚔️ PVP对战：' + monster.name + '（' + (monster.characterClass || '') + ' Lv.' + (monster.level || '') + '）发起挑战！')
    } else if (config.mode === 'mist-island') {
      addBattleLog('🌫️ 迷雾岛：' + monster.name + '出现了！')
    } else {
      addBattleLog('第' + floor + '层：' + monster.name + '出现了！')
    }
    addBattleLog('你的回合，请选择行动！')
    scrollLogToBottom()
  } catch (e) {
    console.error('[Battle] initBattle error:', e)
    addBattleLog('❌ 战斗初始化异常：' + (e.message || '未知错误'))
    emit('close')
  }
}

watch(() => props.battleConfig, (config) => {
  if (config) initBattle()
}, { deep: true, immediate: true })

function playerAttack() {
  if (!battleState.inBattle || !battleState.isPlayerTurn) return

  battleState.isDefending = false

  let damage = calculateDamage(battleState.playerAtk, battleState.monsterDef, false)
  if (oneHitKill.value) {
    damage = battleState.monsterMaxHp
  }
  if (battleState.buffAttack) {
    damage = Math.floor(damage * (1 + battleState.buffAttack))
  }

  let logMsg = ''
  const critChance = (battleState.playerCritRate || 0) / 100 + (battleState.buffCriticalRate || 0)
  const isCrit = Math.random() < critChance

  if (isCrit) {
    damage *= 2
    logMsg = '你发动了暴击！对' + battleState.monsterName + '造成了' + damage + '点伤害！'
    playerStore.recordCrit()
  } else {
    logMsg = '你攻击了' + battleState.monsterName + '，造成了' + damage + '点伤害！'
  }

  if (battleState.monsterDefending) {
    damage = Math.floor(damage * 0.5)
    logMsg += '（敌人防御减半）'
    battleState.monsterDefending = false
  }

  battleState.monsterHp = Math.max(0, battleState.monsterHp - damage)
  addBattleLog(logMsg)

  petAttack()

  if (battleState.monsterHp <= 0) {
    handleVictory()
  } else {
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
  }
}

function playerDefend() {
  if (!battleState.inBattle || !battleState.isPlayerTurn) return

  battleState.isDefending = true
  addBattleLog('你进入防御姿态，下回合受到伤害减半！')

  petAttack()

  if (battleState.monsterHp <= 0) {
    handleVictory()
  } else {
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
  }
}

function useSkill(skill) {
  if (!battleState.inBattle || !battleState.isPlayerTurn) return

  if (battleState.playerMagic < skill.magicCost) {
    addBattleLog('❌ 魔力不足！')
    showSkillSelect.value = false
    return
  }

  if (!mpLocked.value) {
    battleState.playerMagic -= skill.magicCost
  }
  showSkillSelect.value = false

  const currentLevel = getSkillLevel(skill.id)
  const playerStats = getPlayerCombatStats()
  let damage = 0
  let logMsg = '你使用了' + skill.name + '！'

  switch (skill.type) {
    case SKILL_TYPE.ATTACK:
      damage = skill.baseDamage + (currentLevel - 1) * (skill.levelBonus || 0)
      const atkPower = (playerStats.attack + playerStats.magic * 0.5) * (1 + (battleState.buffAttack || 0))
      if (battleState.monsterDefending) {
        logMsg += '（敌人防御减半）'
        battleState.monsterDefending = false
      }
      if (skill.hits) {
        let totalDamage = 0
        for (let i = 0; i < skill.hits; i++) {
          const hitDamage = Math.floor(atkPower * damage / 100)
          battleState.monsterHp = Math.max(0, battleState.monsterHp - hitDamage)
          totalDamage += hitDamage
        }
        logMsg += ' 连续' + skill.hits + '次攻击，造成了' + totalDamage + '点伤害！'
      } else {
        const rawDamage = Math.floor(atkPower * damage / 100)
        battleState.monsterHp = Math.max(0, battleState.monsterHp - rawDamage)
        logMsg += ' 造成了' + rawDamage + '点伤害！'
      }
      if (skill.effectType === 'lifesteal') {
        const lsPercent = skill.baseEffect + (currentLevel - 1) * (skill.effectBonus || 0)
        const actualTotalDamage = skill.hits
          ? Math.floor(atkPower * damage / 100) * skill.hits
          : Math.floor(atkPower * damage / 100)
        const lsAmount = Math.floor(actualTotalDamage * lsPercent / 100)
        battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + lsAmount)
        logMsg += ' 吸取了' + lsAmount + '点生命！'
      }
      break

    case SKILL_TYPE.HEAL:
      const healAmount = skill.baseDamage + Math.floor(playerStats.magic * 0.8) + (currentLevel - 1) * (skill.levelBonus || 0)
      battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + healAmount)
      logMsg += ' 恢复了' + healAmount + '点生命！'
      break

    case SKILL_TYPE.DEFENSE:
      const shieldAmount = skill.baseDamage + Math.floor(playerStats.magic * 0.5) + (currentLevel - 1) * (skill.levelBonus || 0)
      battleState.playerBuffs.push({
        type: 'shield',
        amount: shieldAmount,
        description: skill.name + '护盾',
      })
      logMsg += ' 获得了' + shieldAmount + '点护盾！'
      break

    case SKILL_TYPE.BUFF:
      const buffAmount = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0)
      battleState.playerBuffs.push({
        type: skill.effectType || 'attack',
        amount: buffAmount,
        duration: 3,
        description: skill.name + '效果',
      })
      logMsg += ' 效果已激活！'
      break

    case SKILL_TYPE.DEBUFF:
      const debuffAmount = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0)
      battleState.monsterDebuffs.push({
        type: skill.effectType || 'defense',
        amount: debuffAmount,
        duration: 3,
        description: skill.name + '效果',
      })
      const debuffDamage = Math.floor(playerStats.attack * (skill.baseDamage || 80) / 100)
      battleState.monsterHp = Math.max(0, battleState.monsterHp - debuffDamage)
      logMsg += ' 造成' + debuffDamage + '点伤害，并施加了负面效果！'
      break

    case SKILL_TYPE.SPECIAL:
      if (skill.effectType === 'escape') {
        const escapeChance = skill.baseEffect + (currentLevel - 1) * (skill.levelBonus || 0)
        if (Math.random() * 100 < escapeChance) {
          addBattleLog('🎉 成功逃跑！')
          battleState.inBattle = false
          emit('close')
          return
        } else {
          logMsg += ' 逃跑失败！'
        }
      } else {
        logMsg += ' 特殊效果已触发！'
      }
      break
  }

  addBattleLog(logMsg)

  if (oneHitKill.value && (skill.type === SKILL_TYPE.ATTACK || skill.type === SKILL_TYPE.DEBUFF)) {
    battleState.monsterHp = 0
    addBattleLog('💀 [一击必杀] ' + battleState.monsterName + '被秒杀了！')
  }

  petAttack()

  if (battleState.monsterHp <= 0) {
    handleVictory()
  } else {
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
  }
}

function useItem(item) {
  if (!battleState.inBattle || !battleState.isPlayerTurn) return
  showItemSelect.value = false

  const backpackItems = inventoryStore.backpackItems || []
  const foundItem = backpackItems.find(i => i.id === item.id)
  if (!foundItem || foundItem.quantity <= 0) return

  const itemData = ITEMS[foundItem.name]
  if (!itemData) return

  let used = false

  if (itemData.type === 'heal') {
    const healAmount = Math.floor(battleState.playerMaxHp * itemData.effect)
    battleState.playerHp = Math.min(battleState.playerHp + healAmount, battleState.playerMaxHp)
    addBattleLog('使用了' + foundItem.name + '，恢复了' + healAmount + '点生命！')
    used = true
  } else if (itemData.type === 'mana') {
    const manaAmount = Math.floor(battleState.playerMaxMagic * itemData.effect)
    battleState.playerMagic = Math.min(battleState.playerMagic + manaAmount, battleState.playerMaxMagic)
    addBattleLog('使用了' + foundItem.name + '，恢复了' + manaAmount + '点魔力！')
    used = true
  } else if (itemData.type === 'buff') {
    const effects = itemData.effect || {}
    if (effects.criticalRate) {
      battleState.buffCriticalRate = (battleState.buffCriticalRate || 0) + effects.criticalRate
      addBattleLog('使用了' + foundItem.name + '，暴击率提升' + Math.floor(effects.criticalRate * 100) + '%！')
    }
    if (effects.defense) {
      battleState.buffDefense = (battleState.buffDefense || 0) + effects.defense
      addBattleLog('使用了' + foundItem.name + '，防御力提升' + Math.floor(effects.defense * 100) + '%！')
    }
    if (effects.speed) {
      battleState.buffSpeed = (battleState.buffSpeed || 0) + effects.speed
      addBattleLog('使用了' + foundItem.name + '，攻击速度提升' + Math.floor(effects.speed * 100) + '%！')
    }
    if (effects.attack) {
      battleState.buffAttack = (battleState.buffAttack || 0) + effects.attack
      addBattleLog('使用了' + foundItem.name + '，攻击力提升' + Math.floor(effects.attack * 100) + '%！')
    }
    used = true
  } else if (itemData.type === 'tame') {
    if (!battleState.canTame) {
      addBattleLog('本场战斗已经使用过驯服！')
      return
    }

    const tameType = itemData.effect?.type || 'normal'
    let canTame = false
    if (tameType === 'all') {
      canTame = true
    } else if (tameType === 'normal' && !battleState.monsterIsBoss && !battleState.monsterIsElite) {
      canTame = true
    } else if (tameType === 'elite' && battleState.monsterIsElite) {
      canTame = true
    }

    if (canTame) {
      const pet = createPetFromMonster(battleState.monsterName, battleState.monsterImg)
      if (petStore.pets.length >= 60) {
        addBattleLog('使用了' + foundItem.name + '，驯服了' + battleState.monsterName + '！但宠物背包已满！')
      } else {
        petStore.addPet(pet)
        addBattleLog('使用了' + foundItem.name + '，驯服了' + battleState.monsterName + '！宠物已加入背包！')
      }
      battleState.canTame = false
      battleState.monsterHp = 0

      const monsterTypeStr = battleState.monsterIsBoss ? 'bosses' : (battleState.monsterIsElite ? 'elites' : 'normals')
      dungeonStore.recordDefeated(battleState.currentFloor, monsterTypeStr)
      playerStore.setHasTamed(true)
      achievementStore.checkAchievements()

      used = true
      consumeItem(foundItem, backpackItems)
      handleVictory(true)
      return
    } else {
      addBattleLog(foundItem.name + '无法驯服该怪物！')
      return
    }
  }

  if (used) {
    consumeItem(foundItem, backpackItems)
    if (itemData.type !== 'tame') {
      battleState.isPlayerTurn = false
      setTimeout(monsterTurn, 800)
    }
  }
}

function consumeItem(foundItem, backpackItems) {
  foundItem.quantity--
  if (foundItem.quantity <= 0) {
    const idx = backpackItems.indexOf(foundItem)
    if (idx > -1) {
      backpackItems.splice(idx, 1)
    }
  }
  inventoryStore.backpackItems = [...backpackItems]
}

function petAttack() {
  if (battleState.activePets.length === 0) return

  for (const pet of battleState.activePets) {
    if (!pet || pet.hp <= 0) continue

    const damageMultiplier = 0.8 + Math.random() * 0.4
    const damage = Math.floor((pet.atk || 0) * damageMultiplier)
    battleState.monsterHp = Math.max(0, battleState.monsterHp - damage)
    addBattleLog('🐾 ' + pet.name + '攻击了' + battleState.monsterName + '，造成了' + damage + '点伤害！')

    if (battleState.monsterHp <= 0) {
      return
    }
  }
}

function playerTame() {
  if (!battleState.inBattle || !battleState.isPlayerTurn) return

  if (battleState.monsterIsBoss) {
    addBattleLog('❌ BOSS无法被驯服！')
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
    return
  }

  if (!battleState.canTame) {
    addBattleLog('❌ 本次战斗已经使用过驯服！')
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
    return
  }

  const tameChance = battleState.monsterIsElite ? 0.03 : 0.05
  battleState.canTame = false

  addBattleLog('🦊 你使用了凌驾（驯服）！')

  if (forceTame.value || Math.random() < tameChance) {
    const pet = createPetFromMonster(battleState.monsterName, battleState.monsterImg)

    if (petStore.pets.length >= 60) {
      addBattleLog('❌ 宠物背包已满，无法容纳新宠物！')
      battleState.isPlayerTurn = false
      setTimeout(monsterTurn, 800)
      return
    }

    petStore.addPet(pet)
    playerStore.setHasTamed(true)
    achievementStore.checkAchievements()
    addBattleLog('🎉 驯服成功！获得了' + pet.rarity + '级宠物「' + pet.name + '」！')

    const monsterTypeStr = battleState.monsterIsBoss ? 'bosses' : (battleState.monsterIsElite ? 'elites' : 'normals')
    dungeonStore.recordDefeated(battleState.currentFloor, monsterTypeStr)

    battleState.monsterHp = 0

    setTimeout(() => {
      handleVictory(true)
    }, 1000)
  } else {
    addBattleLog('😢 驯服失败...' + battleState.monsterName + '挣脱了！')
    battleState.isPlayerTurn = false
    setTimeout(monsterTurn, 800)
  }
}

function monsterTurn() {
  if (!battleState.inBattle || battleState.monsterHp <= 0) return

  if (battleState.challengeMode === 'pvp' && battleState.monsterCharacterClass && SKILLS[battleState.monsterCharacterClass]) {
    executePvPAIAction()
    return
  }

  let actualMonsterAtk = battleState.monsterAtk
  let actualMonsterDef = battleState.monsterDef

  battleState.monsterDebuffs.forEach(debuff => {
    if (debuff.type === 'defense_down' || debuff.type === 'defense') {
      actualMonsterDef *= (100 - debuff.amount) / 100
    }
    if (debuff.type === 'atk_speed_down') {
      actualMonsterAtk *= (100 - debuff.amount) / 100
    }
  })

  let playerDefBonus = 1
  battleState.playerBuffs.forEach(buff => {
    if (buff.type === 'defense_up' || buff.type === 'defense') {
      playerDefBonus += buff.amount / 100
    }
  })

  let playerDamage = calculateDamage(actualMonsterAtk, battleState.playerDef * playerDefBonus, battleState.isDefending)
  if (battleState.buffDefense) {
    playerDamage = Math.floor(playerDamage * (1 - battleState.buffDefense))
  }

  let logMsg = ''
  const dodgeChance = battleState.buffDodgeRate || 0
  const isDodged = Math.random() < dodgeChance

  if (isDodged) {
    logMsg = '🌀 你闪避了' + battleState.monsterName + '的攻击！'
    addBattleLog(logMsg)
  } else {
    let shieldRemaining = 0
    const shieldIndex = battleState.playerBuffs.findIndex(b => b.type === 'shield')
    if (shieldIndex !== -1) {
      shieldRemaining = battleState.playerBuffs[shieldIndex].amount
      if (shieldRemaining > playerDamage) {
        battleState.playerBuffs[shieldIndex].amount -= playerDamage
        addBattleLog(battleState.monsterName + '攻击了你，护盾吸收了' + playerDamage + '点伤害！')
        playerDamage = 0
      } else {
        playerDamage -= shieldRemaining
        addBattleLog(battleState.monsterName + '攻击了你，护盾破裂！')
        battleState.playerBuffs.splice(shieldIndex, 1)
      }
    }

    if (playerDamage > 0) {
      if (!hpLocked.value) {
        battleState.playerHp = Math.max(0, battleState.playerHp - playerDamage)
      } else {
        addBattleLog('🛡️ [无敌模式] 免疫了本次伤害！')
      }
      logMsg = battleState.monsterName + '攻击了你，造成了' + playerDamage + '点伤害！'

      const frost = getFrostSlowEffect(battleState.currentFloor)
      const slowApplied = Math.random() * 100 < frost.chance
      if (slowApplied) {
        logMsg += ' 并附带了' + frost.duration.toFixed(1) + '秒减速！'
      }
      addBattleLog(logMsg)
    }

    if (battleState.activePets.length > 0 && Math.random() < 0.5) {
      const alivePets = battleState.activePets.filter(p => p && p.hp > 0)
      if (alivePets.length > 0) {
        const targetPet = alivePets[Math.floor(Math.random() * alivePets.length)]
        const petDamage = Math.floor(actualMonsterAtk * (0.3 + Math.random() * 0.2))
        targetPet.hp = Math.max(0, targetPet.hp - petDamage)
        addBattleLog('🐾 ' + targetPet.name + '被' + battleState.monsterName + '攻击，受到了' + petDamage + '点伤害！')

        if (targetPet.hp <= 0) {
          addBattleLog('💀 ' + targetPet.name + '阵亡了...')
        }
      }
    }
  }

  battleState.isDefending = false

  battleState.playerBuffs = battleState.playerBuffs.filter(b => {
    if (b.duration !== undefined) {
      b.duration--
      return b.duration > 0
    }
    return true
  })

  battleState.monsterDebuffs = battleState.monsterDebuffs.filter(d => {
    if (d.duration !== undefined) {
      d.duration--
      return d.duration > 0
    }
    return true
  })

  if (battleState.playerHp <= 0) {
    handleDefeat()
  } else {
    const deadPetIds = battleState.activePets.filter(p => p && p.hp <= 0).map(p => p.id)
    if (deadPetIds.length > 0) {
      battleState.activePets = battleState.activePets.filter(p => p && p.hp > 0)
      const currentActivePets = petStore.activePets.filter(pet => pet && !deadPetIds.includes(pet.id))
      petStore.activePets = [...currentActivePets, ...Array(3 - currentActivePets.length).fill(null)].slice(0, 3)
    }

    if (battleState.playerMaxMagic > 0) {
      const regen = battleState.magicRegen || 0
      if (regen > 0) {
        battleState.playerMagic = Math.min(battleState.playerMaxMagic, battleState.playerMagic + regen)
      }
    }

    battleState.isPlayerTurn = true
  }
}

function executePvPAIAction() {
  const aiClass = battleState.monsterCharacterClass
  const skills = SKILLS[aiClass]
  if (!skills || skills.length === 0) {
    monsterNormalAttack()
    return
  }

  const hpRatio = battleState.monsterHp / battleState.monsterMaxHp
  const magic = battleState.monsterMagic

  let chosenAction = null

  if (hpRatio < 0.3) {
    const defenseSkills = skills.filter(s => s.type === 'defense' || s.type === 'buff' || s.type === 'heal')
    const affordable = defenseSkills.filter(s => magic >= s.magicCost)
    if (affordable.length > 0 && Math.random() < 0.6) {
      chosenAction = affordable[Math.floor(Math.random() * affordable.length)]
    }
  }

  if (!chosenAction && magic > 0) {
    const attackSkills = skills.filter(s => s.type === 'attack' || s.type === 'debuff')
    const affordable = attackSkills.filter(s => magic >= s.magicCost)
    if (affordable.length > 0 && Math.random() < 0.5) {
      chosenAction = affordable[Math.floor(Math.random() * affordable.length)]
    }
  }

  if (!chosenAction && hpRatio < 0.4 && Math.random() < 0.3) {
    addBattleLog('🛡️ ' + battleState.monsterName + '采取了防御姿态！')
    battleState.monsterDefending = true
    endMonsterTurn()
    return
  }

  if (chosenAction) {
    executeAIMonsterSkill(chosenAction)
  } else {
    monsterNormalAttack()
  }
}

function executeAIMonsterSkill(skill) {
  battleState.monsterMagic = Math.max(0, battleState.monsterMagic - skill.magicCost)

  if (skill.type === 'attack') {
    const hits = skill.hits || 1
    let totalDamage = 0
    for (let i = 0; i < hits; i++) {
      let skillDamage = skill.baseDamage + (skill.levelBonus || 0) * (battleState.currentFloor || 1)
      skillDamage = Math.floor(skillDamage * (0.8 + Math.random() * 0.4))
      if (battleState.isDefending) {
        skillDamage = Math.floor(skillDamage * 0.5)
      }
      if (hpLocked.value) {
        skillDamage = 0
      }
      totalDamage += skillDamage
    }

    if (hpLocked.value) {
      addBattleLog('🛡️ [无敌模式] 免疫了' + battleState.monsterName + '的' + skill.name + '！')
    } else {
      battleState.playerHp = Math.max(0, battleState.playerHp - totalDamage)
      let logMsg = '⚡ ' + battleState.monsterName + '释放了' + skill.name + '，造成了' + totalDamage + '点伤害！'
      if (battleState.isDefending) {
        logMsg += '（防御减半）'
      }
      addBattleLog(logMsg)
    }

    if (skill.effectType === 'lifesteal' && totalDamage > 0) {
      const healAmount = Math.floor(totalDamage * (skill.baseEffect / 100))
      battleState.monsterHp = Math.min(battleState.monsterMaxHp, battleState.monsterHp + healAmount)
      addBattleLog('🩸 ' + battleState.monsterName + '汲取了' + healAmount + '点生命！')
    }

    if (skill.effectType === 'defense_down') {
      const reduction = skill.baseEffect + (skill.effectBonus || 0) * (battleState.currentFloor || 1)
      battleState.playerDef = Math.max(1, battleState.playerDef - reduction)
      addBattleLog('🔻 ' + battleState.monsterName + '的' + skill.name + '降低了你的防御力！')
    }

  } else if (skill.type === 'buff') {
    addBattleLog('✨ ' + battleState.monsterName + '使用了' + skill.name + '！')
    if (skill.effectType === 'attack_up') {
      const bonus = skill.baseEffect + (skill.levelBonus || 0) * (battleState.currentFloor || 1)
      battleState.monsterAtk += bonus
      addBattleLog('💪 ' + battleState.monsterName + '的攻击力提升了！')
    } else if (skill.effectType === 'defense_up' || skill.effectType === 'damage_reduction') {
      const bonus = skill.baseEffect + (skill.levelBonus || 0) * (battleState.currentFloor || 1)
      battleState.monsterDef += bonus
      addBattleLog('🛡️ ' + battleState.monsterName + '的防御力提升了！')
    } else if (skill.effectType === 'evasion_up') {
      addBattleLog('🌀 ' + battleState.monsterName + '的闪避率提升了！')
    } else if (skill.effectType === 'crit_rate_up') {
      addBattleLog('🎯 ' + battleState.monsterName + '的暴击率提升了！')
    }

  } else if (skill.type === 'defense') {
    addBattleLog('🛡️ ' + battleState.monsterName + '使用了' + skill.name + '！')
    if (skill.effectType === 'magic_shield' || skill.effectType === 'holy_shield') {
      const shieldAmount = skill.baseDamage + (skill.levelBonus || 0) * (battleState.currentFloor || 1)
      battleState.monsterHp = Math.min(battleState.monsterMaxHp, battleState.monsterHp + shieldAmount)
      addBattleLog('🔰 ' + battleState.monsterName + '恢复了' + shieldAmount + '点生命！')
    } else if (skill.effectType === 'reflect_damage') {
      battleState.monsterDefending = true
      addBattleLog('⚡ ' + battleState.monsterName + '准备反弹伤害！')
    }

  } else if (skill.type === 'heal') {
    const healAmount = skill.baseDamage + (skill.levelBonus || 0) * (battleState.currentFloor || 1)
    battleState.monsterHp = Math.min(battleState.monsterMaxHp, battleState.monsterHp + healAmount)
    addBattleLog('💚 ' + battleState.monsterName + '使用了' + skill.name + '，恢复了' + healAmount + '点生命！')

  } else if (skill.type === 'debuff') {
    addBattleLog('咒 ' + battleState.monsterName + '使用了' + skill.name + '！')
    if (skill.effectType === 'atk_speed_down') {
      battleState.playerAtkSpeed = Math.max(0.5, battleState.playerAtkSpeed * 0.8)
      addBattleLog('🐌 你的攻击速度降低了！')
    }

  } else {
    addBattleLog('✨ ' + battleState.monsterName + '使用了' + skill.name + '！')
  }

  if (battleState.playerHp <= 0 && !hpLocked.value) {
    handleDefeat()
    return
  }

  endMonsterTurn()
}

function monsterNormalAttack() {
  let actualMonsterAtk = battleState.monsterAtk
  let actualMonsterDef = battleState.monsterDef

  battleState.monsterDebuffs.forEach(debuff => {
    if (debuff.type === 'defense_down' || debuff.type === 'defense') {
      actualMonsterDef *= (100 - debuff.amount) / 100
    }
    if (debuff.type === 'atk_speed_down') {
      actualMonsterAtk *= (100 - debuff.amount) / 100
    }
  })

  let playerDefBonus = 1
  battleState.playerBuffs.forEach(buff => {
    if (buff.type === 'defense_up' || buff.type === 'defense') {
      playerDefBonus += buff.amount / 100
    }
  })

  let playerDamage = calculateDamage(actualMonsterAtk, battleState.playerDef * playerDefBonus, battleState.isDefending)
  if (battleState.buffDefense) {
    playerDamage = Math.floor(playerDamage * (1 - battleState.buffDefense))
  }

  const dodgeChance = battleState.buffDodgeRate || 0
  const isDodged = Math.random() < dodgeChance

  if (isDodged) {
    addBattleLog('🌀 你闪避了' + battleState.monsterName + '的攻击！')
  } else {
    let shieldRemaining = 0
    const shieldIndex = battleState.playerBuffs.findIndex(b => b.type === 'shield')
    if (shieldIndex !== -1) {
      shieldRemaining = battleState.playerBuffs[shieldIndex].amount
      if (shieldRemaining > playerDamage) {
        battleState.playerBuffs[shieldIndex].amount -= playerDamage
        addBattleLog(battleState.monsterName + '攻击了你，护盾吸收了' + playerDamage + '点伤害！')
        playerDamage = 0
      } else {
        playerDamage -= shieldRemaining
        addBattleLog(battleState.monsterName + '攻击了你，护盾破裂！')
        battleState.playerBuffs.splice(shieldIndex, 1)
      }
    }

    if (playerDamage > 0) {
      if (!hpLocked.value) {
        battleState.playerHp = Math.max(0, battleState.playerHp - playerDamage)
      } else {
        addBattleLog('🛡️ [无敌模式] 免疫了本次伤害！')
      }
      let logMsg = battleState.monsterName + '攻击了你，造成了' + playerDamage + '点伤害！'

      const frost = getFrostSlowEffect(battleState.currentFloor)
      const slowApplied = Math.random() * 100 < frost.chance
      if (slowApplied) {
        logMsg += ' 并附带了' + frost.duration.toFixed(1) + '秒减速！'
      }
      addBattleLog(logMsg)
    }

    if (battleState.activePets.length > 0 && Math.random() < 0.5) {
      const alivePets = battleState.activePets.filter(p => p && p.hp > 0)
      if (alivePets.length > 0) {
        const targetPet = alivePets[Math.floor(Math.random() * alivePets.length)]
        const petDamage = Math.floor(actualMonsterAtk * (0.3 + Math.random() * 0.2))
        targetPet.hp = Math.max(0, targetPet.hp - petDamage)
        addBattleLog('🐾 ' + targetPet.name + '被' + battleState.monsterName + '攻击，受到了' + petDamage + '点伤害！')

        if (targetPet.hp <= 0) {
          addBattleLog('💀 ' + targetPet.name + '阵亡了...')
        }
      }
    }
  }

  endMonsterTurn()
}

function endMonsterTurn() {
  battleState.isDefending = false

  battleState.playerBuffs = battleState.playerBuffs.filter(b => {
    if (b.duration !== undefined) {
      b.duration--
      return b.duration > 0
    }
    return true
  })

  battleState.monsterDebuffs = battleState.monsterDebuffs.filter(d => {
    if (d.duration !== undefined) {
      d.duration--
      return d.duration > 0
    }
    return true
  })

  if (battleState.playerHp <= 0) {
    handleDefeat()
  } else {
    const deadPetIds = battleState.activePets.filter(p => p && p.hp <= 0).map(p => p.id)
    if (deadPetIds.length > 0) {
      battleState.activePets = battleState.activePets.filter(p => p && p.hp > 0)
      const currentActivePets = petStore.activePets.filter(pet => pet && !deadPetIds.includes(pet.id))
      petStore.activePets = [...currentActivePets, ...Array(3 - currentActivePets.length).fill(null)].slice(0, 3)
    }

    if (battleState.playerMaxMagic > 0) {
      const regen = battleState.magicRegen || 0
      if (regen > 0) {
        battleState.playerMagic = Math.min(battleState.playerMaxMagic, battleState.playerMagic + regen)
      }
    }

    battleState.isPlayerTurn = true
  }
}

function handleVictory(isTame) {
  battleState.inBattle = false
  battleState.canTame = false
  addBattleLog('🎉 恭喜！你击败了' + battleState.monsterName + '！')

  playerStore.recordBattleWin()

  const floor = battleState.currentFloor
  if (!isTame) {
    if (battleState.monsterIsBoss) {
      dungeonStore.recordDefeated(floor, 'bosses')
    } else if (battleState.monsterIsElite) {
      dungeonStore.recordDefeated(floor, 'elites')
    } else {
      dungeonStore.recordDefeated(floor, 'normals')
    }
  }

  let rewards = { exp: 0, gold: 0, diamond: 0 }

  if (!isTame) {
    let drops
    if (battleState.challengeMode === 'pvp') {
      const playerLvl = playerStore.level || 1
      const aiLevel = battleState.currentFloor || playerLvl
      const levelDiff = Math.max(1, aiLevel - playerLvl + 1)
      drops = {
        exp: Math.floor(50 * levelDiff * (0.8 + Math.random() * 0.4)),
        gold: Math.floor(100 * levelDiff * (0.8 + Math.random() * 0.4)),
        diamond: Math.random() < 0.3 ? Math.floor(2 + Math.random() * 3) : 0,
      }
    } else {
      drops = calculateDrops(battleState.currentFloor, battleState.monsterIsBoss, battleState.monsterIsElite)
    }

    playerStore.addExp(drops.exp)
    playerStore.addGold(drops.gold)
    if (drops.diamond > 0) {
      playerStore.addDiamond(drops.diamond)
    }

    rewards = { ...drops }
    addBattleLog('获得经验: ' + drops.exp + '，金币: ' + drops.gold + (drops.diamond > 0 ? '，钻石: ' + drops.diamond : ''))
  }

  if (battleState.challengeMode === 'bossEvolution') {
    const evoCoins = 1 + (battleState.evoCount || 0)
    playerStore.addEvolutionCoin(evoCoins)
    playerStore.addDiamond(10)
    playerStore.addBossEvolution(battleState.monsterName)
    addBattleLog('🪙 获得' + evoCoins + '进化币和10钻石！')
    rewards.evolutionCoin = evoCoins
    rewards.diamond = (rewards.diamond || 0) + 10
  } else if (battleState.challengeMode !== 'endless') {
    dungeonStore.clearFloor(battleState.currentFloor)
  }

  achievementStore.checkAchievements()

  if (battleState.challengeMode === 'endless') {
    startNextEndlessWave(rewards)
  } else {
    battleResult.value = {
      type: 'victory',
      rewards,
      floor: battleState.currentFloor,
      monsterName: battleState.monsterName,
    }
  }
}

function handleDefeat() {
  battleState.inBattle = false
  battleState.canTame = false
  addBattleLog('💀 你被击败了...')

  if (battleState.challengeMode === 'endless') {
    addBattleLog('无尽模式失败！最终波数: ' + (battleState.wave || 1))
    playerStore.setEndlessWave(1)
  }

  if (battleState.challengeMode === 'endless') {
    battleResult.value = {
      type: 'defeat',
      rewards: null,
      floor: battleState.wave || 1,
      monsterName: battleState.monsterName,
    }
  } else {
    battleResult.value = {
      type: 'defeat',
      rewards: null,
      floor: battleState.currentFloor,
      monsterName: battleState.monsterName,
    }
  }
}

function handleSurrender() {
  if (!battleState.inBattle) return

  battleState.inBattle = false
  addBattleLog('你选择了投降...')
  addBattleLog('没有获得任何奖励')

  setTimeout(() => {
    emit('defeat')
  }, 1000)
}

function closeBattleResult() {
  const result = battleResult.value
  battleResult.value = null
  if (result.type === 'victory') {
    emit('victory', result.rewards)
  } else {
    emit('defeat')
  }
}

function startNextEndlessWave(lastRewards) {
  const nextWave = (battleState.wave || 1) + 1
  playerStore.setEndlessWave(nextWave)

  battleState.isDefending = false
  battleState.isPlayerTurn = true
  battleState.canTame = true
  battleState.playerBuffs = []
  battleState.monsterDebuffs = []
  battleState.buffCriticalRate = 0
  battleState.buffDefense = 0
  battleState.buffSpeed = 0
  battleState.buffAttack = 0
  battleState.buffDodgeRate = 0
  battleState.magicRegen = 0

  const playerStats = getPlayerCombatStats()
  battleState.playerHp = playerStats.maxHp
  battleState.playerMaxHp = playerStats.maxHp
  battleState.playerAtk = playerStats.attack
  battleState.playerDef = playerStats.defense
  battleState.playerAtkSpeed = playerStats.atkSpeed
  battleState.playerCritRate = playerStats.critRate
  battleState.playerMagic = playerStats.magic || 30
  battleState.playerMaxMagic = playerStats.magic || 30
  battleState.buffDodgeRate = playerStats.dodgeRate || 0
  battleState.magicRegen = playerStats.magicRegen || 0

  battleState.activePets = (petStore.activePets || [])
    .filter(pet => pet && pet.id)
    .map(pet => ({ ...pet, maxHp: pet.maxHp || pet.hp, hp: pet.hp || pet.maxHp || 0 }))

  const monster = generateEndlessMonster(nextWave)
  battleState.wave = nextWave
  battleState.currentFloor = nextWave
  battleState.monsterHp = monster.hp || monster.maxHp || 100
  battleState.monsterMaxHp = monster.maxHp || monster.hp || 100
  battleState.monsterAtk = monster.attack || 10
  battleState.monsterDef = monster.defense || 5
  battleState.monsterAtkSpeed = monster.atkSpeed || 1.0
  battleState.monsterName = monster.name || '未知怪物'
  battleState.monsterImg = monster.img || ''

  monsterAvatarSrc.value = monster.img || defaultMonsterImg

  battleState.monsterIsBoss = monster.isBoss || false
  battleState.monsterIsElite = monster.isElite || false

  battleState.inBattle = true

  addBattleLog('🎉 进入第' + nextWave + '波：' + monster.name + '出现了！')
  addBattleLog('你的回合，请选择行动！')
  scrollLogToBottom()
}

onMounted(() => {
  if (props.battleConfig) {
    initBattle()
  }
})

onUnmounted(() => {
  battleState.inBattle = false
})
</script>

<style scoped>
.battle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: battleFadeIn 0.3s ease-out;
}

@keyframes battleFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.battle-modal {
  position: relative;
  width: 94%;
  max-width: 500px;
  max-height: 95vh;
  background: linear-gradient(160deg, rgba(8, 30, 50, 0.97), rgba(3, 15, 30, 0.98));
  border-radius: 22px;
  border: 1.5px solid rgba(100, 160, 210, 0.5);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.75),
    0 0 50px rgba(70, 140, 210, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.battle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(100, 160, 210, 0.3);
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(15, 45, 65, 0.9), rgba(5, 20, 35, 0.95));
}

.battle-floor-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #c8e0f8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.battle-monster-label {
  font-size: 0.8rem;
  color: #ffd76e;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin-left: 4px;
}

.boss-tag {
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, #d44030, #a02020);
  color: #fff;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 150, 100, 0.5);
}

.elite-tag {
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, #b070d0, #7040a0);
  color: #fff;
  font-weight: 700;
  border: 1px solid rgba(200, 150, 255, 0.5);
}

.battle-close-btn {
  margin-left: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(20, 45, 70, 0.8);
  border: 1.5px solid rgba(100, 160, 210, 0.4);
  color: #a0c8e8;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.battle-close-btn:hover {
  transform: scale(1.1);
  background: rgba(40, 70, 110, 0.9);
  border-color: rgba(140, 200, 255, 0.7);
}

.battle-arena {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 12px;
  flex-shrink: 0;
}

.player-panel,
.monster-panel {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.panel-avatar-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid rgba(100, 180, 220, 0.5);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5), 0 0 12px rgba(80, 150, 200, 0.25);
  flex-shrink: 0;
}

.monster-avatar-wrap {
  border-color: rgba(220, 100, 80, 0.5) !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.5), 0 0 14px rgba(220, 80, 50, 0.3) !important;
}

.panel-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel-info {
  flex: 1;
  min-width: 0;
}

.panel-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.panel-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #e8f4ff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.monster-name {
  color: #ffba8e;
}

.panel-class {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(60, 120, 180, 0.4);
  color: #b8d8f0;
  border: 1px solid rgba(100, 160, 200, 0.3);
}

.panel-level {
  font-size: 0.6rem;
  color: #ffd76e;
  font-weight: 600;
}

.hp-bar-wrap,
.mp-bar-wrap {
  margin-bottom: 2px;
  position: relative;
}

.hp-bar-bg {
  width: 100%;
  height: 11px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(100, 160, 210, 0.25);
}

.hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3ed060, #2ea040);
  border-radius: 5px;
  transition: width 0.4s ease;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.monster-hp-bg {
  border-color: rgba(220, 80, 50, 0.3) !important;
}

.monster-hp-fill {
  background: linear-gradient(90deg, #e85040, #c03020) !important;
}

.mp-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(100, 160, 210, 0.25);
}

.mp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #5098e0, #3068b0);
  border-radius: 3px;
  transition: width 0.4s ease;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.15);
}

.hp-text,
.mp-text {
  font-size: 0.55rem;
  color: #c0d8ee;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.monster-stats {
  display: flex;
  gap: 10px;
  margin-top: 2px;
}

.monster-stat {
  font-size: 0.55rem;
  color: #e89070;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.vs-divider {
  font-size: 1.1rem;
  font-weight: 900;
  color: rgba(200, 220, 240, 0.5);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  align-self: center;
  padding: 0 2px;
  flex-shrink: 0;
}

.pet-mini-list {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pet-mini-item {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
}

.pet-mini-item.dead {
  opacity: 0.35;
}

.pet-mini-avatar {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

.pet-mini-hp-bg {
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.pet-mini-hp-fill {
  height: 100%;
  background: #3ed060;
  border-radius: 2px;
  transition: width 0.3s;
}

.pet-mini-hp-fill.low {
  background: #e85040;
}

.pet-mini-name {
  font-size: 0.5rem;
  color: #a0c4e0;
}

.battle-log {
  flex: 0 1 auto;
  min-height: 60px;
  max-height: 130px;
  overflow-y: auto;
  padding: 8px 12px;
  margin: 0 10px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 12px;
  border: 1px solid rgba(80, 140, 190, 0.25);
  font-size: 0.65rem;
  line-height: 1.5;
  color: #c8ddf0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.battle-log::-webkit-scrollbar {
  width: 4px;
}

.battle-log::-webkit-scrollbar-track {
  background: rgba(5, 20, 35, 0.6);
  border-radius: 2px;
}

.battle-log::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4090c0, #205070);
  border-radius: 2px;
}

.battle-log-line {
  padding: 1px 0;
}

.battle-log-line.log-reward {
  color: #80e890;
}

.battle-log-line.log-danger {
  color: #ff8870;
}

.battle-log-line.log-gold {
  color: #ffd76e;
  font-weight: 600;
}

.battle-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 10px 12px 14px;
  flex-shrink: 0;
}

.action-btn {
  padding: 9px 4px;
  border-radius: 12px;
  border: 1.5px solid;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(0.4);
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.action-btn:not(:disabled):active {
  transform: translateY(0);
}

.attack-btn {
  background: linear-gradient(135deg, rgba(50, 120, 60, 0.8), rgba(20, 60, 30, 0.9));
  border-color: rgba(100, 200, 120, 0.5);
  color: #c8ffd0;
}

.attack-btn:not(:disabled):hover {
  border-color: rgba(140, 240, 160, 0.7);
  background: linear-gradient(135deg, rgba(70, 150, 80, 0.85), rgba(30, 80, 40, 0.9));
}

.defend-btn {
  background: linear-gradient(135deg, rgba(40, 80, 140, 0.8), rgba(15, 40, 80, 0.9));
  border-color: rgba(100, 160, 220, 0.5);
  color: #c0ddf8;
}

.defend-btn:not(:disabled):hover {
  border-color: rgba(140, 200, 255, 0.7);
  background: linear-gradient(135deg, rgba(55, 100, 160, 0.85), rgba(20, 55, 100, 0.9));
}

.skill-btn {
  background: linear-gradient(135deg, rgba(80, 40, 130, 0.8), rgba(40, 15, 70, 0.9));
  border-color: rgba(140, 100, 210, 0.5);
  color: #d0c0f0;
}

.skill-btn:not(:disabled):hover {
  border-color: rgba(180, 140, 250, 0.7);
  background: linear-gradient(135deg, rgba(100, 55, 155, 0.85), rgba(50, 20, 85, 0.9));
}

.item-btn {
  background: linear-gradient(135deg, rgba(160, 120, 30, 0.8), rgba(80, 60, 10, 0.9));
  border-color: rgba(220, 180, 80, 0.5);
  color: #ffe8b0;
}

.item-btn:not(:disabled):hover {
  border-color: rgba(240, 200, 100, 0.7);
  background: linear-gradient(135deg, rgba(180, 140, 40, 0.85), rgba(90, 70, 15, 0.9));
}

.tame-btn {
  background: linear-gradient(135deg, rgba(100, 60, 120, 0.8), rgba(50, 25, 65, 0.9));
  border-color: rgba(160, 120, 200, 0.5);
  color: #e0c8f0;
}

.tame-btn:not(:disabled):hover {
  border-color: rgba(190, 150, 230, 0.7);
  background: linear-gradient(135deg, rgba(120, 75, 140, 0.85), rgba(60, 30, 75, 0.9));
}

.surrender-btn {
  background: linear-gradient(135deg, rgba(80, 30, 30, 0.8), rgba(40, 10, 10, 0.9));
  border-color: rgba(180, 80, 60, 0.5);
  color: #f0b8a8;
}

.surrender-btn:not(:disabled):hover {
  border-color: rgba(210, 100, 80, 0.7);
  background: linear-gradient(135deg, rgba(100, 40, 35, 0.85), rgba(50, 15, 12, 0.9));
}

.sub-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2100;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  animation: battleFadeIn 0.2s ease-out;
}

.sub-modal {
  width: 88%;
  max-width: 420px;
  max-height: 70vh;
  background: linear-gradient(160deg, rgba(10, 35, 55, 0.98), rgba(4, 18, 32, 0.98));
  border-radius: 18px;
  border: 1.5px solid rgba(100, 160, 220, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(70, 140, 210, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.25s ease-out;
}

.sub-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(100, 160, 210, 0.3);
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0f0ff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}

.sub-modal-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.7);
  border: 1.5px solid rgba(100, 160, 210, 0.4);
  color: #a0c8e8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(140, 200, 255, 0.7);
}

.sub-modal-body {
  padding: 10px 12px;
  overflow-y: auto;
  flex: 1;
}

.sub-modal-body::-webkit-scrollbar {
  width: 4px;
}

.sub-modal-body::-webkit-scrollbar-track {
  background: rgba(5, 20, 35, 0.6);
  border-radius: 2px;
}

.sub-modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4090c0, #205070);
  border-radius: 2px;
}

.sub-empty {
  text-align: center;
  color: rgba(160, 200, 220, 0.5);
  padding: 20px;
  font-size: 0.8rem;
}

.skill-select-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(20, 45, 70, 0.6);
  border: 1px solid rgba(80, 140, 200, 0.3);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-select-item:hover {
  background: rgba(50, 50, 50, 0.7);
  border-color: rgba(160, 160, 160, 0.5);
  transform: translateY(-1px);
}

.skill-select-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skill-select-item.disabled:hover {
  transform: none;
  background: rgba(20, 45, 70, 0.6);
  border-color: rgba(80, 140, 200, 0.3);
}

.skill-select-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.skill-select-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #d0e8ff;
}

.skill-select-cost {
  font-size: 0.6rem;
  color: #80b8e0;
  background: rgba(40, 80, 130, 0.5);
  padding: 2px 8px;
  border-radius: 8px;
}

.skill-select-level {
  font-size: 0.6rem;
  color: #ffd76e;
  margin-left: auto;
}

.skill-select-desc {
  font-size: 0.6rem;
  color: #90b8d0;
  line-height: 1.3;
}

.item-select-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(20, 45, 70, 0.6);
  border: 1px solid rgba(80, 140, 200, 0.3);
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-select-card:hover {
  background: rgba(50, 50, 50, 0.7);
  border-color: rgba(160, 160, 160, 0.5);
  transform: translateY(-1px);
}

.item-select-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.item-select-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
  background: rgba(20, 50, 80, 0.4);
}

.item-select-info {
  flex: 1;
  min-width: 0;
}

.item-select-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #d0e8ff;
  display: block;
}

.item-select-desc {
  font-size: 0.6rem;
  color: #90b8d0;
}

.item-select-qty {
  font-size: 0.7rem;
  font-weight: 600;
  color: #ffe8a0;
  flex-shrink: 0;
}

.battle-result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.battle-result-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  min-width: 280px;
  max-width: 90%;
  text-align: center;
  border: 2px solid rgba(100, 160, 220, 0.4);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.battle-result-header {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
}

.battle-result-header.victory {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.battle-result-header.defeat {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-bottom: 2px solid rgba(255, 107, 107, 0.3);
}

.battle-result-body {
  margin-bottom: 20px;
}

.battle-result-floor {
  color: #a0c4e8;
  font-size: 14px;
  margin-bottom: 12px;
}

.battle-result-rewards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward-item {
  color: #d0e8f0;
  font-size: 14px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.battle-result-defeat-msg {
  color: #8a9aaa;
  font-size: 14px;
  padding: 12px;
}

.battle-result-btn {
  padding: 10px 32px;
  border-radius: 8px;
  border: 1px solid rgba(100, 160, 220, 0.5);
  background: linear-gradient(135deg, #1a3a5c, #2a5a8c);
  color: #d0e8f0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.battle-result-btn:hover {
  background: linear-gradient(135deg, #2a5a8c, #3a7abc);
  border-color: rgba(140, 200, 240, 0.7);
  transform: translateY(-1px);
}
</style>
