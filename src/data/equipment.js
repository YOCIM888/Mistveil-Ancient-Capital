export const EQUIPMENT_RARITY = {
    BLUE: 'blue',
    PURPLE: 'purple',
    ORANGE: 'orange',
    RED: 'red'
};

export const EQUIPMENT_TYPE = {
    WEAPON: 'weapon',
    HEAD: 'head',
    CHEST: 'chest',
    LEGS: 'legs',
    BOOTS: 'boots',
    ACCESSORY: 'accessory'
};

export const EQUIPMENT = {
    '狂战钢剑': { name: '狂战钢剑', type: 'weapon', img: '/image/equipment/狂战钢剑.webp', rarity: 'purple', class: '狂战', price: 5000, props: { attack: 50 }, growth: { attack: 5 } },
    '狂战头盔': { name: '狂战头盔', type: 'head', img: '/image/equipment/狂战头盔.webp', rarity: 'purple', class: '狂战', price: 3000, props: { defense: 15, maxHp: 100 }, growth: { defense: 1, maxHp: 10 } },
    '狂战藤甲': { name: '狂战藤甲', type: 'chest', img: '/image/equipment/狂战藤甲.webp', rarity: 'purple', class: '狂战', price: 3500, props: { defense: 20, maxHp: 150 }, growth: { defense: 2, maxHp: 15 } },
    '狂战短裤': { name: '狂战短裤', type: 'legs', img: '/image/equipment/狂战短裤.webp', rarity: 'purple', class: '狂战', price: 2500, props: { defense: 12, attack: 10 }, growth: { defense: 1, attack: 1 } },
    '狂战靴子': { name: '狂战靴子', type: 'boots', img: '/image/equipment/狂战靴子.webp', rarity: 'purple', class: '狂战', price: 2000, props: { speed: 5, maxHp: 50 }, growth: { speed: 0.5, maxHp: 5 } },
    '狂战戒指': { name: '狂战戒指', type: 'accessory', img: '/image/equipment/狂战戒指.webp', rarity: 'purple', class: '狂战', price: 4000, props: { attack: 20, criticalRate: 0.05 }, growth: { attack: 2, criticalRate: 0.005 } },

    '游侠长弓': { name: '游侠长弓', type: 'weapon', img: '/image/equipment/游侠长弓.webp', rarity: 'purple', class: '游侠', price: 5000, props: { attack: 45, speed: 10 }, growth: { attack: 4, speed: 1 } },
    '游侠兜帽': { name: '游侠兜帽', type: 'head', img: '/image/equipment/游侠兜帽.webp', rarity: 'purple', class: '游侠', price: 3000, props: { defense: 10, criticalRate: 0.05 }, growth: { defense: 1, criticalRate: 0.005 } },
    '游侠皮衣': { name: '游侠皮衣', type: 'chest', img: '/image/equipment/游侠皮衣.webp', rarity: 'purple', class: '游侠', price: 3500, props: { defense: 15, speed: 5 }, growth: { defense: 1, speed: 0.5 } },
    '游侠裤子': { name: '游侠裤子', type: 'legs', img: '/image/equipment/游侠裤子.webp', rarity: 'purple', class: '游侠', price: 2500, props: { defense: 10, attack: 15 }, growth: { defense: 1, attack: 1 } },
    '游侠战靴': { name: '游侠战靴', type: 'boots', img: '/image/equipment/游侠战靴.webp', rarity: 'purple', class: '游侠', price: 2000, props: { speed: 15, dodgeRate: 0.05 }, growth: { speed: 1.5, dodgeRate: 0.005 } },
    '游侠信物': { name: '游侠信物', type: 'accessory', img: '/image/equipment/游侠信物.webp', rarity: 'purple', class: '游侠', price: 4000, props: { criticalRate: 0.1, attack: 15 }, growth: { criticalRate: 0.01, attack: 1 } },

    '牧师法杖': { name: '牧师法杖', type: 'weapon', img: '/image/equipment/牧师法杖.webp', rarity: 'purple', class: '牧师', price: 5000, props: { magic: 60, attack: 30 }, growth: { magic: 6, attack: 3 } },
    '牧师冠冕': { name: '牧师冠冕', type: 'head', img: '/image/equipment/牧师冠冕.webp', rarity: 'purple', class: '牧师', price: 3000, props: { maxHp: 80, magic: 20 }, growth: { maxHp: 8, magic: 2 } },
    '牧师法袍': { name: '牧师法袍', type: 'chest', img: '/image/equipment/牧师法袍.webp', rarity: 'purple', class: '牧师', price: 3500, props: { defense: 12, magic: 30, maxHp: 100 }, growth: { defense: 1, magic: 3, maxHp: 10 } },
    '牧师裤子': { name: '牧师裤子', type: 'legs', img: '/image/equipment/牧师裤子.webp', rarity: 'purple', class: '牧师', price: 2500, props: { defense: 8, magic: 15 }, growth: { defense: 1, magic: 1 } },
    '牧师靴子': { name: '牧师靴子', type: 'boots', img: '/image/equipment/牧师靴子.webp', rarity: 'purple', class: '牧师', price: 2000, props: { speed: 5, magicRegen: 2 }, growth: { speed: 0.5, magicRegen: 0.2 } },
    '牧师宝石': { name: '牧师宝石', type: 'accessory', img: '/image/equipment/牧师宝石.webp', rarity: 'purple', class: '牧师', price: 4000, props: { magic: 25, maxHp: 50 }, growth: { magic: 2, maxHp: 5 } },

    '法师法杖': { name: '法师法杖', type: 'weapon', img: '/image/equipment/法师法杖.webp', rarity: 'purple', class: '法师', price: 5000, props: { magic: 80, attack: 20 }, growth: { magic: 8, attack: 2 } },
    '法师假面': { name: '法师假面', type: 'head', img: '/image/equipment/法师假面.webp', rarity: 'purple', class: '法师', price: 3000, props: { magic: 25, magicRegen: 3 }, growth: { magic: 2, magicRegen: 0.3 } },
    '法师长袍': { name: '法师长袍', type: 'chest', img: '/image/equipment/法师长袍.webp', rarity: 'purple', class: '法师', price: 3500, props: { defense: 10, magic: 40 }, growth: { defense: 1, magic: 4 } },
    '法师护腿': { name: '法师护腿', type: 'legs', img: '/image/equipment/法师护腿.webp', rarity: 'purple', class: '法师', price: 2500, props: { defense: 8, magic: 20 }, growth: { defense: 1, magic: 2 } },
    '法师冰靴': { name: '法师冰靴', type: 'boots', img: '/image/equipment/法师冰靴.webp', rarity: 'purple', class: '法师', price: 2000, props: { speed: 8, magic: 10 }, growth: { speed: 0.8, magic: 1 } },
    '法师宝石': { name: '法师宝石', type: 'accessory', img: '/image/equipment/法师宝石.webp', rarity: 'purple', class: '法师', price: 4000, props: { magic: 30, criticalRate: 0.05 }, growth: { magic: 3, criticalRate: 0.005 } },

    '盾骑之剑': { name: '盾骑之剑', type: 'weapon', img: '/image/equipment/盾骑之剑.webp', rarity: 'purple', class: '盾骑', price: 5000, props: { attack: 35, defense: 20 }, growth: { attack: 3, defense: 2 } },
    '盾骑头盔': { name: '盾骑头盔', type: 'head', img: '/image/equipment/盾骑头盔.webp', rarity: 'purple', class: '盾骑', price: 3000, props: { defense: 25, maxHp: 150 }, growth: { defense: 2, maxHp: 15 } },
    '盾骑护甲': { name: '盾骑护甲', type: 'chest', img: '/image/equipment/盾骑护甲.webp', rarity: 'purple', class: '盾骑', price: 3500, props: { defense: 35, maxHp: 200 }, growth: { defense: 3, maxHp: 20 } },
    '盾骑护腿': { name: '盾骑护腿', type: 'legs', img: '/image/equipment/盾骑护腿.webp', rarity: 'purple', class: '盾骑', price: 2500, props: { defense: 20, maxHp: 100 }, growth: { defense: 2, maxHp: 10 } },
    '盾骑之靴': { name: '盾骑之靴', type: 'boots', img: '/image/equipment/盾骑之靴.webp', rarity: 'purple', class: '盾骑', price: 2000, props: { defense: 10, speed: 3 }, growth: { defense: 1, speed: 0.3 } },
    '盾骑徽章': { name: '盾骑徽章', type: 'accessory', img: '/image/equipment/盾骑徽章.webp', rarity: 'purple', class: '盾骑', price: 4000, props: { defense: 15, maxHp: 100 }, growth: { defense: 1, maxHp: 10 } },

    '武僧拳套': { name: '武僧拳套', type: 'weapon', img: '/image/equipment/武僧拳套.webp', rarity: 'purple', class: '武僧', price: 5000, props: { attack: 40, defense: 15 }, growth: { attack: 4, defense: 1 } },
    '武僧头巾': { name: '武僧头巾', type: 'head', img: '/image/equipment/武僧头巾.webp', rarity: 'purple', class: '武僧', price: 3000, props: { maxHp: 100, dodgeRate: 0.05 }, growth: { maxHp: 10, dodgeRate: 0.005 } },
    '武僧衣袍': { name: '武僧衣袍', type: 'chest', img: '/image/equipment/武僧衣袍.webp', rarity: 'purple', class: '武僧', price: 3500, props: { defense: 18, maxHp: 150 }, growth: { defense: 1, maxHp: 15 } },
    '武僧裤子': { name: '武僧裤子', type: 'legs', img: '/image/equipment/武僧裤子.webp', rarity: 'purple', class: '武僧', price: 2500, props: { defense: 12, attack: 10 }, growth: { defense: 1, attack: 1 } },
    '武僧鞋子': { name: '武僧鞋子', type: 'boots', img: '/image/equipment/武僧鞋子.webp', rarity: 'purple', class: '武僧', price: 2000, props: { speed: 12, dodgeRate: 0.05 }, growth: { speed: 1, dodgeRate: 0.005 } },
    '武僧项链': { name: '武僧项链', type: 'accessory', img: '/image/equipment/武僧项链.webp', rarity: 'purple', class: '武僧', price: 4000, props: { attack: 15, defense: 10 }, growth: { attack: 1, defense: 1 } },

    '平民黑剑': { name: '平民黑剑', type: 'weapon', img: '/image/equipment/平民黑剑.webp', rarity: 'purple', class: '平民', price: 5000, props: { attack: 38, criticalRate: 0.05 }, growth: { attack: 3, criticalRate: 0.005 } },
    '平民面具': { name: '平民面具', type: 'head', img: '/image/equipment/平民面具.webp', rarity: 'purple', class: '平民', price: 3000, props: { defense: 12, criticalRate: 0.03 }, growth: { defense: 1, criticalRate: 0.003 } },
    '平民风衣': { name: '平民风衣', type: 'chest', img: '/image/equipment/平民风衣.webp', rarity: 'purple', class: '平民', price: 3500, props: { defense: 16, speed: 8 }, growth: { defense: 1, speed: 0.8 } },
    '平民皮裤': { name: '平民皮裤', type: 'legs', img: '/image/equipment/平民皮裤.webp', rarity: 'purple', class: '平民', price: 2500, props: { defense: 10, speed: 5 }, growth: { defense: 1, speed: 0.5 } },
    '平民长靴': { name: '平民长靴', type: 'boots', img: '/image/equipment/平民长靴.webp', rarity: 'purple', class: '平民', price: 2000, props: { speed: 10, maxHp: 50 }, growth: { speed: 1, maxHp: 5 } },
    '平民硬币': { name: '平民硬币', type: 'accessory', img: '/image/equipment/平民硬币.webp', rarity: 'purple', class: '平民', price: 4000, props: { goldBonus: 0.1, criticalRate: 0.05 }, growth: { goldBonus: 0.01, criticalRate: 0.005 } },

    '旅人长剑': { name: '旅人长剑', type: 'weapon', img: '/image/equipment/旅人长剑.webp', rarity: 'blue', class: 'all', price: 2000, props: { attack: 25 }, growth: { attack: 2 } },
    '旅人帽子': { name: '旅人帽子', type: 'head', img: '/image/equipment/旅人帽子.webp', rarity: 'blue', class: 'all', price: 1200, props: { defense: 8, maxHp: 50 }, growth: { defense: 1, maxHp: 5 } },
    '旅人皮甲': { name: '旅人皮甲', type: 'chest', img: '/image/equipment/旅人皮甲.webp', rarity: 'blue', class: 'all', price: 1400, props: { defense: 12, maxHp: 80 }, growth: { defense: 1, maxHp: 8 } },
    '旅人长裤': { name: '旅人长裤', type: 'legs', img: '/image/equipment/旅人长裤.webp', rarity: 'blue', class: 'all', price: 1200, props: { defense: 6, attack: 5 }, growth: { defense: 1, attack: 0.5 } },
    '旅人靴子': { name: '旅人靴子', type: 'boots', img: '/image/equipment/旅人靴子.webp', rarity: 'blue', class: 'all', price: 1000, props: { speed: 5, maxHp: 30 }, growth: { speed: 0.5, maxHp: 3 } },
    '旅人徽章': { name: '旅人徽章', type: 'accessory', img: '/image/equipment/旅人徽章.webp', rarity: 'blue', class: 'all', price: 1600, props: { attack: 10, defense: 5 }, growth: { attack: 1, defense: 0.5 } },

    '新手铁剑': { name: '新手铁剑', type: 'weapon', img: '/image/equipment/新手铁剑.webp', rarity: 'blue', class: 'all', price: null, props: { attack: 20, defense: 5 }, growth: { attack: 2, defense: 1 } },
    '新手草帽': { name: '新手草帽', type: 'head', img: '/image/equipment/新手草帽.webp', rarity: 'blue', class: 'all', price: null, props: { defense: 10, maxHp: 50 }, growth: { defense: 1, maxHp: 10 } },
    '新手上衣': { name: '新手上衣', type: 'chest', img: '/image/equipment/新手上衣.webp', rarity: 'blue', class: 'all', price: null, props: { defense: 15, maxHp: 80 }, growth: { defense: 1, maxHp: 10 } },
    '新手裤子': { name: '新手裤子', type: 'legs', img: '/image/equipment/新手裤子.webp', rarity: 'blue', class: 'all', price: null, props: { defense: 8, attack: 5 }, growth: { defense: 1, attack: 0.5 } },
    '新手靴子': { name: '新手靴子', type: 'boots', img: '/image/equipment/新手靴子.webp', rarity: 'blue', class: 'all', price: null, props: { speed: 5, maxHp: 30 }, growth: { speed: 0.5, maxHp: 5 } },
    '新手护符': { name: '新手护符', type: 'accessory', img: '/image/equipment/新手护符.webp', rarity: 'blue', class: 'all', price: null, props: { attack: 10, criticalRate: 0.03 }, growth: { attack: 1, criticalRate: 0.003 } },

    '墨韵之剑': { name: '墨韵之剑', type: 'weapon', img: '/image/equipment/墨韵之剑.webp', rarity: 'orange', class: 'all', price: null, props: { attack: 110, criticalRate: 0.09 }, growth: { attack: 10, criticalRate: 0.009 } },
    '墨韵发冠': { name: '墨韵发冠', type: 'head', img: '/image/equipment/墨韵发冠.webp', rarity: 'orange', class: 'all', price: null, props: { defense: 32, maxHp: 240 }, growth: { defense: 3.2, maxHp: 24 } },
    '墨韵长衫': { name: '墨韵长衫', type: 'chest', img: '/image/equipment/墨韵长衫.webp', rarity: 'orange', class: 'all', price: null, props: { defense: 48, maxHp: 400 }, growth: { defense: 4.8, maxHp: 40 } },
    '墨韵下裳': { name: '墨韵下裳', type: 'legs', img: '/image/equipment/墨韵下裳.webp', rarity: 'orange', class: 'all', price: null, props: { defense: 28, attack: 20 }, growth: { defense: 2.8, attack: 2 } },
    '墨韵步履': { name: '墨韵步履', type: 'boots', img: '/image/equipment/墨韵步履.webp', rarity: 'orange', class: 'all', price: null, props: { speed: 18, attack: 14 }, growth: { speed: 1.8, attack: 1.4 } },
    '墨韵玉佩': { name: '墨韵玉佩', type: 'accessory', img: '/image/equipment/墨韵玉佩.webp', rarity: 'orange', class: 'all', price: null, props: { attack: 35, magic: 35, magicRegen: 1.5 }, growth: { attack: 3.5, magic: 3.5, magicRegen: 0.15 } },

    '帝霜冰剑': { name: '帝霜冰剑', type: 'weapon', img: '/image/equipment/帝霜冰剑.webp', rarity: 'orange', class: 'all', price: 40, currency: 'evoCoin', props: { attack: 140, criticalRate: 0.14 }, growth: { attack: 14, criticalRate: 0.014 } },
    '帝鬼魔盔': { name: '帝鬼魔盔', type: 'head', img: '/image/equipment/帝鬼魔盔.webp', rarity: 'orange', class: 'all', price: 30, currency: 'evoCoin', props: { defense: 48, maxHp: 380, criticalRate: 0.05 }, growth: { defense: 4.8, maxHp: 38, criticalRate: 0.005 } },
    '帝冥骨甲': { name: '帝冥骨甲', type: 'chest', img: '/image/equipment/帝冥骨甲.webp', rarity: 'orange', class: 'all', price: 30, currency: 'evoCoin', props: { defense: 68, maxHp: 580 }, growth: { defense: 6.8, maxHp: 58 } },
    '帝棘之裤': { name: '帝棘之裤', type: 'legs', img: '/image/equipment/帝棘之裤.webp', rarity: 'orange', class: 'all', price: 25, currency: 'evoCoin', props: { defense: 38, attack: 28 }, growth: { defense: 3.8, attack: 2.8 } },
    '帝炎之靴': { name: '帝炎之靴', type: 'boots', img: '/image/equipment/帝炎之靴.webp', rarity: 'orange', class: 'all', price: 25, currency: 'evoCoin', props: { speed: 28, attack: 22 }, growth: { speed: 2.8, attack: 2.2 } },
    '帝渊之眼': { name: '帝渊之眼', type: 'accessory', img: '/image/equipment/帝渊之眼.webp', rarity: 'orange', class: 'all', price: 30, currency: 'evoCoin', props: { attack: 52, magic: 52, criticalRate: 0.1 }, growth: { attack: 5.2, magic: 5.2, criticalRate: 0.01 } },

    '洋流之剑': { name: '洋流之剑', type: 'weapon', img: '/image/equipment/洋流之剑.webp', rarity: 'orange', class: 'all', price: 80000, props: { attack: 120, criticalRate: 0.12 }, growth: { attack: 12, criticalRate: 0.012 } },
    '洋流头盔': { name: '洋流头盔', type: 'head', img: '/image/equipment/洋流头盔.webp', rarity: 'orange', class: 'all', price: 50000, props: { defense: 40, maxHp: 300 }, growth: { defense: 4, maxHp: 30 } },
    '洋流上衣': { name: '洋流上衣', type: 'chest', img: '/image/equipment/洋流上衣.webp', rarity: 'orange', class: 'all', price: 60000, props: { defense: 60, maxHp: 500 }, growth: { defense: 6, maxHp: 50 } },
    '洋流裤子': { name: '洋流裤子', type: 'legs', img: '/image/equipment/洋流裤子.webp', rarity: 'orange', class: 'all', price: 45000, props: { defense: 35, attack: 25 }, growth: { defense: 3.5, attack: 2.5 } },
    '洋流鞋子': { name: '洋流鞋子', type: 'boots', img: '/image/equipment/洋流鞋子.webp', rarity: 'orange', class: 'all', price: 40000, props: { speed: 25, attack: 18 }, growth: { speed: 2.5, attack: 1.8 } },
    '洋流项链': { name: '洋流项链', type: 'accessory', img: '/image/equipment/洋流项链.webp', rarity: 'orange', class: 'all', price: 55000, props: { attack: 45, magic: 45 }, growth: { attack: 4.5, magic: 4.5 } },

    '天使光剑': { name: '天使光剑', type: 'weapon', img: '/image/equipment/天使光剑.webp', rarity: 'orange', class: 'all', price: 500, currency: 'diamond', props: { attack: 130, criticalRate: 0.13 }, growth: { attack: 13, criticalRate: 0.013 } },
    '天使头环': { name: '天使头环', type: 'head', img: '/image/equipment/天使头环.webp', rarity: 'orange', class: 'all', price: 600, currency: 'diamond', props: { defense: 45, maxHp: 350 }, growth: { defense: 4.5, maxHp: 35 } },
    '天使护甲': { name: '天使护甲', type: 'chest', img: '/image/equipment/天使护甲.webp', rarity: 'orange', class: 'all', price: 800, currency: 'diamond', props: { defense: 65, maxHp: 550 }, growth: { defense: 6.5, maxHp: 55 } },
    '天使之裙': { name: '天使之裙', type: 'legs', img: '/image/equipment/天使之裙.webp', rarity: 'orange', class: 'all', price: 550, currency: 'diamond', props: { defense: 38, attack: 28 }, growth: { defense: 3.8, attack: 2.8 } },
    '天使之靴': { name: '天使之靴', type: 'boots', img: '/image/equipment/天使之靴.webp', rarity: 'orange', class: 'all', price: 550, currency: 'diamond', props: { speed: 28, attack: 20, dodgeRate: 0.03 }, growth: { speed: 2.8, attack: 2, dodgeRate: 0.003 } },
    '天使信物': { name: '天使信物', type: 'accessory', img: '/image/equipment/天使信物.webp', rarity: 'orange', class: 'all', price: 700, currency: 'diamond', props: { attack: 50, magic: 50, magicRegen: 2 }, growth: { attack: 5, magic: 5, magicRegen: 0.2 } },

    '暗黑神剑': { name: '暗黑神剑', type: 'weapon', img: '/image/equipment/暗黑神剑.webp', rarity: 'red', class: 'all', price: 2800, currency: 'diamond', props: { attack: 280, criticalRate: 0.25 }, growth: { attack: 26, criticalRate: 0.025 } },
    '暗黑神冠': { name: '暗黑神冠', type: 'head', img: '/image/equipment/暗黑神冠.webp', rarity: 'red', class: 'all', price: 1800, currency: 'diamond', props: { defense: 85, maxHp: 850, criticalRate: 0.08, magicRegen: 3 }, growth: { defense: 8.5, maxHp: 85, criticalRate: 0.008, magicRegen: 0.3 } },
    '暗黑神袍': { name: '暗黑神袍', type: 'chest', img: '/image/equipment/暗黑神袍.webp', rarity: 'red', class: 'all', price: 2200, currency: 'diamond', props: { defense: 130, maxHp: 1300, magic: 80 }, growth: { defense: 13, maxHp: 130, magic: 8 } },
    '暗黑神护腿': { name: '暗黑神护腿', type: 'legs', img: '/image/equipment/暗黑神护腿.webp', rarity: 'red', class: 'all', price: 1600, currency: 'diamond', props: { defense: 70, attack: 50, magic: 40 }, growth: { defense: 7, attack: 5, magic: 4 } },
    '暗黑神靴': { name: '暗黑神靴', type: 'boots', img: '/image/equipment/暗黑神靴.webp', rarity: 'red', class: 'all', price: 1500, currency: 'diamond', props: { speed: 45, attack: 35, magic: 35, dodgeRate: 0.05 }, growth: { speed: 4.5, attack: 3.5, magic: 3.5, dodgeRate: 0.005 } },
    '暗黑令牌': { name: '暗黑令牌', type: 'accessory', img: '/image/equipment/暗黑令牌.webp', rarity: 'red', class: 'all', price: 2000, currency: 'diamond', props: { attack: 85, magic: 85, criticalRate: 0.15 }, growth: { attack: 8.5, magic: 8.5, criticalRate: 0.015 } },

    '龙神之剑': { name: '龙神之剑', type: 'weapon', img: '/image/equipment/龙神之剑.webp', rarity: 'red', class: 'all', price: 80, currency: 'evoCoin', props: { attack: 300, criticalRate: 0.26 }, growth: { attack: 27, criticalRate: 0.026 } },
    '龙神之盔': { name: '龙神之盔', type: 'head', img: '/image/equipment/龙神之盔.webp', rarity: 'red', class: 'all', price: 60, currency: 'evoCoin', props: { defense: 88, maxHp: 880, criticalRate: 0.09 }, growth: { defense: 8.8, maxHp: 88, criticalRate: 0.009 } },
    '龙神之衣': { name: '龙神之衣', type: 'chest', img: '/image/equipment/龙神之衣.webp', rarity: 'red', class: 'all', price: 65, currency: 'evoCoin', props: { defense: 135, maxHp: 1350, magic: 85 }, growth: { defense: 13.5, maxHp: 135, magic: 8.5 } },
    '龙神之裤': { name: '龙神之裤', type: 'legs', img: '/image/equipment/龙神之裤.webp', rarity: 'red', class: 'all', price: 50, currency: 'evoCoin', props: { defense: 72, attack: 52, magic: 42, magicRegen: 4 }, growth: { defense: 7.2, attack: 5.2, magic: 4.2, magicRegen: 0.4 } },
    '龙神之靴': { name: '龙神之靴', type: 'boots', img: '/image/equipment/龙神之靴.webp', rarity: 'red', class: 'all', price: 55, currency: 'evoCoin', props: { speed: 46, attack: 36, magic: 36, dodgeRate: 0.06 }, growth: { speed: 4.6, attack: 3.6, magic: 3.6, dodgeRate: 0.006 } },
    '龙神之蛋': { name: '龙神之蛋', type: 'accessory', img: '/image/equipment/龙神之蛋.webp', rarity: 'red', class: 'all', price: 65, currency: 'evoCoin', props: { attack: 88, magic: 88, criticalRate: 0.16 }, growth: { attack: 8.8, magic: 8.8, criticalRate: 0.016 } },

    '创世神剑': { name: '创世神剑', type: 'weapon', img: '/image/equipment/创世神剑.webp', rarity: 'red', class: 'all', price: null, props: { attack: 1000, criticalRate: 0.3 }, growth: { attack: 30, criticalRate: 0.03 } },
    '创世神盔': { name: '创世神盔', type: 'head', img: '/image/equipment/创世神盔.webp', rarity: 'red', class: 'all', price: null, props: { defense: 1000, maxHp: 1000, criticalRate: 0.1 }, growth: { defense: 10, maxHp: 100, criticalRate: 0.01 } },
    '创世神袍': { name: '创世神袍', type: 'chest', img: '/image/equipment/创世神袍.webp', rarity: 'red', class: 'all', price: null, props: { defense: 500, maxHp: 1500, magic: 1000 }, growth: { defense: 15, maxHp: 150, magic: 10 } },
    '创世神裤': { name: '创世神裤', type: 'legs', img: '/image/equipment/创世神裤.webp', rarity: 'red', class: 'all', price: null, props: { defense: 800, attack: 600, magic: 500 }, growth: { defense: 8, attack: 6, magic: 5 } },
    '创世神靴': { name: '创世神靴', type: 'boots', img: '/image/equipment/创世神靴.webp', rarity: 'red', class: 'all', price: null, props: { speed: 100, attack: 400, magic: 400, dodgeRate: 0.08 }, growth: { speed: 5, attack: 4, magic: 4, dodgeRate: 0.008 } },
    '创世神戒': { name: '创世神戒', type: 'accessory', img: '/image/equipment/创世神戒.webp', rarity: 'red', class: 'all', price: null, props: { attack: 500, magic: 1000, criticalRate: 0.2, magicRegen: 5 }, growth: { attack: 10, magic: 10, criticalRate: 0.02, magicRegen: 0.5 } }
};
