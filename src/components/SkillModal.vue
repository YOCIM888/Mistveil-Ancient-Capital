<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">⚔️ 技能面板</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div v-if="!playerStore.characterClass" class="empty-hint">
        请先选择职业
      </div>

      <div v-else class="skill-list">
        <div
          v-for="skill in classSkills"
          :key="skill.id"
          class="skill-card"
          :class="{ 'max-level': skillLevel(skill.id) >= skill.maxLevel }"
        >
          <div class="skill-header">
            <span class="skill-icon">{{ skillIcon(skill) }}</span>
            <div class="skill-title">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-level">
                Lv.{{ skillLevel(skill.id) }}<template v-if="skill.maxLevel"> / {{ skill.maxLevel }}</template>
              </span>
            </div>
          </div>

          <p class="skill-desc">{{ skill.description }}</p>

          <div class="skill-info">
            <span v-if="skill.baseDamage > 0" class="info-tag damage-tag">
              ⚔️ {{ currentDamage(skill) }}
            </span>
            <span v-if="skill.hits" class="info-tag hits-tag">
              ✦ {{ skill.hits }} 连击
            </span>
            <span v-if="skill.targets" class="info-tag targets-tag">
              🎯 {{ skill.targets }} 目标
            </span>
            <span v-if="skill.baseEffect && skill.effectType" class="info-tag effect-tag">
              {{ effectLabel(skill) }}
            </span>
            <span class="info-tag mana-tag">
              💧 {{ skill.magicCost }} 魔力
            </span>
          </div>

          <div class="skill-next">
            <template v-if="skillLevel(skill.id) < skill.maxLevel">
              <p class="next-preview">
                <template v-if="skill.baseDamage > 0">
                  下一级伤害：{{ nextDamage(skill) }}
                </template>
                <template v-if="skill.baseEffect && skill.effectType">
                  {{ nextEffectLabel(skill) }}
                </template>
              </p>
            </template>
            <template v-else>
              <p class="max-label">已达到最高等级</p>
            </template>
          </div>

          <button
            v-if="skillLevel(skill.id) < skill.maxLevel"
            class="upgrade-btn"
            :class="{ disabled: !canUpgrade(skill.id) }"
            :disabled="!canUpgrade(skill.id)"
            @click="handleUpgrade(skill.id)"
          >
            <span class="upgrade-text">升级</span>
            <span class="upgrade-cost">
              <span v-if="upgradeCostCurrency(skill.id) === 'gold'" class="cost-icon">💰</span>
              <span v-else class="cost-icon">🪙</span>
              {{ upgradeCost(skill.id) }}
            </span>
          </button>
        </div>
      </div>

      <div class="currency-bar">
        <div class="currency-item">
          <span class="currency-icon">💰</span>
          <span class="currency-value">{{ playerStore.gold }}</span>
        </div>
        <div class="currency-item">
          <span class="currency-icon">💎</span>
          <span class="currency-value">{{ playerStore.diamond }}</span>
        </div>
        <div class="currency-item">
          <span class="currency-icon">🪙</span>
          <span class="currency-value">{{ playerStore.evolutionCoin }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { SKILLS, SKILL_UPGRADE_COSTS } from '@/data/skills'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const playerStore = usePlayerStore()

const classSkills = computed(() => {
  if (!playerStore.characterClass) return []
  return SKILLS[playerStore.characterClass] || []
})

function skillLevel(skillId) {
  return playerStore.skills[skillId] || 0
}

function skillIcon(skill) {
  const map = {
    attack: '⚔️',
    defense: '🛡️',
    buff: '✨',
    debuff: '💫',
    heal: '💚',
    special: '🔮'
  }
  return map[skill.type] || '❓'
}

function currentDamage(skill) {
  const lv = skillLevel(skill.id)
  if (lv <= 0) return skill.baseDamage
  return skill.baseDamage + (lv - 1) * (skill.levelBonus || 0)
}

function nextDamage(skill) {
  const lv = skillLevel(skill.id)
  return skill.baseDamage + lv * (skill.levelBonus || 0)
}

function currentEffect(skill) {
  const lv = skillLevel(skill.id)
  if (lv <= 0) return skill.baseEffect
  return skill.baseEffect + (lv - 1) * ((skill.effectBonus || skill.levelBonus) || 0)
}

function nextEffect(skill) {
  const lv = skillLevel(skill.id)
  return skill.baseEffect + lv * ((skill.effectBonus || skill.levelBonus) || 0)
}

const EFFECT_LABELS = {
  defense_down: '降低防御',
  attack_up: '提升攻击',
  lifesteal: '生命汲取',
  armor_penetration: '护甲穿透',
  evasion_up: '提升闪避',
  crit_rate_up: '提升暴击',
  heal: '恢复生命',
  holy_shield: '神圣护盾',
  purify: '净化',
  party_attack_up: '全队攻击',
  taunt: '嘲讽回合',
  damage_reduction: '减伤',
  reflect_damage: '反伤',
  atk_speed_down: '降低攻速',
  magic_shield: '魔力护盾',
  defense_up: '提升防御',
  gold_damage: '金币伤害',
  escape: '逃跑概率',
  gold_bonus: '金币加成',
  summon_pet: '召唤宠物'
}

function effectLabel(skill) {
  if (!skill.effectType) return ''
  const base = EFFECT_LABELS[skill.effectType] || skill.effectType
  const val = currentEffect(skill)
  if (skill.type === 'heal') return `💚 ${base} ${val}`
  return `${base} +${val}%`
}

function nextEffectLabel(skill) {
  if (!skill.effectType) return ''
  const base = EFFECT_LABELS[skill.effectType] || skill.effectType
  const val = nextEffect(skill)
  if (skill.type === 'heal') return `下一级：${base} ${val}`
  return `下一级效果：+${val}%`
}

function upgradeCost(skillId) {
  if (!SKILL_UPGRADE_COSTS) return 0
  const lv = skillLevel(skillId)
  if (lv >= SKILL_UPGRADE_COSTS.length) return 0
  return SKILL_UPGRADE_COSTS[lv] || 0
}

function upgradeCostCurrency(skillId) {
  const lv = skillLevel(skillId)
  return lv >= 7 ? 'evoCoin' : 'gold'
}

function canUpgrade(skillId) {
  const cost = upgradeCost(skillId)
  if (cost === 0) return true
  const currency = upgradeCostCurrency(skillId)
  if (currency === 'gold') return playerStore.gold >= cost
  return playerStore.evolutionCoin >= cost
}

function handleUpgrade(skillId) {
  if (!canUpgrade(skillId)) return
  const cost = upgradeCost(skillId)
  const currency = upgradeCostCurrency(skillId)
  if (currency === 'gold') {
    playerStore.gold = playerStore.gold - cost
  } else {
    playerStore.evolutionCoin = playerStore.evolutionCoin - cost
  }
  playerStore.learnSkill(skillId)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 90%;
  max-width: 420px;
  height: 85vh;
  background: linear-gradient(180deg, #2a2a32, #1a1a22);
  border-radius: 20px;
  border: 1px solid rgba(180, 180, 195, 0.25);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPopIn 0.25s ease-out;
}

@keyframes modalPopIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(120, 180, 220, 0.3);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(20, 50, 80, 0.8);
  border: 1.5px solid rgba(120, 180, 220, 0.4);
  color: #b0d0f0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: rgba(180, 210, 240, 0.7);
  font-size: 1rem;
}

.skill-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-list::-webkit-scrollbar {
  width: 5px;
}

.skill-list::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.4);
  border-radius: 3px;
}

.skill-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
}

.skill-card {
  background: rgba(6, 25, 42, 0.9);
  border: 2px solid rgba(100, 160, 210, 0.4);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s ease;
}

.skill-card:hover {
  border-color: rgba(180, 180, 180, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.skill-card.max-level {
  opacity: 0.7;
  border-color: rgba(100, 100, 100, 0.3);
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 50, 80, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(120, 180, 220, 0.3);
}

.skill-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-name {
  font-size: 1rem;
  font-weight: 700;
  color: #e0f0ff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.skill-level {
  font-size: 0.8rem;
  font-weight: 600;
  color: #90c8e8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.skill-desc {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
  margin: 0;
}

.skill-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.info-tag {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
}

.damage-tag {
  background: rgba(200, 60, 50, 0.25);
  color: #ff9888;
  border: 1px solid rgba(220, 80, 70, 0.4);
}

.hits-tag {
  background: rgba(200, 150, 40, 0.25);
  color: #ffcc66;
  border: 1px solid rgba(220, 170, 50, 0.4);
}

.targets-tag {
  background: rgba(80, 180, 120, 0.25);
  color: #88e0a8;
  border: 1px solid rgba(100, 200, 140, 0.4);
}

.effect-tag {
  background: rgba(100, 80, 200, 0.25);
  color: #b8a8f0;
  border: 1px solid rgba(130, 110, 220, 0.4);
}

.mana-tag {
  background: rgba(60, 140, 200, 0.25);
  color: #88c8f0;
  border: 1px solid rgba(80, 160, 220, 0.4);
}

.skill-next {
  min-height: 20px;
}

.next-preview {
  font-size: 0.78rem;
  color: #80b8d8;
  margin: 0;
}

.max-label {
  font-size: 0.78rem;
  color: #ffd76e;
  margin: 0;
  font-weight: 600;
}

.upgrade-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3a7ab0, #285a80);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(40, 100, 160, 0.4);
}

.upgrade-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #4a8ac0, #386a90);
  box-shadow: 0 4px 16px rgba(60, 130, 200, 0.5);
  transform: translateY(-1px);
}

.upgrade-btn:active:not(.disabled) {
  transform: scale(0.97);
}

.upgrade-btn.disabled {
  background: rgba(30, 60, 90, 0.6);
  color: rgba(180, 200, 220, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}

.upgrade-text {
  letter-spacing: 1px;
}

.upgrade-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffd76e;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.upgrade-btn.disabled .upgrade-cost {
  color: rgba(200, 180, 140, 0.4);
}

.cost-icon {
  font-size: 0.85rem;
}

.currency-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid rgba(120, 180, 220, 0.3);
  flex-shrink: 0;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(20, 50, 80, 0.6);
  padding: 5px 12px;
  border-radius: 14px;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

.currency-item .currency-icon {
  font-size: 1rem;
}

.currency-value {
  font-weight: 700;
  color: #ffd76e;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
}
</style>
