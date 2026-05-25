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
        <span v-if="battleState.selectingTarget" class="target-hint">👆 点击敌人选择目标</span>
        <button class="battle-close-btn" @click="handleSurrender">✕</button>
      </div>

      <!-- Arena: 4 rows x 3 cols (player, VS, monster) -->
      <div class="arena-grid">
        <!-- Row 0: Player vs Monster 0 -->
        <div class="arena-row player-row">
          <img class="arena-row-avatar" :src="playerAvatar" alt="玩家" @error="onPlayerAvatarError" />
          <div class="arena-row-info">
            <div class="arena-row-name">
              <span class="row-label">{{ playerStore.nickname || '冒险者' }}</span>
              <span class="row-class">{{ playerStore.characterClass }}</span>
              <span class="row-level">Lv.{{ playerStore.level }}</span>
            </div>
            <div class="row-hp-wrap">
              <div class="row-hp-bg"><div class="row-hp-fill" :style="{ width: hpPercent + '%' }"></div></div>
              <span class="row-hp-text">{{ battleState.playerHp }}/{{ battleState.playerMaxHp }}</span>
            </div>
            <div class="row-mp-wrap">
              <div class="row-mp-bg"><div class="row-mp-fill" :style="{ width: mpPercent + '%' }"></div></div>
              <span class="row-mp-text">{{ battleState.playerMagic }}/{{ battleState.playerMaxMagic }}</span>
            </div>
          </div>
        </div>
        <div class="vs-divider">VS</div>
        <!-- Monster 0 -->
        <div v-if="battleState.monsters[0]" class="arena-row monster-row"
          :class="{ dead: battleState.monsters[0].hp <= 0, selectable: battleState.selectingTarget && battleState.monsters[0].hp > 0 }"
          @click="battleState.selectingTarget && battleState.monsters[0].hp > 0 && selectMonsterTarget(0)">
          <img class="arena-row-avatar monster-avatar" :src="getMonsterImg(0)" :alt="battleState.monsters[0].name" />
          <div class="arena-row-info">
            <span class="row-label monster-name">{{ battleState.monsters[0].name }}</span>
            <div class="row-hp-wrap">
              <div class="row-hp-bg monster-hp-bg"><div class="row-hp-fill monster-hp-fill" :style="{ width: monsterHpPercent(0) + '%' }"></div></div>
              <span class="row-hp-text">{{ battleState.monsters[0].hp }}/{{ battleState.monsters[0].maxHp }}</span>
            </div>
            <div class="monster-stats">
              <span>攻:{{ battleState.monsters[0].attack }}</span>
              <span>防:{{ battleState.monsters[0].defense }}</span>
            </div>
          </div>
        </div>
        <div v-else class="arena-row empty-slot"></div>

        <!-- Rows 1-3: Pets vs Monsters 1-3 -->
        <template v-for="i in 3" :key="'row'+i">
          <!-- Pet i -->
          <div v-if="battlePets[i-1]" class="arena-row pet-row" :class="{ dead: battlePets[i-1].hp <= 0 }">
            <img class="arena-row-avatar" :src="battlePets[i-1].img" :alt="battlePets[i-1].name" />
            <div class="arena-row-info">
              <span class="row-pet-name">{{ battlePets[i-1].name }}</span>
              <div class="row-hp-wrap">
                <div class="row-hp-bg pet-hp-bg"><div class="row-hp-fill pet-hp-fill" :class="{ low: battlePets[i-1].hp / battlePets[i-1].maxHp < 0.3 }" :style="{ width: petHpPercent(i-1) + '%' }"></div></div>
                <span class="row-hp-text">{{ battlePets[i-1].hp }}/{{ battlePets[i-1].maxHp }}</span>
              </div>
            </div>
          </div>
          <div v-else class="arena-row empty-slot"></div>
          <!-- VS + Monster i -->
          <div class="vs-divider"></div>
          <div v-if="battleState.monsters[i]" class="arena-row monster-row"
            :class="{ dead: battleState.monsters[i].hp <= 0, selectable: battleState.selectingTarget && battleState.monsters[i].hp > 0 }"
            @click="battleState.selectingTarget && battleState.monsters[i].hp > 0 && selectMonsterTarget(i)">
            <img class="arena-row-avatar monster-avatar" :src="getMonsterImg(i)" :alt="battleState.monsters[i].name" />
            <div class="arena-row-info">
              <span class="row-label monster-name">{{ battleState.monsters[i].name }}</span>
              <div class="row-hp-wrap">
                <div class="row-hp-bg monster-hp-bg"><div class="row-hp-fill monster-hp-fill" :style="{ width: monsterHpPercent(i) + '%' }"></div></div>
                <span class="row-hp-text">{{ battleState.monsters[i].hp }}/{{ battleState.monsters[i].maxHp }}</span>
              </div>
              <div class="monster-stats">
                <span>攻:{{ battleState.monsters[i].attack }}</span>
                <span>防:{{ battleState.monsters[i].defense }}</span>
              </div>
            </div>
          </div>
          <div v-else class="arena-row empty-slot"></div>
        </template>
      </div>

      <!-- Battle Log -->
      <div class="battle-log" ref="battleLogRef">
        <div v-for="(log, idx) in battleState.battleLog" :key="idx" class="battle-log-line"
          :class="{ 'log-reward': log.includes('获得'), 'log-danger': log.includes('💀'), 'log-gold': log.includes('🎉') }">{{ log }}</div>
      </div>

      <!-- Actions: 2 rows x 4 cols -->
      <div class="battle-actions">
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget" @click="playerAttack">
          <img src="/image/UI/攻击.webp" alt="攻击" class="action-icon" />
        </button>
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget" @click="playerDefend">
          <img src="/image/UI/防御.webp" alt="防御" class="action-icon" />
        </button>
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget" @click="showSkillSelect = true">
          <img src="/image/UI/技能-战斗页面.webp" alt="技能" class="action-icon" />
        </button>
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget" @click="showItemSelect = true">
          <img src="/image/UI/物品.webp" alt="物品" class="action-icon" />
        </button>
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || !battleState.canTame || battleState.selectingTarget" @click="playerTame">
          <img src="/image/UI/凌驾.webp" alt="凌驾" class="action-icon" />
        </button>
        <button class="battle-action-btn" :class="{ 'auto-active': autoBattle }" :disabled="!battleState.inBattle || battleState.selectingTarget" @click="toggleAutoBattle">
          <img src="/image/UI/自动战斗.webp" alt="自动战斗" class="action-icon" />
        </button>
        <button class="battle-action-btn" :disabled="!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget" @click="handleSurrender">
          <img src="/image/UI/投降.webp" alt="投降" class="action-icon" />
        </button>
        <div class="battle-action-btn empty-btn"></div>
      </div>

      <!-- Result overlay -->
      <div v-if="battleResult" class="battle-result-overlay">
        <div class="battle-result-modal">
          <div class="battle-result-header" :class="{ 'victory': battleResult.type === 'victory', 'defeat': battleResult.type === 'defeat' }">
            {{ battleResult.type === 'victory' ? '🎉 通关成功！' : '💀 战斗失败' }}
          </div>
          <div class="battle-result-body">
            <div v-if="battleResult.type === 'victory' && battleResult.rewards" class="battle-result-rewards">
              <div v-if="battleResult.rewards.exp" class="reward-item">✨ 经验 +{{ battleResult.rewards.exp }}</div>
              <div v-if="battleResult.rewards.gold" class="reward-item">💰 金币 +{{ battleResult.rewards.gold }}</div>
              <div v-if="battleResult.rewards.diamond" class="reward-item">💎 钻石 +{{ battleResult.rewards.diamond }}</div>
              <div v-if="battleResult.rewards.evolutionCoin" class="reward-item">🪙 进化币 +{{ battleResult.rewards.evolutionCoin }}</div>
            </div>
            <div v-if="battleResult.type === 'defeat'" class="battle-result-defeat-msg">请提升实力后再来挑战！</div>
          </div>
          <button class="battle-result-btn" @click="closeBattleResult">{{ battleResult.type === 'victory' ? '🎉 返回' : '💪 返回' }}</button>
        </div>
      </div>
    </div>

    <!-- Skill Select -->
    <div v-if="showSkillSelect" class="sub-modal-overlay" @click.self="showSkillSelect = false">
      <div class="sub-modal skill-select-modal">
        <div class="sub-modal-header"><span>选择技能</span><button class="sub-modal-close" @click="showSkillSelect = false">✕</button></div>
        <div class="sub-modal-body">
          <div v-if="battleSkills.length === 0" class="sub-empty">没有可用技能</div>
          <div v-for="skill in battleSkills" :key="skill.id" class="skill-select-item"
            :class="{ disabled: battleState.playerMagic < skill.magicCost }" @click="triggerSkill(skill)">
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

    <!-- Item Select -->
    <div v-if="showItemSelect" class="sub-modal-overlay" @click.self="showItemSelect = false">
      <div class="sub-modal item-select-modal">
        <div class="sub-modal-header"><span>选择物品</span><button class="sub-modal-close" @click="showItemSelect = false">✕</button></div>
        <div class="sub-modal-body">
          <div v-if="battleItems.length === 0" class="sub-empty">没有可用物品</div>
          <div v-for="item in battleItems" :key="item.id" class="item-select-card" @click="useItem(item)">
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
import { useRuneStore } from '@/stores/rune'
import {
  getCharacterStats, getEquipmentBonus, getTalentBonus, getTotalRuneBonus,
  calculateDamage, calculateDrops, generateEndlessMonster, generateBossEvolution,
  generateDungeonMonsters
} from '@/utils/game'
import { SKILLS, SKILL_TYPE } from '@/data/skills'
import { ITEMS } from '@/data/items'

const props = defineProps({
  battleConfig: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'victory', 'defeat'])

const playerStore = usePlayerStore()
const petStore = usePetStore()
const inventoryStore = useInventoryStore()
const dungeonStore = useDungeonStore()
const runeStore = useRuneStore()

const battleLogRef = ref(null)
const showSkillSelect = ref(false)
const showItemSelect = ref(false)
const autoBattle = ref(false)
let autoBattleTimer = null

const battleState = reactive({
  inBattle: false,
  challengeMode: '',
  floor: 0, wave: 0, evoCount: 0,
  playerHp: 0, playerMaxHp: 0,
  playerMagic: 0, playerMaxMagic: 0,
  playerAtk: 0, playerDef: 0,
  playerAtkSpeed: 0, playerCritRate: 0, playerDodgeRate: 0,
  monsters: [null, null, null, null],
  isPlayerTurn: true,
  playerDefending: false,
  selectingTarget: false,
  pendingAction: null,
  canTame: false,
  battleLog: [],
})

const petBattleState = reactive([])
const battleResult = ref(null)

// ── Computed ──
const displayFloor = computed(() => battleState.floor)
const displayWave = computed(() => battleState.wave)

const hpPercent = computed(() => {
  if (!battleState.playerMaxHp) return 0
  return Math.max(0, Math.min(100, (battleState.playerHp / battleState.playerMaxHp) * 100))
})

const mpPercent = computed(() => {
  if (!battleState.playerMaxMagic) return 0
  return Math.max(0, Math.min(100, (battleState.playerMagic / battleState.playerMaxMagic) * 100))
})

const playerAvatar = computed(() => {
  const a = playerStore.customAvatar
  if (a) return a
  const cls = playerStore.characterClass
  if (cls) return `/image/role/${cls}.webp`
  return '/image/role/狂战.webp'
})

const battlePets = computed(() => petBattleState)

const battleSkills = computed(() => {
  const cls = playerStore.characterClass
  if (!cls) return []
  return (SKILLS[cls] || []).filter(s => (playerStore.skills[s.id] || 0) > 0)
})

const battleItems = computed(() => {
  return inventoryStore.backpackItems.filter(item => {
    const d = ITEMS[item.name]
    return d && (d.type === 'heal' || d.type === 'mana' || d.type === 'buff' || d.type === 'tame')
  })
})

// ── Helpers ──
function addLog(msg) {
  battleState.battleLog.push(msg)
  if (battleState.battleLog.length > 80) battleState.battleLog.shift()
  nextTick(() => {
    const el = document.querySelector('.battle-log')
    if (el) el.scrollTop = el.scrollHeight
  })
}

function getMonsterImg(i) {
  const m = battleState.monsters[i]
  return m?.img || '/image/monster/雪绒兔.webp'
}

function monsterHpPercent(i) {
  const m = battleState.monsters[i]
  if (!m?.maxHp) return 0
  return Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100))
}

function petHpPercent(i) {
  const p = petBattleState[i]
  if (!p?.maxHp) return 0
  return Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100))
}

function getItemDesc(name) { return ITEMS[name]?.desc || '' }
function getSkillLevel(id) { return playerStore.skills[id] || 0 }
function onPlayerAvatarError(e) { e.target.src = '/image/role/狂战.webp' }
function noop() {}

// ── Init ──
function initBattle(config) {
  if (!config?.mode) return

  Object.assign(battleState, {
    inBattle: true, challengeMode: config.mode,
    floor: config.floor || 0, wave: config.wave || 0, evoCount: config.evoCount || 0,
    isPlayerTurn: true, playerDefending: false,
    selectingTarget: false, pendingAction: null,
    battleLog: [], canTame: false,
  })
  battleResult.value = null
  autoBattle.value = false
  if (autoBattleTimer) { clearTimeout(autoBattleTimer); autoBattleTimer = null }

  const stats = getCharacterStats(
    playerStore.characterClass, playerStore.level,
    getEquipmentBonus(inventoryStore.equippedItems),
    getTotalRuneBonus(runeStore.activeRunes),
    getTalentBonus(playerStore.talents, playerStore.characterClass)
  )
  battleState.playerHp = stats.maxHp
  battleState.playerMaxHp = stats.maxHp
  battleState.playerMagic = stats.magic || 0
  battleState.playerMaxMagic = stats.magic || 0
  battleState.playerAtk = stats.attack
  battleState.playerDef = stats.defense
  battleState.playerAtkSpeed = stats.atkSpeed
  battleState.playerCritRate = stats.critRate
  battleState.playerCritDamage = stats.critDamage || 1.5

  petBattleState.length = 0
  ;(petStore.activePets || [null, null, null]).forEach(p => {
    if (p) {
      petBattleState.push({
        id: p.id, name: p.name,
        img: p.img || '/image/monster/雪绒兔.webp',
        hp: p.hp || 50, maxHp: p.hp || 50, atk: p.atk || 10,
      })
    } else petBattleState.push(null)
  })

  battleState.monsters = buildMonstersFromConfig(config)

  const names = battleState.monsters.filter(m => m).map(m => m.name).join('、')
  if (config.mode === 'dungeon') addLog(`⚔️ 地宫第${config.floor}层！遭遇：${names}`)
  else if (config.mode === 'endless') addLog(`⚔️ 无尽第${config.wave}波！遭遇：${names}`)
  else if (config.mode === 'bossEvolution') addLog(`👑 BOSS超进化第${config.evoCount}次！`)
  else if (config.mode === 'pvp') addLog(`⚔️ PVP对战 ${battleState.monsters[0]?.name}`)
  else if (config.mode === 'mist-island') addLog(`🌫️ 迷雾岛！${battleState.monsters[0]?.name}出现！`)
}

function buildMonstersFromConfig(config) {
  const m = config.mode
  if (m === 'dungeon') return generateDungeonMonsters(config.floor)

  if (m === 'endless') {
    const w = config.wave || 1
    const count = Math.min(2 + Math.floor(w / 5), 4)
    const arr = []
    for (let i = 0; i < count; i++) {
      const gm = generateEndlessMonster(w + i)
      if (gm) arr.push({ name: gm.name, img: gm.img, hp: gm.hp, maxHp: gm.hp, attack: gm.attack, defense: gm.defense, atkSpeed: gm.atkSpeed, moveSpeed: gm.moveSpeed, isBoss: false, isElite: gm.isElite || false })
    }
    while (arr.length < 4) arr.push(null)
    return arr
  }

  if (m === 'bossEvolution') {
    const b = config.boss
    const evo = generateBossEvolution(b, config.evoCount || 1)
    return [{ name: evo.name, img: evo.img || `/image/monster/${b.img}`, hp: evo.hp, maxHp: evo.hp, attack: evo.attack, defense: evo.defense, atkSpeed: evo.atkSpeed || 1, moveSpeed: b.moveSpeed || 3, isBoss: true, isElite: false }, null, null, null]
  }

  if (m === 'pvp') {
    const o = config.opponent
    return [{ name: o.name, img: `/image/role/${o.characterClass || '狂战'}.webp`, hp: o.currentHp || o.maxHp, maxHp: o.maxHp, attack: o.attack, defense: o.defense, atkSpeed: o.atkSpeed || 1, moveSpeed: 3, isBoss: false, isElite: false, characterClass: o.characterClass, magic: o.magic || 0, maxMagic: o.magic || 0 }, null, null, null]
  }

  if (m === 'mist-island') {
    const mi = config.monster
    return [{ name: mi.name, img: mi.img, hp: mi.hp, maxHp: mi.maxHp || mi.hp, attack: mi.attack, defense: mi.defense, atkSpeed: mi.atkSpeed || 1, moveSpeed: mi.moveSpeed || 3, isBoss: mi.isBoss || false, isElite: mi.isElite || false }, null, null, null]
  }

  return [null, null, null, null]
}

// ── Player Actions ──
function playerAttack() {
  if (!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget) return
  battleState.selectingTarget = true
  battleState.pendingAction = { type: 'attack' }
  addLog('👆 请选择攻击目标（点击敌人）')
}

function playerDefend() {
  if (!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget) return
  battleState.playerDefending = true
  addLog('🛡️ 进入防御姿态，受到的伤害减半！')
  endPlayerTurn()
}

function isAoESkill(skill) {
  const desc = skill.description || ''
  if (desc.includes('所有') || desc.includes('周围')) return true
  return false
}

function triggerSkill(skill) {
  if (!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget) return
  if (battleState.playerMagic < skill.magicCost) { addLog('🔮 魔力不足！'); return }
  showSkillSelect.value = false

  // 非攻击技能：立即释放
  if (skill.type === 'heal' || skill.type === 'buff' || skill.type === 'defense' || skill.type === 'special') {
    executeSkillImmediate(skill)
    return
  }

  // AoE 群伤技能：立即释放，攻击所有敌人
  if (skill.type === 'attack' && isAoESkill(skill)) {
    executeSkillAoE(skill)
    return
  }

  // 多目标技能（如多重射击 targets:3）：立即释放
  if (skill.type === 'attack' && skill.targets && skill.targets > 1) {
    executeSkillAoE(skill)
    return
  }

  // 单目标技能（含 hits 连击）：需要选择目标
  battleState.selectingTarget = true
  battleState.pendingAction = { type: 'skill', skill }
  addLog(`👆 请选择【${skill.name}】的目标（点击敌人）`)
}

function executeSkillImmediate(skill) {
  const lv = playerStore.skills[skill.id] || 1
  const val = (skill.baseDamage || 0) + (skill.levelBonus || 0) * (lv - 1)
  battleState.playerMagic -= skill.magicCost

  if (skill.type === 'heal') {
    const heal = Math.floor(val * (skill.baseEffect || 0.5))
    battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + heal)
    addLog(`💚 使用【${skill.name}】，恢复${heal}点生命！`)

  } else if (skill.type === 'buff') {
    const eff = skill.baseEffect || 0
    switch (skill.effectType) {
      case 'defense_up':
        battleState.playerDef = Math.floor(battleState.playerDef * (1 + eff / 100))
        addLog(`🛡️ 使用【${skill.name}】，防御力提升${eff}%！`)
        break
      case 'attack_up':
        battleState.playerAtk = Math.floor(battleState.playerAtk * (1 + eff / 100))
        addLog(`⚔️ 使用【${skill.name}】，攻击力提升${eff}%！`)
        break
      case 'party_attack_up':
        battleState.playerAtk = Math.floor(battleState.playerAtk * (1 + eff / 100))
        petBattleState.forEach(p => {
          if (p && p.hp > 0) p.atk = Math.floor(p.atk * (1 + eff / 100))
        })
        addLog(`⚔️ 使用【${skill.name}】，全队攻击力提升${eff}%！`)
        break
      case 'evasion_up':
        battleState.playerDodgeRate = (battleState.playerDodgeRate || 0) + eff
        addLog(`💨 使用【${skill.name}】，闪避率+${eff}%！`)
        break
      case 'crit_rate_up':
        battleState.playerCritRate = (battleState.playerCritRate || 0) + eff
        addLog(`💥 使用【${skill.name}】，暴击率+${eff}%！`)
        break
      case 'damage_reduction':
        addLog(`🛡️ 使用【${skill.name}】，受到伤害减少${eff}%！`)
        break
      case 'gold_bonus':
        addLog(`💰 使用【${skill.name}】，战斗后金币+${eff}%！`)
        break
      default:
        addLog(`⬆️ 使用【${skill.name}】，获得增益效果！`)
    }

  } else if (skill.type === 'defense') {
    battleState.playerDefending = true
    addLog(`🛡️ 使用【${skill.name}】，获得护盾！`)
  } else {
    addLog(`✨ 使用【${skill.name}】！`)
  }
  endPlayerTurn()
}

function useItem(item) {
  if (!battleState.isPlayerTurn || !battleState.inBattle) return
  showItemSelect.value = false
  const d = ITEMS[item.name]
  if (!d) return
  if (d.type === 'heal') {
    const heal = Math.floor(battleState.playerMaxHp * (d.effect || 0.1))
    battleState.playerHp = Math.min(battleState.playerMaxHp, battleState.playerHp + heal)
    addLog(`🧪 使用【${item.name}】，恢复${heal}点生命！`)
  } else if (d.type === 'mana') {
    const mana = Math.floor(battleState.playerMaxMagic * (d.effect || 0.1))
    battleState.playerMagic = Math.min(battleState.playerMaxMagic, battleState.playerMagic + mana)
    addLog(`🫙 使用【${item.name}】，恢复${mana}点魔力！`)
  } else if (d.type === 'buff') {
    addLog(`📜 使用【${item.name}】，${d.desc || '获得增益'}！`)
  } else if (d.type === 'tame') {
    const tameType = d.effect?.type || 'normal'
    const eligible = battleState.monsters.map((m, i) => ({ m, i })).filter(({ m: x }) => {
      if (!x || x.hp <= 0) return false
      if (tameType === 'all') return true
      if (tameType === 'elite') return x.isElite
      return !x.isBoss && !x.isElite
    })
    if (eligible.length === 0) {
      addLog('⚠️ 没有符合条件的目标！')
      return
    }
    if (eligible.length === 1) {
      executeTameOnMonster(item, eligible[0].i)
      return
    }
    battleState.selectingTarget = true
    battleState.pendingAction = { type: 'tameItem', item }
    addLog(`👆 请选择【${item.name}】的驯服目标（点击敌人）`)
    return
  }
  inventoryStore.removeItem(item.slot, 1)
  endPlayerTurn()
}

function playerTame() {
  if (!battleState.isPlayerTurn || !battleState.inBattle || !battleState.canTame) return
  const ti = battleState.monsters.findIndex(m => m && m.hp > 0 && !m.isBoss && !m.isElite)
  if (ti === -1) { addLog('没有可驯服的怪物！'); return }
  const m = battleState.monsters[ti]
  const hpRatio = m.hp / m.maxHp
  const chance = 0.15 + (1 - hpRatio) * 0.45
  if (Math.random() < chance) {
    addLog(`🎉 成功驯服了【${m.name}】！（成功率${Math.floor(chance * 100)}%）`)
    petStore.addPet({ name: m.name, img: m.img, hp: m.maxHp, atk: m.attack, rarity: 'common' })
    m.hp = 0
    playerStore.setHasTamed(true)
  } else {
    addLog(`❌ 驯服【${m.name}】失败...（成功率${Math.floor(chance * 100)}%）`)
  }
  endPlayerTurn()
}

function executeTameOnMonster(item, index) {
  const m = battleState.monsters[index]
  if (!m || m.hp <= 0) return
  const d = ITEMS[item.name]
  const tameType = d.effect?.type || 'normal'
  const rarityMap = { all: 'legendary', elite: 'epic', normal: 'common' }
  addLog(`📜 使用【${item.name}】成功驯服了【${m.name}】！`)
  petStore.addPet({ name: m.name, img: m.img, hp: m.maxHp, atk: m.attack, rarity: rarityMap[tameType] || 'common' })
  m.hp = 0
  playerStore.setHasTamed(true)
  inventoryStore.removeItem(item.slot, 1)
  endPlayerTurn()
}

// ── Target Selection & Battle Flow ──
function selectMonsterTarget(index) {
  if (!battleState.selectingTarget) return
  const m = battleState.monsters[index]
  if (!m || m.hp <= 0) return
  const pa = battleState.pendingAction
  battleState.selectingTarget = false
  battleState.pendingAction = null
  if (pa?.type === 'attack') executeAttackOnMonster(index)
  else if (pa?.type === 'skill') executeSkillOnMonster(pa.skill, index)
  else if (pa?.type === 'tameItem') executeTameOnMonster(pa.item, index)
}

function executeAttackOnMonster(mi) {
  const m = battleState.monsters[mi]
  if (!m) return
  const isCrit = Math.random() < (battleState.playerCritRate || 0.05)
  let dmg = calculateDamage(battleState.playerAtk, m.defense)
  if (isCrit) { dmg = Math.floor(dmg * (battleState.playerCritDamage || 1.5)); playerStore.recordCrit() }
  m.hp = Math.max(0, m.hp - dmg)
  addLog(`⚔️ 攻击【${m.name}】，造成${dmg}点伤害！${isCrit ? '💥暴击！' : ''}`)
  if (m.hp <= 0) addLog(`💀 击败了【${m.name}】！`)
  endPlayerTurn()
}

function executeSkillOnMonster(skill, mi) {
  const m = battleState.monsters[mi]
  if (!m) return
  const lv = playerStore.skills[skill.id] || 1
  const base = (skill.baseDamage || 0) + (skill.levelBonus || 0) * (lv - 1)
  const hits = skill.hits || 1
  battleState.playerMagic -= skill.magicCost

  let totalDmg = 0
  let anyCrit = false
  for (let h = 0; h < hits; h++) {
    if (m.hp <= 0) break
    const isCrit = Math.random() < (battleState.playerCritRate || 0.05)
    let dmg = Math.max(1, Math.floor(base * (1 - m.defense * 0.002)))
    if (isCrit) { dmg = Math.floor(dmg * (battleState.playerCritDamage || 1.5)); anyCrit = true; playerStore.recordCrit() }
    m.hp = Math.max(0, m.hp - dmg)
    totalDmg += dmg
  }

  const hitText = hits > 1 ? `（${hits}连击）` : ''
  addLog(`✨【${skill.name}】${hitText}→【${m.name}】，造成${totalDmg}点伤害！${anyCrit ? '💥暴击！' : ''}`)
  if (m.hp <= 0) addLog(`💀 击败了【${m.name}】！`)
  endPlayerTurn()
}

// ── AoE Skill ──
function executeSkillAoE(skill) {
  const lv = playerStore.skills[skill.id] || 1
  const base = (skill.baseDamage || 0) + (skill.levelBonus || 0) * (lv - 1)
  const hits = skill.hits || 1
  const maxTargets = skill.targets || 999
  battleState.playerMagic -= skill.magicCost

  const alive = battleState.monsters.map((m, i) => ({ m, i })).filter(({ m: x }) => x && x.hp > 0)
  if (alive.length === 0) { addLog('⚠️ 没有可攻击的目标！'); return }

  // 确定攻击目标列表
  let targetList
  if (skill.targets && skill.targets > 1) {
    // 多重射击等：随机选择 N 个目标
    const shuffled = [...alive].sort(() => Math.random() - 0.5)
    targetList = shuffled.slice(0, Math.min(skill.targets, shuffled.length))
  } else {
    // 暴风雪/旋风斩等：攻击全部敌人
    targetList = alive
  }

  let totalDmg = 0
  let anyCrit = false
  targetList.forEach(({ m }) => {
    for (let h = 0; h < hits; h++) {
      if (m.hp <= 0) break
      const isCrit = Math.random() < (battleState.playerCritRate || 0.05)
      let dmg = Math.max(1, Math.floor(base * (1 - m.defense * 0.002)))
      if (isCrit) { dmg = Math.floor(dmg * (battleState.playerCritDamage || 1.5)); anyCrit = true; playerStore.recordCrit() }
      m.hp = Math.max(0, m.hp - dmg)
      totalDmg += dmg
    }
    if (m.hp <= 0) addLog(`💀 击败了【${m.name}】！`)
  })

  const names = targetList.map(({ m }) => m.name).join('、')
  const hitText = hits > 1 ? `（${hits}连击）` : ''
  addLog(`✨【${skill.name}】${hitText}→ ${names}，造成${totalDmg}点总伤害！${anyCrit ? '💥暴击！' : ''}`)

  endPlayerTurn()
}

function petAttack(pet, pi) {
  if (!pet || pet.hp <= 0) return
  const alive = battleState.monsters.map((m, i) => ({ m, i })).filter(({ m: x }) => x && x.hp > 0)
  if (!alive.length) return
  const { m: target } = alive[Math.floor(Math.random() * alive.length)]
  const isCrit = Math.random() < 0.1
  let dmg = calculateDamage(pet.atk, target.defense)
  if (isCrit) dmg *= 2
  target.hp = Math.max(0, target.hp - dmg)
  addLog(`🐾【${pet.name}】→【${target.name}】，造成${dmg}点伤害！${isCrit ? '💥暴击！' : ''}`)
  if (target.hp <= 0) addLog(`💀 ${pet.name}击败了【${target.name}】！`)
}

function endPlayerTurn() {
  battleState.isPlayerTurn = false
  if (checkBattleEnd()) return
  setTimeout(() => {
    petBattleState.forEach((p, i) => { if (p && p.hp > 0) petAttack(p, i) })
    if (checkBattleEnd()) return
    setTimeout(() => monsterTurn(), 500)
  }, 400)
}

function monsterTurn() {
  if (!battleState.inBattle) return
  // 收集所有存活盟友
  const allies = [{ type: 'player' }]
  petBattleState.forEach((p, i) => {
    if (p && p.hp > 0) allies.push({ type: 'pet', pet: p, index: i })
  })

  battleState.monsters.forEach(m => {
    if (!m || m.hp <= 0) return
    // 随机选取一个目标
    const target = allies[Math.floor(Math.random() * allies.length)]
    const isCrit = Math.random() < 0.08
    let dmg = calculateDamage(m.attack, target.type === 'player' ? battleState.playerDef : 0)
    if (target.type === 'player' && battleState.playerDefending) dmg = Math.floor(dmg * 0.5)
    if (isCrit) dmg *= 2

    if (target.type === 'player') {
      battleState.playerHp = Math.max(0, battleState.playerHp - dmg)
      addLog(`👹【${m.name}】攻击了你，造成${dmg}点伤害！${isCrit ? '💥暴击！' : ''}`)
    } else {
      target.pet.hp = Math.max(0, target.pet.hp - dmg)
      addLog(`👹【${m.name}】攻击了宠物【${target.pet.name}】，造成${dmg}点伤害！${isCrit ? '💥暴击！' : ''}`)
      if (target.pet.hp <= 0) addLog(`💀 宠物【${target.pet.name}】阵亡了！`)
    }
  })
  battleState.playerDefending = false
  if (checkBattleEnd()) return
  battleState.isPlayerTurn = true
  if (autoBattle.value && battleState.inBattle) scheduleAutoBattle()
}

function checkBattleEnd() {
  if (battleState.monsters.every(m => !m || m.hp <= 0)) { handleVictory(); return true }
  if (battleState.playerHp <= 0) { handleDefeat(); return true }
  return false
}

function handleVictory() {
  battleState.inBattle = false
  autoBattle.value = false
  if (autoBattleTimer) { clearTimeout(autoBattleTimer); autoBattleTimer = null }
  const cfg = props.battleConfig
  let rewards = { exp: 0, gold: 0, diamond: 0, evolutionCoin: 0 }
  if (cfg.mode === 'dungeon') {
    battleState.monsters.forEach(m => {
      if (m) {
        const d = calculateDrops(cfg.floor, m.isBoss, m.isElite)
        rewards.exp += d.exp; rewards.gold += d.gold; rewards.diamond += d.diamond
      }
    })
    dungeonStore.clearFloor(cfg.floor)
    playerStore.recordBattleWin()
  } else if (cfg.mode === 'endless') {
    battleState.monsters.forEach(m => {
      if (m) {
        rewards.exp += Math.floor((m.maxHp || 100) * 0.1)
        rewards.gold += Math.floor((m.maxHp || 100) * 0.05)
      }
    })
    playerStore.setEndlessWave(cfg.wave + 1)
    playerStore.recordBattleWin()
  } else if (cfg.mode === 'bossEvolution') {
    rewards = { exp: 500, gold: 1000, diamond: 10, evolutionCoin: 5 }
    const bn = battleState.monsters[0]?.name
    if (bn) playerStore.addBossEvolution(bn)
  } else if (cfg.mode === 'pvp') {
    rewards = { exp: 200, gold: 300, diamond: 0, evolutionCoin: 0 }
  } else if (cfg.mode === 'mist-island') {
    rewards = { exp: 100, gold: 200, diamond: 0, evolutionCoin: 0 }
  }
  if (rewards.exp > 0) playerStore.addExp(rewards.exp)
  if (rewards.gold > 0) playerStore.addGold(rewards.gold)
  if (rewards.diamond > 0) playerStore.addDiamond(rewards.diamond)
  if (rewards.evolutionCoin > 0) playerStore.addEvolutionCoin(rewards.evolutionCoin)
  addLog('🎉 战斗胜利！')
  if (rewards.exp > 0) addLog(`✨ 经验 +${rewards.exp}`)
  if (rewards.gold > 0) addLog(`💰 金币 +${rewards.gold}`)
  if (rewards.diamond > 0) addLog(`💎 钻石 +${rewards.diamond}`)
  if (rewards.evolutionCoin > 0) addLog(`🪙 进化币 +${rewards.evolutionCoin}`)
  battleResult.value = { type: 'victory', rewards }
}

function handleDefeat() {
  battleState.inBattle = false
  autoBattle.value = false
  if (autoBattleTimer) { clearTimeout(autoBattleTimer); autoBattleTimer = null }
  addLog('💀 战斗失败...')
  battleResult.value = { type: 'defeat' }
  emit('defeat')
}

function handleSurrender() {
  if (!battleState.isPlayerTurn || !battleState.inBattle || battleState.selectingTarget) return
  battleState.inBattle = false
  autoBattle.value = false
  if (autoBattleTimer) { clearTimeout(autoBattleTimer); autoBattleTimer = null }
  battleState.selectingTarget = false
  battleState.pendingAction = null
  addLog('🏳️ 你选择了投降...')
  battleResult.value = { type: 'defeat' }
  emit('defeat')
}

// ── Auto Battle ──
function toggleAutoBattle() {
  if (!battleState.inBattle || battleState.selectingTarget) return
  autoBattle.value = !autoBattle.value
  addLog(autoBattle.value ? '🤖 开启自动战斗' : '🤖 关闭自动战斗')
  if (autoBattle.value && battleState.isPlayerTurn) scheduleAutoBattle()
  else if (!autoBattle.value && autoBattleTimer) { clearTimeout(autoBattleTimer); autoBattleTimer = null }
}

function scheduleAutoBattle() {
  if (autoBattleTimer) clearTimeout(autoBattleTimer)
  autoBattleTimer = setTimeout(() => {
    if (!autoBattle.value || !battleState.inBattle || !battleState.isPlayerTurn || battleState.selectingTarget) return
    const alive = battleState.monsters.map((m, i) => ({ m, i })).filter(({ m: x }) => x && x.hp > 0)
    if (alive.length) {
      const t = alive[Math.floor(Math.random() * alive.length)]
      addLog('🤖 [自动] 普攻')
      executeAttackOnMonster(t.i)
    }
  }, 800)
}

// ── Close ──
function closeBattleResult() {
  if (battleResult.value?.type === 'victory') emit('victory', battleResult.value.rewards)
  battleResult.value = null
  emit('close')
}

// ── ESC handler ──
function onKeyDown(e) {
  if (e.key === 'Escape' && battleState.selectingTarget) {
    battleState.selectingTarget = false
    battleState.pendingAction = null
    addLog('↩️ 取消了目标选择')
  }
}

// ── Watch & Lifecycle ──
watch(() => props.battleConfig, (cfg) => {
  if (cfg?.mode) nextTick(() => initBattle(cfg))
}, { immediate: true, deep: true })

watch(() => battleState.monsters.map(m => m?.hp), () => {
  const hasTameable = battleState.monsters.some(m => m && m.hp > 0 && !m.isBoss && !m.isElite)
  battleState.canTame = hasTameable && !['pvp', 'bossEvolution'].includes(battleState.challengeMode)
}, { deep: true, immediate: true })

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (autoBattleTimer) clearTimeout(autoBattleTimer)
})
</script>

<style scoped>
.battle-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battle-modal {
  width: 92%;
  max-width: 560px;
  height: 85vh;
  background: linear-gradient(180deg, #1e1e28, #12121a);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ── Header ── */
.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(120, 180, 220, 0.25);
  flex-shrink: 0;
  background: rgba(10, 20, 35, 0.6);
}

.battle-floor-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e0e8f0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.target-hint {
  font-size: 0.78rem;
  color: #ffcc44;
  animation: pulse 0.8s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.battle-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(40, 50, 60, 0.8);
  border: 1px solid rgba(120, 140, 160, 0.3);
  color: #a0b0c0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.battle-close-btn:hover {
  background: rgba(60, 70, 80, 0.9);
  color: #fff;
}

/* ── Arena Grid ── */
.arena-grid {
  display: grid;
  grid-template-columns: 1fr 32px 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 3px 6px;
  padding: 8px 10px;
  flex-shrink: 0;
}

.arena-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 10px;
  min-height: 52px;
  background: rgba(20, 30, 45, 0.7);
  border: 1px solid rgba(100, 140, 180, 0.2);
}

.arena-row.empty-slot {
  background: rgba(10, 15, 25, 0.4);
  border: 1px dashed rgba(60, 80, 100, 0.15);
  min-height: 52px;
}

.arena-row-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(5, 10, 20, 0.6);
  border: 1px solid rgba(120, 160, 200, 0.3);
}

.monster-avatar {
  border-color: rgba(200, 120, 80, 0.4);
}

.arena-row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.72rem;
}

.arena-row-name {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.row-label {
  color: #e0e8f0;
  font-weight: 600;
  font-size: 0.75rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.row-class {
  color: #88b8d8;
  font-size: 0.65rem;
}

.row-level {
  color: #ffcc66;
  font-size: 0.65rem;
}

.row-pet-name {
  color: #90e890;
  font-weight: 600;
  font-size: 0.72rem;
}

.monster-name {
  color: #f09070;
}

.row-hp-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-hp-bg {
  flex: 1;
  height: 8px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}

.row-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a4, #2a2);
  transition: width 0.3s;
  border-radius: 3px;
}

.row-hp-fill.low {
  background: linear-gradient(90deg, #c44, #a22);
}

.monster-hp-bg { border-color: rgba(200,100,60,0.3); }
.monster-hp-fill { background: linear-gradient(90deg, #e84, #c52); }
.pet-hp-bg { border-color: rgba(80,180,80,0.3); }
.pet-hp-fill { background: linear-gradient(90deg, #6c6, #4a4); }

.row-hp-text {
  font-size: 0.6rem;
  color: #c0d0e0;
  white-space: nowrap;
  min-width: 44px;
  text-align: right;
}

.row-mp-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-mp-bg {
  flex: 1;
  height: 6px;
  background: rgba(0,0,0,0.5);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}

.row-mp-fill {
  height: 100%;
  background: linear-gradient(90deg, #48d, #26a);
  transition: width 0.3s;
  border-radius: 2px;
}

.row-mp-text {
  font-size: 0.55rem;
  color: #a0c0e0;
  white-space: nowrap;
  min-width: 36px;
  text-align: right;
}

.monster-stats {
  display: flex;
  gap: 8px;
  font-size: 0.6rem;
  color: #c09070;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(200,180,150,0.5);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 2px;
}

/* ── Selectable ── */
.monster-row.selectable {
  cursor: pointer;
  border-color: rgba(255, 200, 50, 0.7) !important;
  box-shadow: 0 0 10px rgba(255, 180, 30, 0.35);
  animation: selectPulse 0.6s infinite alternate;
}

@keyframes selectPulse {
  from { box-shadow: 0 0 6px rgba(255, 180, 30, 0.2); }
  to { box-shadow: 0 0 14px rgba(255, 200, 50, 0.5); }
}

.arena-row.dead {
  opacity: 0.4;
  filter: grayscale(0.6);
}

/* ── Battle Log ── */
.battle-log {
  height: 110px;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 12px;
  margin: 0 10px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 10px;
  border: 1px solid rgba(100, 140, 180, 0.15);
  flex-shrink: 0;
}

.battle-log::-webkit-scrollbar { width: 4px; }
.battle-log::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 2px; }
.battle-log::-webkit-scrollbar-thumb { background: rgba(100,140,180,0.4); border-radius: 2px; }

.battle-log-line {
  font-size: 0.68rem;
  color: #c0d0e0;
  line-height: 1.5;
  padding: 1px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.battle-log-line.log-reward { color: #ffcc66; }
.battle-log-line.log-danger { color: #ff6655; }
.battle-log-line.log-gold { color: #ffdd44; }

/* ── Actions ── */
.battle-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px 12px;
  flex-shrink: 0;
}

.battle-action-btn {
  aspect-ratio: 1 / 1;
  max-height: 52px;
  border-radius: 12px;
  border: 2px solid rgba(120, 160, 200, 0.3);
  background: rgba(15, 30, 50, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all 0.2s;
  overflow: hidden;
}

.battle-action-btn:hover:not(:disabled) {
  border-color: rgba(160, 200, 240, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(0,0,0,0.3);
}

.battle-action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.battle-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.action-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.battle-action-btn.auto-active {
  border-color: rgba(255, 200, 50, 0.8) !important;
  box-shadow: 0 0 12px rgba(255, 180, 30, 0.4);
  background: rgba(40, 30, 10, 0.8);
}

.empty-btn {
  visibility: hidden;
  pointer-events: none;
}

/* ── Result Overlay ── */
.battle-result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
}

.battle-result-modal {
  width: 260px;
  max-width: 90%;
  background: linear-gradient(180deg, #2a2a35, #1a1a25);
  border: 1px solid rgba(180, 180, 195, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.battle-result-header {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 8px 0;
}

.battle-result-header.victory { color: #ffd76e; }
.battle-result-header.defeat { color: #ff6655; }

.battle-result-body { margin-bottom: 14px; }

.battle-result-rewards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reward-item {
  font-size: 0.85rem;
  color: #e0d8c0;
  padding: 4px 0;
}

.battle-result-defeat-msg {
  font-size: 0.85rem;
  color: #c0a0a0;
}

.battle-result-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #3a7abe, #1d4a6e);
  border: 1px solid rgba(140, 210, 255, 0.5);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.battle-result-btn:hover {
  background: linear-gradient(135deg, #4a8ace, #2d5a7e);
}

/* ── Sub-modals (Skill / Item) ── */
.sub-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  border-radius: 20px;
}

.sub-modal {
  width: 85%;
  max-width: 360px;
  max-height: 70%;
  background: linear-gradient(180deg, #252530, #181820);
  border: 1px solid rgba(140, 160, 180, 0.3);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sub-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(120, 160, 200, 0.2);
  color: #e0e8f0;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.sub-modal-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(40, 50, 60, 0.8);
  border: 1px solid rgba(120, 140, 160, 0.3);
  color: #a0b0c0;
  cursor: pointer;
}

.sub-modal-body {
  padding: 10px 14px;
  overflow-y: auto;
  flex: 1;
  max-height: 260px;
}

.sub-empty {
  text-align: center;
  color: rgba(180, 200, 220, 0.5);
  padding: 20px 0;
  font-size: 0.85rem;
}

.skill-select-item {
  padding: 10px 12px;
  background: rgba(15, 30, 50, 0.6);
  border: 1px solid rgba(100, 150, 200, 0.2);
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.skill-select-item:hover:not(.disabled) {
  border-color: rgba(140, 190, 240, 0.5);
  background: rgba(20, 45, 70, 0.8);
}

.skill-select-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skill-select-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.skill-select-name { color: #e0e8f0; font-weight: 600; font-size: 0.82rem; }
.skill-select-cost { color: #88b8ff; font-size: 0.7rem; }
.skill-select-level { color: #b0c0d0; font-size: 0.65rem; margin-left: auto; }
.skill-select-desc { color: #a0b8c8; font-size: 0.7rem; }

.item-select-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(15, 30, 50, 0.6);
  border: 1px solid rgba(100, 150, 200, 0.2);
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.item-select-card:hover {
  border-color: rgba(140, 190, 240, 0.5);
  background: rgba(20, 45, 70, 0.8);
}

.item-select-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
}

.item-select-icon { font-size: 1.4rem; }
.item-select-info { flex: 1; min-width: 0; }
.item-select-name { color: #e0e8f0; font-size: 0.8rem; font-weight: 600; display: block; }
.item-select-desc { color: #a0b8c8; font-size: 0.65rem; display: block; }
.item-select-qty { color: #c0d0e0; font-size: 0.75rem; font-weight: 600; }
</style>
