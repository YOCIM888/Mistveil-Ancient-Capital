import { MONSTERS, BOSS_MONSTERS } from '@/data/monsters'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateMathPuzzle() {
  const ops = ['+', '-', '*']
  const op = ops[Math.floor(Math.random() * ops.length)]
  const a = randInt(1, 99)
  const b = randInt(1, 99)
  switch (op) {
    case '+':
      return { question: `${a} + ${b} = ?`, answer: a + b }
    case '-':
      return { question: `${a} - ${b} = ?`, answer: a - b }
    case '*':
      return { question: `${a} × ${b} = ?`, answer: a * b }
    default:
      return { question: `${a} + ${b} = ?`, answer: a + b }
  }
}

export function generateMaze(size = 128) {
  const maze = Array.from({ length: size }, () => new Array(size).fill(0))
  const stack = [[1, 1]]
  maze[1][1] = 1

  const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]]

  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1]
    const neighbors = []

    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx] === 0) {
        neighbors.push([nx, ny, dx, dy])
      }
    }

    if (neighbors.length > 0) {
      const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)]
      maze[y + dy / 2][x + dx / 2] = 1
      maze[ny][nx] = 1
      stack.push([nx, ny])
    } else {
      stack.pop()
    }
  }

  return maze
}

function findFurthestPath(maze, sx, sy) {
  const size = maze.length
  const visited = Array.from({ length: size }, () => new Array(size).fill(false))
  const queue = [[sx, sy]]
  visited[sy][sx] = true
  let last = [sx, sy]

  while (queue.length > 0) {
    const [x, y] = queue.shift()
    last = [x, y]
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited[ny][nx] && maze[ny][nx] === 1) {
        visited[ny][nx] = true
        queue.push([nx, ny])
      }
    }
  }

  return last
}

function collectPathCells(maze) {
  const cells = []
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        cells.push([x, y])
      }
    }
  }
  return cells
}

const MONSTER_IDS = Object.keys(MONSTERS).map(Number)
const BOSS_IDS = Object.keys(BOSS_MONSTERS).map(Number)

export function populateMaze(maze, playerLevel) {
  const size = maze.length
  const cellData = {}

  const pathCells = collectPathCells(maze)

  const quadrantCells = pathCells.filter(([x, y]) => x < size * 0.3 && y < size * 0.3)
  const [sx, sy] = quadrantCells[Math.floor(Math.random() * quadrantCells.length)]
  maze[sy][sx] = 6

  const [bx, by] = findFurthestPath(maze, sx, sy)
  const bossId = BOSS_IDS[Math.floor(Math.random() * BOSS_IDS.length)]
  const boss = BOSS_MONSTERS[bossId]
  maze[by][bx] = 5
  cellData[`${bx},${by}`] = {
    id: bossId,
    name: boss.name,
    img: boss.img,
    hp: boss.hp,
    attack: boss.attack,
    defense: boss.defense,
    atkSpeed: boss.atkSpeed,
    moveSpeed: boss.moveSpeed
  }

  const occupied = new Set([`${sx},${sy}`, `${bx},${by}`])
  const available = pathCells.filter(([x, y]) => !occupied.has(`${x},${y}`))
  shuffle(available)

  const monsterCount = randInt(30, 50)
  const puzzleCount = randInt(10, 15)
  const chestCount = randInt(8, 12)

  let idx = 0

  for (let i = 0; i < monsterCount && idx < available.length; i++, idx++) {
    const [mx, my] = available[idx]
    const mId = MONSTER_IDS[Math.floor(Math.random() * MONSTER_IDS.length)]
    const monster = MONSTERS[mId]
    maze[my][mx] = 2
    cellData[`${mx},${my}`] = {
      id: mId,
      name: monster.name,
      img: monster.img,
      hp: monster.hp,
      attack: monster.attack,
      defense: monster.defense,
      atkSpeed: monster.atkSpeed,
      moveSpeed: monster.moveSpeed
    }
  }

  for (let i = 0; i < puzzleCount && idx < available.length; i++, idx++) {
    const [px, py] = available[idx]
    const puzzle = generateMathPuzzle()
    maze[py][px] = 3
    cellData[`${px},${py}`] = {
      question: puzzle.question,
      answer: puzzle.answer
    }
  }

  for (let i = 0; i < chestCount && idx < available.length; i++, idx++) {
    const [cx, cy] = available[idx]
    const gold = randInt(50, 300)
    const diamondChance = Math.random()
    const diamond = diamondChance < 0.3 ? randInt(1, 5) : 0
    maze[cy][cx] = 4
    cellData[`${cx},${cy}`] = {
      gold,
      diamond
    }
  }

  return { maze, cellData, startX: sx, startY: sy }
}

export function generateMistIslandMaze(playerLevel) {
  const maze = generateMaze(128)
  const result = populateMaze(maze, playerLevel)
  return {
    grid: result.maze,
    cellData: result.cellData,
    startX: result.startX,
    startY: result.startY
  }
}