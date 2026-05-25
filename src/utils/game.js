import { EXP_CURVE_CONFIG, CLASS_BASE_STATS, CLASS_COEFFICIENTS, CLASS_GROWTHS } from '../data/classes.js';
import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS, PET_TEMPLATES, PET_RARITY } from '../data/monsters.js';
import { EQUIPMENT } from '../data/equipment.js';
import { RUNE_BONUS } from '../data/runes.js';
import { TALENTS } from '../data/talents.js';

function getCoefficientForLevel(level) {
    if (level >= 1 && level <= 40) {
        return EXP_CURVE_CONFIG.phaseMultipliers['1-40'];
    } else if (level >= 41 && level <= 80) {
        return EXP_CURVE_CONFIG.phaseMultipliers['41-80'];
    } else if (level >= 81 && level <= 120) {
        return EXP_CURVE_CONFIG?.phaseMultipliers?.['81-120'] || 1.5;
    }
    return EXP_CURVE_CONFIG.phaseMultipliers['81-120'];
}

export function calculateExpForLevel(level) {
    if (level <= 1) {
        return EXP_CURVE_CONFIG.baseExp;
    }
    const coefficient = getCoefficientForLevel(level);
    return Math.round(EXP_CURVE_CONFIG.baseExp * Math.pow(coefficient, level - 1));
}

export function getTotalExpForLevel(targetLevel) {
    if (targetLevel <= 1) {
        return 0;
    }
    let totalExp = 0;
    for (let level = 1; level < targetLevel; level++) {
        totalExp += calculateExpForLevel(level + 1);
    }
    return totalExp;
}

export function getExpProgress(level, currentExp) {
    const expForNextLevel = calculateExpForLevel(level + 1);
    if (!expForNextLevel || expForNextLevel <= 0 || isNaN(expForNextLevel)) {
        return 0;
    }
    return Math.min(100, Math.round((currentExp / expForNextLevel) * 10000) / 100);
}

function getGrowthConfig(className) {
    return CLASS_GROWTHS?.[className] || CLASS_GROWTHS?.['狂战'] || {};
}

function getGrowthPhase(level) {
    if (level <= 30) return 'phase1';
    if (level <= 60) return 'phase2';
    if (level <= 90) return 'phase3';
    return 'phase4';
}

function getAttributeMultiplier(level) {
    if (level <= 30) return 1.2;
    if (level <= 60) return 1.0;
    if (level <= 90) return 0.8;
    return 0.6;
}

export function calculateBaseStats(className, level) {
    const classBase = CLASS_BASE_STATS[className]
    if (!classBase) {
        return { strength: 5, constitution: 5, agility: 5, perception: 5, intelligence: 5, luck: 5 }
    }
    const baseStats = { ...classBase };
    baseStats.magic = baseStats.magic || 0;
    baseStats.intelligence = baseStats.intelligence || 0;
    const growth = getGrowthConfig(className);
    const phase = getGrowthPhase(level);
    const phaseConfig = growth[phase];
    if (!phaseConfig) {
        return baseStats
    }
    const multiplier = getAttributeMultiplier(level);

    const calculateMinorStat = (stat) => {
        return phaseConfig.minor[stat] || 0.2;
    };

    if (className === '武僧') {
        baseStats.agility += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.perception += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.strength += Math.floor(0.4 * level * multiplier * phaseConfig.major.strength);
        baseStats.constitution += Math.floor(0.4 * level * multiplier * phaseConfig.major.constitution);
        baseStats.magic += Math.floor(0.4 * level * multiplier * phaseConfig.major.magic);
        baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
        baseStats.luck += Math.floor(calculateMinorStat('luck') * level * multiplier);
    } else if (className === '游侠') {
        baseStats.agility += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.perception += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
        baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
        baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
        baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
        baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
        baseStats.magic += Math.floor(calculateMinorStat('magic') * level * multiplier);
    } else if (className === '牧师') {
        baseStats.perception += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.intelligence += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
        baseStats.magic += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 0.9);
        baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
        baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
        baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
        baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
    } else if (className === '法师') {
        baseStats.intelligence += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.perception += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
        baseStats.magic += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 0.8);
        baseStats.luck += Math.floor(0.4 * level * multiplier * phaseConfig.major);
        baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
        baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
        baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
    } else if (className === '盾骑') {
        baseStats.constitution += Math.floor(0.7 * level * multiplier * phaseConfig.core);
        baseStats.strength += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
        baseStats.agility += Math.floor(0.4 * level * multiplier * phaseConfig.major);
        baseStats.perception += Math.floor(calculateMinorStat('perception') * level * multiplier);
        baseStats.intelligence += Math.floor(calculateMinorStat('intelligence') * level * multiplier);
        baseStats.luck += Math.floor(calculateMinorStat('luck') * level * multiplier);
        baseStats.magic += Math.floor(calculateMinorStat('magic') * level * multiplier);
    } else if (className === '平民') {
        baseStats.luck += Math.floor((0.7 * level * multiplier * phaseConfig.core) * 1.1);
        baseStats.perception += Math.floor((0.4 * level * multiplier * phaseConfig.major.perception) * 1.1);
        baseStats.intelligence += Math.floor((0.4 * level * multiplier * phaseConfig.major.intelligence) * 1.1);
        baseStats.magic += Math.floor((0.4 * level * multiplier * phaseConfig.major.magic) * 1.1);
        baseStats.strength += Math.floor(calculateMinorStat('strength') * level * multiplier);
        baseStats.constitution += Math.floor(calculateMinorStat('constitution') * level * multiplier);
        baseStats.agility += Math.floor(calculateMinorStat('agility') * level * multiplier);
    } else {
        if (growth.coreStats) {
            growth.coreStats.forEach(stat => {
                baseStats[stat] += Math.floor(0.7 * level * multiplier * phaseConfig.core);
            });
        }
        if (growth.majorStats) {
            growth.majorStats.forEach(stat => {
                if (typeof phaseConfig.major === 'object') {
                    baseStats[stat] += Math.floor(0.4 * level * multiplier * (phaseConfig.major[stat] || 0));
                } else {
                    baseStats[stat] += Math.floor(0.4 * level * multiplier * (phaseConfig.major || 0));
                }
            });
        }
        if (growth.minorStats) {
            growth.minorStats.forEach(stat => {
                baseStats[stat] += Math.floor(calculateMinorStat(stat) * level * multiplier);
            });
        }
    }

    return baseStats;
}

export function calculateBattleStats(className, level, baseStats) {
    const stats = {};
    const coeff = CLASS_COEFFICIENTS[className]
    if (!coeff) {
        return {
            maxHp: 100 + baseStats.constitution * 10,
            attack: 15 + baseStats.strength * 5,
            defense: 8 + baseStats.constitution * 3,
            atkSpeed: 1.0,
            moveSpeed: 3.0,
            critRate: +(baseStats.luck * 0.0035).toFixed(4),
            critDamage: 1.5,
            rareDropRate: baseStats.luck * 0.6,
            dodgeRate: 0,
            magicRegen: 0
        }
    }

    stats.maxHp = Math.floor(100 + baseStats.constitution * coeff.hpCoefficient * level);

    const attackStat = coeff.attackCoefficient.stat;
    if (attackStat === 'average') {
        stats.attack = Math.floor(15 + (baseStats.strength + baseStats.agility + baseStats.perception + baseStats.intelligence) / 4 * coeff.attackCoefficient.value);
    } else {
        stats.attack = Math.floor(15 + baseStats[attackStat] * coeff.attackCoefficient.value);
    }

    stats.defense = Math.floor(8 + baseStats.constitution * coeff.defenseCoefficient);

    stats.atkSpeed = +(1 + (baseStats.agility / 12) * 0.06).toFixed(2);

    stats.moveSpeed = +(3 + (baseStats.agility / 12) * 0.12).toFixed(2);

    if (className === '武僧') {
        stats.atkSpeed = +(stats.atkSpeed + baseStats.agility * 0.02).toFixed(2);
    }

    stats.critRate = +(baseStats.luck * 0.0035).toFixed(4);

    if (className === '平民') {
        stats.critRate = +(stats.critRate + baseStats.luck * 0.0025).toFixed(4);
    }

    stats.critDamage = 1.5;

    stats.rareDropRate = +(baseStats.luck * 0.6).toFixed(2);

    stats.dodgeRate = 0;
    stats.magicRegen = 0;

    return stats;
}

export function calculateStatsForLevel(baseStats, growthConfig, level) {
    return calculateBaseStats(growthConfig, level);
}

export function calculateCombatDamage(attacker, defender, isCrit) {
    let attackerAtk = isNaN(attacker.attack) || attacker.attack <= 0 ? 10 : attacker.attack;
    let defenderDef = isNaN(defender.defense) || defender.defense < 0 ? 0 : defender.defense;

    let damage = Math.max(1, attackerAtk - defenderDef * 0.5);
    if (isCrit) {
        damage *= 2;
    }
    return Math.floor(damage);
}

export function calculateDamage(attackerAtk, defenderDef, isDefending = false) {
    attackerAtk = isNaN(attackerAtk) || attackerAtk <= 0 ? 10 : attackerAtk;
    defenderDef = isNaN(defenderDef) || defenderDef < 0 ? 0 : defenderDef;

    let damage = Math.max(1, attackerAtk - defenderDef * 0.5);
    if (isDefending) {
        damage *= 0.5;
    }
    return Math.floor(damage);
}

export function calculateTameChance(monsterType) {
    if (monsterType === 'boss') {
        return 0;
    }
    if (monsterType === 'elite') {
        return 0.03;
    }
    return 0.05;
}

export function calculateDrops(floor, isBoss, isElite) {
    const baseGold = isBoss ? 500 : (isElite ? 200 : 50);
    const baseExp = isBoss ? 300 : (isElite ? 120 : 30);
    const goldMultiplier = Math.pow(1.2, Math.floor(floor / 10));
    const expMultiplier = Math.pow(1.15, Math.floor(floor / 10));
    const rareChance = isBoss ? 50 : (isElite ? 20 : 5);
    let diamond = 0;
    if (Math.random() * 100 < rareChance) {
        diamond = isBoss ? 20 : (isElite ? 5 : 1);
    }
    return {
        gold: Math.floor(baseGold * goldMultiplier * (0.8 + Math.random() * 0.4)),
        exp: Math.floor(baseExp * expMultiplier * (0.8 + Math.random() * 0.4)),
        diamond: diamond
    };
}

export function getMonsterMultiplier(floor) {
    const zone = Math.floor((floor - 1) / 10);
    return Math.pow(1.35, zone);
}

export function getMonsterData(floor) {
    if (BOSS_MONSTERS[floor]) {
        const boss = BOSS_MONSTERS[floor];
        const multiplier = getMonsterMultiplier(floor);
        return {
            name: boss.name,
            img: '/image/monster/' + boss.img,
            hp: Math.floor(boss.hp * multiplier),
            maxHp: Math.floor(boss.hp * multiplier),
            attack: Math.floor(boss.attack * multiplier),
            defense: Math.floor(boss.defense * multiplier),
            atkSpeed: boss.atkSpeed,
            moveSpeed: boss.moveSpeed,
            isBoss: true
        };
    }
    if (ELITE_MONSTERS[floor]) {
        const elite = ELITE_MONSTERS[floor];
        const multiplier = getMonsterMultiplier(floor);
        return {
            name: elite.name,
            img: '/image/monster/' + elite.img,
            hp: Math.floor(elite.hp * multiplier),
            maxHp: Math.floor(elite.hp * multiplier),
            attack: Math.floor(elite.attack * multiplier),
            defense: Math.floor(elite.defense * multiplier),
            atkSpeed: elite.atkSpeed,
            moveSpeed: elite.moveSpeed,
            isElite: true
        };
    }
    const base = MONSTERS[floor] || MONSTERS[((floor - 1 + 4) % 4) + 1] || MONSTERS[1];
    if (!base) {
        return {
            name: '未知怪物',
            img: '/image/monster/雪绒兔.webp',
            hp: 50,
            maxHp: 50,
            attack: 10,
            defense: 5,
            atkSpeed: 1.0,
            moveSpeed: 3.0,
            isBoss: false,
            isElite: false
        };
    }
    const multiplier = getMonsterMultiplier(floor);
    return {
        name: base.name,
        img: '/image/monster/' + base.img,
        hp: Math.floor(base.hp * multiplier),
        maxHp: Math.floor(base.hp * multiplier),
        attack: Math.floor(base.attack * multiplier),
        defense: Math.floor(base.defense * multiplier),
        atkSpeed: base.atkSpeed,
        moveSpeed: base.moveSpeed,
        isBoss: false,
        isElite: false
    };
}

export function generateDungeonMonsters(floor) {
    // BOSS 层只有一个 BOSS
    const mainMonster = getMonsterData(floor)
    if (mainMonster.isBoss || mainMonster.isElite) {
        return [mainMonster, null, null, null]
    }

    // 普通层：2-4 个怪物
    const count = 2 + Math.floor(Math.random() * 3) // 2, 3, or 4
    const monsters = [mainMonster]
    const usedNames = new Set([mainMonster.name])

    // 获取可用楼层范围
    const minFloor = Math.max(1, floor - 2)
    const maxFloor = floor + 2

    for (let i = 1; i < count; i++) {
        // 尝试找不同名的怪物
        let candidate = null
        let attempts = 0
        while (attempts < 20) {
            const randFloor = minFloor + Math.floor(Math.random() * (maxFloor - minFloor + 1))
            const base = MONSTERS[randFloor]
            if (base && !usedNames.has(base.name)) {
                const multiplier = getMonsterMultiplier(floor) * (0.75 + Math.random() * 0.2)
                candidate = {
                    name: base.name,
                    img: '/image/monster/' + base.img,
                    hp: Math.floor(base.hp * multiplier),
                    maxHp: Math.floor(base.hp * multiplier),
                    attack: Math.floor(base.attack * multiplier),
                    defense: Math.floor(base.defense * multiplier),
                    atkSpeed: base.atkSpeed,
                    moveSpeed: base.moveSpeed,
                    isBoss: false,
                    isElite: false
                }
                break
            }
            attempts++
        }
        // 如果实在找不到不同名的，随机选一个
        if (!candidate) {
            const randFloor = minFloor + Math.floor(Math.random() * (maxFloor - minFloor + 1))
            const base = MONSTERS[randFloor] || MONSTERS[1]
            const multiplier = getMonsterMultiplier(floor) * (0.75 + Math.random() * 0.2)
            candidate = {
                name: base.name + '*',
                img: '/image/monster/' + base.img,
                hp: Math.floor(base.hp * multiplier),
                maxHp: Math.floor(base.hp * multiplier),
                attack: Math.floor(base.attack * multiplier),
                defense: Math.floor(base.defense * multiplier),
                atkSpeed: base.atkSpeed,
                moveSpeed: base.moveSpeed,
                isBoss: false,
                isElite: false
            }
        }
        usedNames.add(candidate.name)
        monsters.push(candidate)
    }

    // 补齐到 4 个位置
    while (monsters.length < 4) {
        monsters.push(null)
    }

    return monsters
}

export function generateBossEvolution(boss, evoCount) {
    const multiplier = Math.pow(2, evoCount);
    return {
        ...boss,
        hp: Math.floor(boss.hp * multiplier),
        attack: Math.floor(boss.attack * multiplier),
        defense: Math.floor(boss.defense * multiplier),
        isBoss: true,
        evoCount: evoCount
    };
}

export function generatePvPOpponent(playerLevel) {
    const minLevel = Math.max(1, playerLevel - 1);
    const maxLevel = playerLevel + 5;
    const aiLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

    const classes = ['狂战', '游侠', '牧师', '法师', '盾骑', '武僧'];
    const aiClass = classes[Math.floor(Math.random() * classes.length)];

    const prefixes = ['神秘', '暗影', '风暴', '冰霜', '火焰', '雷霆', '暗夜', '圣光'];
    const suffixes = ['战士', '游侠', '法师', '守护者', '行者', '猎手', '术士', '圣骑士'];
    const aiName = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];

    const stats = getCharacterStats(aiClass, aiLevel);

    return {
        id: 'ai_' + Date.now(),
        name: aiName,
        characterClass: aiClass,
        level: aiLevel,
        maxHp: stats.maxHp,
        currentHp: stats.maxHp,
        attack: stats.attack,
        defense: stats.defense,
        atkSpeed: stats.atkSpeed,
        magic: stats.magic
    };
}

export function getCharacterStats(className, level, equipBonus, runeBonus, talentBonus) {
    if (typeof className === 'object' && className !== null && className.characterClass) {
        const store = className
        const cls = store.characterClass || '平民'
        const lvl = store.level || 1
        const eq = getEquipmentBonus(store.equipped || {})
        const rn = getTotalRuneBonus(store.activeRunes || [])
        const tb = getTalentBonus(store.talents || {}, cls)
        return getCharacterStats(cls, lvl, eq, rn, tb)
    }

    const baseStats = calculateBaseStats(className, level);
    const battleStats = calculateBattleStats(className, level, baseStats);
    const stats = { ...baseStats, ...battleStats };

    if (equipBonus) {
        stats.maxHp += equipBonus.maxHp || 0;
        stats.attack += equipBonus.attack || 0;
        stats.defense += equipBonus.defense || 0;
        stats.atkSpeed = +(stats.atkSpeed + (equipBonus.atkSpeed || 0)).toFixed(2);
        stats.critRate = +(stats.critRate + (equipBonus.critRate || 0)).toFixed(4);
        stats.critDamage = (stats.critDamage || 1.5) + (equipBonus.critDamage || 0);
        stats.magic = (stats.magic || 0) + (equipBonus.magic || 0);
    }

    if (runeBonus) {
        stats.maxHp += runeBonus.maxHp || 0;
        stats.attack += runeBonus.attack || 0;
        stats.defense += runeBonus.defense || 0;
        stats.atkSpeed = +(stats.atkSpeed + (runeBonus.atkSpeed || 0)).toFixed(2);
        stats.critRate = +(stats.critRate + (runeBonus.critRate || 0)).toFixed(4);
        stats.critDamage = (stats.critDamage || 1.5) + (runeBonus.critDamage || 0);
        stats.magic += runeBonus.magic || 0;
        stats.dodgeRate = runeBonus.dodgeRate || 0;
        stats.magicRegen = runeBonus.magicRegen || 0;
    }

    if (talentBonus) {
        if (talentBonus.maxHp > 0) stats.maxHp = Math.floor(stats.maxHp * (1 + talentBonus.maxHp / 100));
        if (talentBonus.attack > 0) stats.attack = Math.floor(stats.attack * (1 + talentBonus.attack / 100));
        if (talentBonus.defense > 0) stats.defense = Math.floor(stats.defense * (1 + talentBonus.defense / 100));
        if (talentBonus.atkSpeed > 0) stats.atkSpeed = +(stats.atkSpeed * (1 + talentBonus.atkSpeed / 100)).toFixed(2);
        if (talentBonus.critRate > 0) stats.critRate = +(stats.critRate + talentBonus.critRate).toFixed(4);
        if (talentBonus.critDamage > 0) stats.critDamage = (stats.critDamage || 1.5) + talentBonus.critDamage;
        if (talentBonus.magic > 0) stats.magic = Math.floor(stats.magic * (1 + talentBonus.magic / 100));
    }

    // 暴击率溢出转换：超过 100% 的部分按 10% 转为爆伤
    stats.critDamage = stats.critDamage || 1.5;
    if (stats.critRate > 1.0) {
        const overflow = stats.critRate - 1.0;
        stats.critDamage += overflow * 0.1;
        stats.critRate = 1.0;
    }
    stats.critDamage = +stats.critDamage.toFixed(2);

    return stats;
}

export function calculateEquipmentStats(equipData, level) {
    const stats = { ...equipData.props };
    if (equipData.growth && level > 0) {
        Object.entries(equipData.growth).forEach(([key, value]) => {
            stats[key] = (stats[key] || 0) + value * level;
        });
    }
    return stats;
}

export function getEquipmentBonus(equipped) {
    const bonus = { maxHp: 0, attack: 0, defense: 0, atkSpeed: 0, moveSpeed: 0, critRate: 0, critDamage: 0, magic: 0, dodgeRate: 0, magicRegen: 0 };
    if (!equipped) return bonus;

    Object.values(equipped).forEach(equip => {
        if (!equip) return
        const equipData = EQUIPMENT[equip.name];
        if (!equipData) return;
        const stats = calculateEquipmentStats(equipData, equip.level || 0);
        Object.entries(stats).forEach(([key, value]) => {
            if (key in bonus) {
                bonus[key] += value;
            } else if (key === 'speed') {
                bonus.atkSpeed += value * 0.01;
            } else if (key === 'criticalRate') {
                bonus.critRate += value;
            } else if (key === 'critDamage') {
                bonus.critDamage += value;
            }
        });
    });

    return bonus;
}

export function getTalentBonus(userTalents, className) {
    const bonus = { maxHp: 0, attack: 0, defense: 0, atkSpeed: 0, critRate: 0, critDamage: 0, magic: 0 };
    if (!userTalents) return bonus;

    const classTalents = TALENTS[className];
    if (!classTalents) return bonus;

    classTalents.forEach(talent => {
        const level = userTalents[talent.id] || 0;
        if (level <= 0) return;

        const value = talent.baseValue + (level - 1) * talent.perLevel;

        switch (talent.effectType) {
            case 'defense':
                bonus.defense += value;
                break;
            case 'max_hp':
                bonus.maxHp += value;
                break;
            case 'crit_rate':
                bonus.critRate += value / 100;
                break;
            case 'crit_damage':
                bonus.critDamage += value / 100;
                break;
            case 'attack_speed':
                bonus.atkSpeed += value;
                break;
            case 'dual_stat':
                bonus.attack += value;
                bonus.defense += value;
                break;
            case 'max_mana':
                bonus.magic += value;
                break;
            case 'all_stats':
                bonus.maxHp += value;
                bonus.attack += value;
                bonus.defense += value;
                bonus.atkSpeed += value;
                bonus.critRate += value / 100;
                bonus.magic += value;
                break;
        }
    });

    return bonus;
}

export function getRuneBonus(type, level) {
    const bonus = RUNE_BONUS[type];
    if (!bonus) return {};
    const result = {};
    for (const [stat, baseVal] of Object.entries(bonus.base)) {
        const perLevelVal = bonus.perLevel[stat] || 0;
        result[stat] = baseVal + perLevelVal * (level - 1);
    }
    return result;
}

export function getTotalRuneBonus(equippedRunes) {
    const bonus = { maxHp: 0, attack: 0, defense: 0, atkSpeed: 0, critRate: 0, critDamage: 0, magic: 0, dodgeRate: 0, magicRegen: 0 };

    equippedRunes.forEach(rune => {
        if (!rune) return;
        const runeValues = getRuneBonus(rune.type, rune.level || 1);
        for (const [stat, value] of Object.entries(runeValues)) {
            switch (stat) {
                case 'maxHp': bonus.maxHp += value; break;
                case 'attack': bonus.attack += value; break;
                case 'defense': bonus.defense += value; break;
                case 'speed': bonus.atkSpeed += value * 0.01; break;
                case 'magic': bonus.magic += value; break;
                case 'criticalRate': bonus.critRate += value; break;
                case 'critDamage': bonus.critDamage += value; break;
                case 'dodgeRate': bonus.dodgeRate += value * 100; break;
                case 'magicRegen': bonus.magicRegen += value; break;
            }
        }
    });

    return bonus;
}

export function getFrostSlowEffect(floor) {
    const baseChance = 10;
    const baseDuration = 1.5;
    const zone = Math.floor(floor / 10);
    return {
        chance: baseChance + zone * 2,
        duration: baseDuration + zone * 0.2
    };
}

export function generateEndlessMonster(wave) {
    const zoneMonsters = {
        1: { normal: [1, 2, 3, 4], elite: [5, 8] },
        2: { normal: [11, 12, 13, 14], elite: [15, 18] },
        3: { normal: [21, 22, 23, 24], elite: [25, 28] },
        4: { normal: [31, 32, 33, 34], elite: [35, 38] },
        5: { normal: [41, 42, 43, 44], elite: [45, 48] },
        6: { normal: [51, 52, 53, 54], elite: [55, 58] },
        7: { normal: [61, 62, 63, 64], elite: [65, 68] },
        8: { normal: [71, 72, 73, 74], elite: [75, 78] },
        9: { normal: [81, 82, 83, 84], elite: [85, 88] },
        10: { normal: [91, 92, 93, 94], elite: [95, 98] }
    };

    let maxZone;
    if (wave <= 5) maxZone = 1;
    else if (wave <= 10) maxZone = 2;
    else if (wave <= 20) maxZone = 4;
    else if (wave <= 30) maxZone = 6;
    else if (wave <= 50) maxZone = 8;
    else maxZone = 10;

    const isElite = wave > 5 && Math.random() < Math.min(0.2 + wave * 0.015, 0.6);

    let monsterPool = [];
    if (isElite) {
        for (let z = 1; z <= maxZone; z++) {
            monsterPool = monsterPool.concat(zoneMonsters[z].elite);
        }
    } else {
        for (let z = 1; z <= maxZone; z++) {
            monsterPool = monsterPool.concat(zoneMonsters[z].normal);
        }
    }

    const monsterId = monsterPool[Math.floor(Math.random() * monsterPool.length)];
    const baseMonster = MONSTERS[monsterId] || ELITE_MONSTERS[monsterId];

    if (!baseMonster) {
        const fallback = MONSTERS[1]
        if (fallback) {
            return {
                ...fallback,
                img: '/image/monster/' + fallback.img
            };
        }
        return {
            name: '未知怪物',
            img: '/image/monster/雪绒兔.webp',
            hp: 50,
            attack: 10,
            defense: 5,
            atkSpeed: 1.0,
            moveSpeed: 3.0,
            isElite: false,
            wave: wave
        };
    }

    const multiplier = 1 + (wave - 1) * 0.12;
    const adjustedMonster = {
        ...baseMonster,
        img: '/image/monster/' + baseMonster.img,
        hp: Math.floor(baseMonster.hp * multiplier),
        attack: Math.floor(baseMonster.attack * multiplier),
        defense: Math.floor(baseMonster.defense * multiplier),
        isElite: isElite,
        wave: wave
    };

    return adjustedMonster;
}

export function createPetFromMonster(monsterName, imgOverride) {
    const template = PET_TEMPLATES[monsterName];
    if (!template) {
        return {
            id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: monsterName,
            rarity: PET_RARITY.COMMON,
            hp: 50,
            maxHp: 50,
            atk: 8,
            level: 1,
            img: imgOverride || '/image/monster/' + monsterName + '.webp'
        };
    }
    return {
        id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: template.name,
        rarity: template.rarity,
        hp: template.baseHp,
        maxHp: template.baseHp,
        atk: template.baseAtk,
        level: 1,
        img: '/image/monster/' + template.img
    };
}
