export const TALENTS = {
    '狂战': [
        {
            id: 'warrior_bloodthirst',
            name: '嗜血',
            icon: '🩸',
            description: '每次攻击有概率回复生命值',
            effectType: 'lifesteal',
            baseValue: 3,
            perLevel: 1.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 1.5;
                return `攻击时有${value}%概率回复最大生命值的5%`;
            }
        },
        {
            id: 'warrior_berserker',
            name: '狂战士',
            icon: '💢',
            description: '生命值越低，攻击力越高',
            effectType: 'hp_bonus',
            baseValue: 2,
            perLevel: 1.0,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 2 + (level - 1) * 1.0;
                return `生命值低于50%时，攻击力提升${value}%`;
            }
        },
        {
            id: 'warrior_armor_pierce',
            name: '破甲',
            icon: '⚔️',
            description: '无视敌人部分防御力',
            effectType: 'armor_pierce',
            baseValue: 5,
            perLevel: 1.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 5 + (level - 1) * 1.5;
                return `攻击时无视敌人${value}%防御力`;
            }
        }
    ],
    '游侠': [
        {
            id: 'ranger_critical',
            name: '致命一击',
            icon: '💥',
            description: '提升暴击率',
            effectType: 'crit_rate',
            baseValue: 5,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 5 + (level - 1) * 2;
                return `暴击率提升${value}%`;
            }
        },
        {
            id: 'ranger_evasion',
            name: '闪避',
            icon: '💨',
            description: '提升闪避和防御能力',
            effectType: 'defense',
            baseValue: 3,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 2;
                return `防御力提升${value}点`;
            }
        },
        {
            id: 'ranger_rapid_fire',
            name: '速射',
            icon: '🏹',
            description: '提升攻击速度',
            effectType: 'attack_speed',
            baseValue: 3,
            perLevel: 1.0,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 1.0;
                return `攻击速度提升${value}%`;
            }
        }
    ],
    '牧师': [
        {
            id: 'priest_healing',
            name: '神圣治愈',
            icon: '💚',
            description: '提升最大生命值',
            effectType: 'max_hp',
            baseValue: 5,
            perLevel: 3,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 5 + (level - 1) * 3;
                return `最大生命值提升${value}点`;
            }
        },
        {
            id: 'priest_barrier',
            name: '神圣护盾',
            icon: '🛡️',
            description: '提升防御力',
            effectType: 'defense',
            baseValue: 4,
            perLevel: 2.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 4 + (level - 1) * 2.5;
                return `防御力提升${value}点`;
            }
        },
        {
            id: 'priest_purify',
            name: '净化',
            icon: '✨',
            description: '全面提升攻防属性',
            effectType: 'dual_stat',
            baseValue: 2,
            perLevel: 1,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 2 + (level - 1) * 1;
                return `攻击和防御各提升${value}点`;
            }
        }
    ],
    '法师': [
        {
            id: 'mage_mana_efficiency',
            name: '元素亲和',
            icon: '�',
            description: '提升攻击和防御力',
            effectType: 'dual_stat',
            baseValue: 4,
            perLevel: 2.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 4 + (level - 1) * 2.5;
                return `攻击和防御各提升${value}点`;
            }
        },
        {
            id: 'mage_elemental',
            name: '元素强化',
            icon: '🔥',
            description: '提升攻击和防御力',
            effectType: 'dual_stat',
            baseValue: 3,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 2;
                return `攻击和防御各提升${value}点`;
            }
        },
        {
            id: 'mage_arcane',
            name: '奥术智慧',
            icon: '📜',
            description: '小幅提升全属性',
            effectType: 'all_stats',
            baseValue: 1,
            perLevel: 0.8,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 1 + (level - 1) * 0.8;
                return `全属性提升${value}点`;
            }
        }
    ],
    '盾骑': [
        {
            id: 'guardian_iron_wall',
            name: '铁壁',
            icon: '🧱',
            description: '大幅提升防御力',
            effectType: 'defense',
            baseValue: 5,
            perLevel: 3,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 5 + (level - 1) * 3;
                return `防御力提升${value}点`;
            }
        },
        {
            id: 'guardian_rebound',
            name: '反弹',
            icon: '↩️',
            description: '提升攻击和防御力',
            effectType: 'dual_stat',
            baseValue: 2,
            perLevel: 1.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 2 + (level - 1) * 1.5;
                return `攻击和防御各提升${value}点`;
            }
        },
        {
            id: 'guardian_vitality',
            name: '活力',
            icon: '❤️',
            description: '大幅提升最大生命值',
            effectType: 'max_hp',
            baseValue: 5,
            perLevel: 3,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 5 + (level - 1) * 3;
                return `最大生命值提升${value}点`;
            }
        }
    ],
    '武僧': [
        {
            id: 'monk_ki',
            name: '气',
            icon: '☯️',
            description: '提升攻击和防御力',
            effectType: 'dual_stat',
            baseValue: 3,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 2;
                return `攻击和防御各提升${value}点`;
            }
        },
        {
            id: 'monk_counter',
            name: '反击',
            icon: '👊',
            description: '提升防御和反击能力',
            effectType: 'defense',
            baseValue: 2,
            perLevel: 1.5,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 2 + (level - 1) * 1.5;
                return `防御力提升${value}点`;
            }
        },
        {
            id: 'monk_meditation',
            name: '冥想',
            icon: '🧘',
            description: '提升最大生命值',
            effectType: 'max_hp',
            baseValue: 3,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 2;
                return `最大生命值提升${value}点`;
            }
        }
    ],
    '平民': [
        {
            id: 'commoner_lucky',
            name: '幸运儿',
            icon: '🍀',
            description: '提升暴击率',
            effectType: 'crit_rate',
            baseValue: 3,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 3 + (level - 1) * 2;
                return `暴击率提升${value}%`;
            }
        },
        {
            id: 'commoner_economist',
            name: '理财',
            icon: '💰',
            description: '提升生命值上限',
            effectType: 'max_hp',
            baseValue: 2,
            perLevel: 2,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 2 + (level - 1) * 2;
                return `最大生命值提升${value}点`;
            }
        },
        {
            id: 'commoner_adapt',
            name: '适应',
            icon: '🌟',
            description: '小幅提升全属性',
            effectType: 'all_stats',
            baseValue: 1,
            perLevel: 1.0,
            maxLevel: 60,
            getEffect: (level) => {
                const value = 1 + (level - 1) * 1.0;
                return `全属性提升${value}点`;
            }
        }
    ]
};
