export const ITEMS = {
    '初级血瓶': { name: '初级血瓶', icon: '🧪', img: '/image/items/初级血瓶.webp', type: 'heal', effect: 0.1, price: 100, currency: 'gold', desc: '回复10%生命', maxStack: 99 },
    '中级血瓶': { name: '中级血瓶', icon: '🧪', img: '/image/items/中级血瓶.webp', type: 'heal', effect: 0.3, price: 300, currency: 'gold', desc: '回复30%生命', maxStack: 99 },
    '高级血瓶': { name: '高级血瓶', icon: '🧪', img: '/image/items/高级血瓶.webp', type: 'heal', effect: 0.5, price: 500, currency: 'gold', desc: '回复50%生命', maxStack: 99 },
    '生命之水': { name: '生命之水', icon: '💧', img: '/image/items/生命之水.webp', type: 'heal', effect: 1.0, price: 50, currency: 'diamond', desc: '回复100%生命', maxStack: 99 },

    '初级魔瓶': { name: '初级魔瓶', icon: '🫙', img: '/image/items/初级魔瓶.webp', type: 'mana', effect: 0.1, price: 150, currency: 'gold', desc: '回复10%魔力', maxStack: 99 },
    '中级魔瓶': { name: '中级魔瓶', icon: '🫙', img: '/image/items/中级魔瓶.webp', type: 'mana', effect: 0.3, price: 300, currency: 'gold', desc: '回复30%魔力', maxStack: 99 },
    '高级魔瓶': { name: '高级魔瓶', icon: '🫙', img: '/image/items/高级魔瓶.webp', type: 'mana', effect: 0.5, price: 750, currency: 'gold', desc: '回复50%魔力', maxStack: 99 }, 
    '附魔之水': { name: '附魔之水', icon: '✨', img: '/image/items/附魔之水.webp', type: 'mana', effect: 1.0, price: 75, currency: 'diamond', desc: '回复100%魔力', maxStack: 99 },

    '小经验瓶': { name: '小经验瓶', icon: '⭐', img: '/image/items/小经验瓶.webp', type: 'exp', effect: 500, price: 300, currency: 'gold', desc: '获得500经验', maxStack: 99 },
    '中经验瓶': { name: '中经验瓶', icon: '⭐', img: '/image/items/中经验瓶.webp', type: 'exp', effect: 1500, price: 900, currency: 'gold', desc: '获得1500经验', maxStack: 99 },
    '大经验瓶': { name: '大经验瓶', icon: '⭐', img: '/image/items/大经验瓶.webp', type: 'exp', effect: 3000, price: 1750, currency: 'gold', desc: '获得3000经验', maxStack: 99 },
    '经验圣典': { name: '经验圣典', icon: '📖', img: '/image/items/经验圣典.webp', type: 'exp', effect: 10000, price: 100, currency: 'diamond', desc: '获得10000经验', maxStack: 99 },

    '暴戾卷轴': { name: '暴戾卷轴', icon: '📜', img: '/image/items/暴戾卷轴.webp', type: 'buff', effect: { criticalRate: 0.05 }, price: 500, currency: 'gold', desc: '本场战斗暴击率+5%' },
    '金甲卷轴': { name: '金甲卷轴', icon: '📜', img: '/image/items/金甲卷轴.webp', type: 'buff', effect: { defense: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗防御+20%' },
    '飓风卷轴': { name: '飓风卷轴', icon: '📜', img: '/image/items/飓风卷轴.webp', type: 'buff', effect: { speed: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗攻击速度+20%' },
    '威能卷轴': { name: '威能卷轴', icon: '📜', img: '/image/items/威能卷轴.webp', type: 'buff', effect: { attack: 0.2 }, price: 500, currency: 'gold', desc: '本场战斗攻击+20%' },
    '通灵卷轴': { name: '通灵卷轴', icon: '📜', img: '/image/items/通灵卷轴.webp', type: 'tame', effect: { type: 'normal' }, price: 50, currency: 'diamond', desc: '使用后直接驯服普通怪', maxStack: 99 },
    '契约卷轴': { name: '契约卷轴', icon: '📜', img: '/image/items/契约卷轴.webp', type: 'tame', effect: { type: 'elite' }, price: 300, currency: 'diamond', desc: '使用后直接驯服精英怪', maxStack: 99 },
    '创世契约': { name: '创世契约', icon: '📜', img: '/image/items/创世卷轴.webp', type: 'tame', effect: { type: 'all' }, price: null, desc: '使用后驯服任意怪包括BOSS', maxStack: 99 },

    '背包扩容卡': {
        name: '背包扩容卡',
        icon: '🎒',
        img: '/image/items/背包扩容卡.webp',
        description: '使用后永久增加5格背包容量（最大200格）',
        type: 'consumable',
        effect: { expandBackpack: 5 },
        price: 30000,
        currency: 'gold',
    },
};
