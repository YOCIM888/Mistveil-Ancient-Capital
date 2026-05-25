<template>
  <canvas
    ref="canvasRef"
    class="maze-canvas"
    :width="canvasSize"
    :height="canvasSize"
    tabindex="0"
    @keydown.prevent="handleKey"
    @click="handleClick"
    @touchstart.prevent="handleTouch"
  />
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({
  grid: { type: Array, required: true },
  cellData: { type: Object, default: () => ({}) },
  startX: { type: Number, required: true },
  startY: { type: Number, required: true },
})

const emit = defineEmits([
  'encounter-monster',
  'encounter-puzzle',
  'encounter-chest',
  'encounter-boss',
  'step',
])

const playerStore = usePlayerStore()
const canvasRef = ref(null)
const canvasSize = 440
const viewCells = 11
const cellSize = Math.floor(canvasSize / viewCells)

const playerX = ref(props.startX)
const playerY = ref(props.startY)
const fogExplored = ref(new Set())

function isPassable(x, y) {
  const g = props.grid
  if (x < 0 || y < 0 || y >= g.length || x >= g[0].length) return false
  return g[y][x] !== 0
}

function initExplored() {
  fogExplored.value = new Set()
  markExplored(playerX.value, playerY.value)
}

function markExplored(x, y) {
  const radius = viewCells
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && ny >= 0 && ny < props.grid.length && nx < props.grid[0].length) {
        fogExplored.value.add(`${nx},${ny}`)
      }
    }
  }
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const g = props.grid
  const px = playerX.value
  const py = playerY.value
  const half = Math.floor(viewCells / 2)
  const fog = fogExplored.value

  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.fillStyle = '#0a0f1a'
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  for (let vy = 0; vy < viewCells; vy++) {
    for (let vx = 0; vx < viewCells; vx++) {
      const mx = px - half + vx
      const my = py - half + vy
      if (mx < 0 || my < 0 || my >= g.length || mx >= g[0].length) continue
      if (!fog.has(`${mx},${my}`)) continue

      const cell = g[my][mx]
      const cx = vx * cellSize
      const cy = vy * cellSize

      switch (cell) {
        case 0: // wall
          ctx.fillStyle = '#1a2030'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#252d3e'
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2)
          break
        case 1: // path
          ctx.fillStyle = '#1a2235'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#1e2840'
          ctx.fillRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2)
          break
        case 2: // monster
          ctx.fillStyle = '#2a1525'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#8b2252'
          ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = '#ff4477'
          ctx.font = `${cellSize * 0.5}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('⚔', cx + cellSize / 2, cy + cellSize / 2)
          break
        case 3: // puzzle
          ctx.fillStyle = '#152530'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#226688'
          ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = '#44ccff'
          ctx.font = `${cellSize * 0.5}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('❓', cx + cellSize / 2, cy + cellSize / 2)
          break
        case 4: // chest
          ctx.fillStyle = '#302015'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#aa8833'
          ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = '#ffcc44'
          ctx.font = `${cellSize * 0.5}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('📦', cx + cellSize / 2, cy + cellSize / 2)
          break
        case 5: // boss
          ctx.fillStyle = '#301515'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          ctx.fillStyle = '#cc3333'
          ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = '#ff6644'
          ctx.font = `${cellSize * 0.6}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('👑', cx + cellSize / 2, cy + cellSize / 2)
          break
        case 6: // start
          ctx.fillStyle = '#1a3520'
          ctx.fillRect(cx, cy, cellSize, cellSize)
          break
      }
    }
  }

  // draw player avatar in center
  const centerX = half * cellSize
  const centerY = half * cellSize
  const avatarSize = cellSize - 2

  const playerImg = new Image()
  const cls = playerStore.characterClass || '平民'
  playerImg.src = playerStore.customAvatar || '/image/role/' + cls + '.webp'
  playerImg.onload = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX + cellSize / 2, centerY + cellSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(playerImg, centerX + 1, centerY + 1, avatarSize, avatarSize)
    ctx.restore()
  }
}

function handleKey(e) {
  const key = e.key.toLowerCase()
  let dx = 0, dy = 0
  if (key === 'arrowup' || key === 'w') dy = -1
  else if (key === 'arrowdown' || key === 's') dy = 1
  else if (key === 'arrowleft' || key === 'a') dx = -1
  else if (key === 'arrowright' || key === 'd') dx = 1
  else return

  const nx = playerX.value + dx
  const ny = playerY.value + dy

  if (!isPassable(nx, ny)) return

  const g = props.grid
  const cell = g[ny][nx]

  playerX.value = nx
  playerY.value = ny
  markExplored(nx, ny)
  draw()
  emit('step', { x: nx, y: ny })

  const data = props.cellData[`${nx},${ny}`]
  if (cell === 2) emit('encounter-monster', { x: nx, y: ny, data })
  else if (cell === 3) emit('encounter-puzzle', { x: nx, y: ny, data })
  else if (cell === 4) emit('encounter-chest', { x: nx, y: ny, data })
  else if (cell === 5) emit('encounter-boss', { x: nx, y: ny, data })
}

function handleCanvasInteraction(clientX, clientY) {
  const rect = canvasRef.value.getBoundingClientRect()
  const offsetX = clientX - rect.left
  const offsetY = clientY - rect.top

  const vx = Math.floor(offsetX / cellSize)
  const vy = Math.floor(offsetY / cellSize)
  const half = Math.floor(viewCells / 2)

  const mazeX = playerX.value + vx - half
  const mazeY = playerY.value + vy - half

  const dx = mazeX - playerX.value
  const dy = mazeY - playerY.value

  if (Math.abs(dx) + Math.abs(dy) !== 1) return
  if (!isPassable(mazeX, mazeY)) return

  const g = props.grid
  const cell = g[mazeY][mazeX]

  playerX.value = mazeX
  playerY.value = mazeY
  markExplored(mazeX, mazeY)
  draw()
  emit('step', { x: mazeX, y: mazeY })

  const data = props.cellData[`${mazeX},${mazeY}`]
  if (cell === 2) emit('encounter-monster', { x: mazeX, y: mazeY, data })
  else if (cell === 3) emit('encounter-puzzle', { x: mazeX, y: mazeY, data })
  else if (cell === 4) emit('encounter-chest', { x: mazeX, y: mazeY, data })
  else if (cell === 5) emit('encounter-boss', { x: mazeX, y: mazeY, data })
}

function handleClick(e) {
  handleCanvasInteraction(e.clientX, e.clientY)
}

function handleTouch(e) {
  const touch = e.touches[0]
  handleCanvasInteraction(touch.clientX, touch.clientY)
}

watch(() => props.grid, () => {
  playerX.value = props.startX
  playerY.value = props.startY
  initExplored()
  nextTick(() => {
    canvasRef.value?.focus()
    draw()
  })
})

onMounted(() => {
  playerX.value = props.startX
  playerY.value = props.startY
  initExplored()
  nextTick(() => {
    canvasRef.value?.focus()
    draw()
  })
})
</script>

<style scoped>
.maze-canvas {
  display: block;
  margin: 0 auto;
  border: 2px solid rgba(120, 180, 220, 0.3);
  border-radius: 8px;
  outline: none;
  cursor: none;
}
</style>