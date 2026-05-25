import { ref } from 'vue'

// ===== Toast 提示 =====
export const toastMessage = ref('')
export const toastVisible = ref(false)
let toastTimer = null

export function showToast(msg, duration = 2500) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

// ===== Confirm 确认弹窗 =====
export const confirmVisible = ref(false)
export const confirmTitle = ref('')
export const confirmMessage = ref('')
let confirmResolve = null

export function showConfirm(msg, title = '确认操作') {
  return new Promise((resolve) => {
    confirmTitle.value = title
    confirmMessage.value = msg
    confirmVisible.value = true
    confirmResolve = resolve
  })
}

export function confirmOk() {
  confirmVisible.value = false
  if (confirmResolve) {
    confirmResolve(true)
    confirmResolve = null
  }
}

export function confirmCancel() {
  confirmVisible.value = false
  if (confirmResolve) {
    confirmResolve(false)
    confirmResolve = null
  }
}
