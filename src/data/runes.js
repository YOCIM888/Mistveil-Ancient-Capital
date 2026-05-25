export const RUNE_TYPES = {
  attack: { id: 'attack', name: '攻击符文', icon: '⚔️', color: '#ff6b6b' },
  defense: { id: 'defense', name: '防御符文', icon: '🛡️', color: '#70a1ff' },
  health: { id: 'health', name: '生命符文', icon: '❤️', color: '#ff7675' },
  speed: { id: 'speed', name: '速度符文', icon: '⚡', color: '#7bed9f' },
  magic: { id: 'magic', name: '魔力符文', icon: '✨', color: '#a29bfe' },
  critical: { id: 'critical', name: '暴击符文', icon: '💥', color: '#fdcb6e' },
  dodge: { id: 'dodge', name: '闪避符文', icon: '👻', color: '#eccc68' },
  regen: { id: 'regen', name: '回复符文', icon: '🔄', color: '#81ecec' },
}

export const RUNE_LEVELS = {
  1: { name: '1级', buyPrice: 10, disassembleReturn: 5 },
  2: { name: '2级', buyPrice: null, disassembleReturn: 10 },
  3: { name: '3级', buyPrice: null, disassembleReturn: 20 },
  4: { name: '4级', buyPrice: null, disassembleReturn: 40 },
  5: { name: '5级', buyPrice: null, disassembleReturn: 80 },
  6: { name: '6级', buyPrice: null, disassembleReturn: 160 },
  7: { name: '7级', buyPrice: null, disassembleReturn: 320 },
  8: { name: '8级', buyPrice: null, disassembleReturn: 640 },
  9: { name: '9级', buyPrice: null, disassembleReturn: 1280 },
  10: { name: '10级', buyPrice: null, disassembleReturn: 2560 },
}

export const RUNE_BONUS = {
  attack: { base: { attack: 15 }, perLevel: { attack: 8 } },
  defense: { base: { defense: 10 }, perLevel: { defense: 5 } },
  health: { base: { maxHp: 200 }, perLevel: { maxHp: 100 } },
  speed: { base: { speed: 5 }, perLevel: { speed: 3 } },
  magic: { base: { magic: 30 }, perLevel: { magic: 15 } },
  critical: { base: { criticalRate: 0.05 }, perLevel: { criticalRate: 0.025 } },
  dodge: { base: { dodgeRate: 0.03 }, perLevel: { dodgeRate: 0.015 } },
  regen: { base: { magicRegen: 2 }, perLevel: { magicRegen: 1 } },
}
