<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">🎮 兑换码</h2>
        <button class="modal-close" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div class="redeem-section">
          <div class="input-group">
            <input
              v-model="codeInput"
              type="text"
              class="code-input"
              placeholder="请输入兑换码"
              @keyup.enter="redeem"
            />
            <button class="redeem-btn" @click="redeem">兑换</button>
          </div>

          <div v-if="message" class="message" :class="{ 'message-error': isError, 'message-success': !isError }">
            {{ message }}
          </div>
        </div>

        <div class="code-list-section">
          <h3 class="code-list-title">可用兑换码</h3>
          <div class="code-cards">
            <div
              v-for="code in codeList"
              :key="code.code"
              class="code-card"
              :class="{ 'code-used': isCodeUsed(code.code) }"
              @click="selectCode(code.code)"
            >
              <div class="code-card-top">
                <span class="code-text">{{ code.code }}</span>
                <span v-if="isCodeUsed(code.code)" class="code-used-tag">已兑换</span>
              </div>
              <div class="code-rewards">
                <span v-for="(reward, idx) in code.rewards" :key="idx" class="reward-item">
                  {{ reward }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useInventoryStore } from '@/stores/inventory'
import { ITEMS } from '@/data/items'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'triggerConsole'])

const playerStore = usePlayerStore()
const inventoryStore = useInventoryStore()

const codeInput = ref('')
const message = ref('')
const isError = ref(false)

const VALID_CODES = {
  FROZEN2024: {
    gold: 100,
    diamond: 5,
  },
  ICEKINGDOM: {
    gold: 500,
    diamond: 10,
    items: [
      { name: '初级血瓶', quantity: 3 },
    ],
  },
  WELCOME: {
    gold: 200,
    items: [
      { name: '经验圣典', quantity: 1 },
    ],
  },
}

const codeList = [
  {
    code: 'FROZEN2024',
    rewards: ['💰 100金币', '💎 5钻石'],
  },
  {
    code: 'ICEKINGDOM',
    rewards: ['💰 500金币', '💎 10钻石', '🧪 初级血瓶×3'],
  },
  {
    code: 'WELCOME',
    rewards: ['💰 200金币', '📖 经验圣典×1'],
  },
]

const redeemedCodes = computed(() => playerStore.redeemedCodes)

function isCodeUsed(code) {
  return redeemedCodes.value.includes(code)
}

function selectCode(code) {
  codeInput.value = code
}

function close() {
  emit('update:modelValue', false)
  message.value = ''
  isError.value = false
}

const CONSOLE_SALT = 'mistveil_salt_2026'
const CONSOLE_HASH = 'afeba755a30608fbaff31a193721678d3c830dc8bae6f9a897a36e452077a102af008a2666f6a020ba8c12c999117600d9274dacd0f860ae87680c8f10dd71b4'

async function verifyConsoleKey(input) {
  const encoder = new TextEncoder()
  const data = encoder.encode(CONSOLE_SALT + input.toUpperCase())
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex === CONSOLE_HASH
}

function redeem() {
  const code = codeInput.value.trim()
  if (!code) {
    isError.value = true
    message.value = '请输入兑换码'
    return
  }

  verifyConsoleKey(code).then((isConsoleKey) => {
    if (isConsoleKey) {
      emit('triggerConsole')
      close()
      return
    }

    const upperCode = code.toUpperCase()
    if (!VALID_CODES[upperCode]) {
      isError.value = true
      message.value = '无效的兑换码'
      return
    }

    if (!playerStore.setRedeemedCode(upperCode)) {
      isError.value = true
      message.value = '该兑换码已被使用'
      return
    }

    const reward = VALID_CODES[upperCode]

    if (reward.gold) {
      playerStore.addGold(reward.gold)
    }

    if (reward.diamond) {
      playerStore.addDiamond(reward.diamond)
    }

    if (reward.items) {
      for (const item of reward.items) {
        const it = ITEMS[item.name]
        if (it) {
          inventoryStore.addItem({
            name: it.name,
            icon: it.icon || '',
            type: it.type === 'heal' || it.type === 'mana' || it.type === 'exp' ? 'consumable' : 'material',
            itemType: it.type || 'other',
            effect: it.effect || null,
            quantity: item.quantity || 1,
          })
        }
      }
    }

    isError.value = false
    message.value = `兑换成功！获得奖励。`
    codeInput.value = ''
  })
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
  max-width: 440px;
  max-height: 85vh;
  background: linear-gradient(135deg, rgba(10, 35, 55, 0.98), rgba(5, 20, 35, 0.98));
  border-radius: 20px;
  border: 1.5px solid rgba(120, 180, 220, 0.5);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(80, 150, 220, 0.25),
    inset 0 1px 3px rgba(255, 255, 255, 0.1);
  overflow-y: auto;
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
}

.modal-close:hover {
  transform: scale(1.1);
  background: rgba(40, 80, 120, 0.9);
  border-color: rgba(150, 210, 255, 0.7);
}

.modal-body {
  padding: 16px 20px;
}

.redeem-section {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.code-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 40, 60, 0.7);
  border: 1.5px solid rgba(100, 160, 200, 0.4);
  color: #e0f0ff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.25s ease;
}

.code-input::placeholder {
  color: rgba(160, 200, 230, 0.5);
}

.code-input:focus {
  border-color: rgba(140, 200, 240, 0.7);
  box-shadow: 0 0 12px rgba(80, 150, 220, 0.25);
}

.redeem-btn {
  padding: 10px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2a6a9a, #1a5080);
  border: 1.5px solid rgba(130, 200, 240, 0.5);
  color: #e0f0ff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  white-space: nowrap;
}

.redeem-btn:hover {
  background: linear-gradient(135deg, #3a7aaa, #2a6090);
  border-color: rgba(160, 220, 255, 0.7);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 15px rgba(100, 180, 240, 0.2);
  transform: translateY(-1px);
}

.redeem-btn:active {
  transform: scale(0.96);
}

.message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  text-align: center;
}

.message-success {
  background: rgba(40, 160, 80, 0.2);
  border: 1px solid rgba(80, 200, 120, 0.4);
  color: #80e8a0;
}

.message-error {
  background: rgba(200, 60, 60, 0.2);
  border: 1px solid rgba(220, 100, 100, 0.4);
  color: #f0a0a0;
}

.code-list-section {
  border-top: 1px solid rgba(120, 180, 220, 0.2);
  padding-top: 16px;
}

.code-list-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #a0c8e8;
  margin: 0 0 10px 0;
}

.code-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-card {
  background: linear-gradient(135deg, rgba(12, 40, 60, 0.7), rgba(6, 22, 35, 0.8));
  border-radius: 12px;
  padding: 12px 14px;
  border: 1.5px solid rgba(100, 160, 200, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
}

.code-card:hover:not(.code-used) {
  border-color: rgba(140, 200, 240, 0.5);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 0 12px rgba(80, 150, 220, 0.1);
}

.code-card.code-used {
  opacity: 0.5;
  cursor: default;
  border-color: rgba(100, 130, 150, 0.2);
}

.code-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.code-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffd76e;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.code-used-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(120, 120, 120, 0.3);
  border: 1px solid rgba(140, 140, 140, 0.4);
  color: #a0a0a0;
}

.code-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reward-item {
  font-size: 0.8rem;
  color: #b0d0e8;
  background: rgba(20, 50, 80, 0.4);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(80, 140, 180, 0.25);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(10, 30, 50, 0.6);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a8ab8, #2a5a80);
  border-radius: 3px;
  border: 1px solid rgba(100, 160, 200, 0.4);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a9ac8, #3a6a90);
}
</style>
