import { MONSTERS, ELITE_MONSTERS, BOSS_MONSTERS, PET_RARITY } from './monsters.js';
import { EQUIPMENT } from './equipment.js';
import { ITEMS } from './items.js';
import { TALENTS } from './talents.js';

export const ACHIEVEMENT_DEFS = {
    'first_enter': { id: 'first_enter', name: '初入王国', icon: '🏰', desc: '第一次进入游戏', category: '基础', check: (user) => true },
    'profile_complete': { id: 'profile_complete', name: '头号玩家', icon: '🎮', desc: '完善个人资料（头像、昵称、性别、签名）', category: '基础', check: (user) => user.profileCompleted },
    'level_10': { id: 'level_10', name: '初露锋芒', icon: '⭐', desc: '达到10级', category: '等级', check: (user) => user.level >= 10 },
    'level_30': { id: 'level_30', name: '渐入佳境', icon: '🌟', desc: '达到30级', category: '等级', check: (user) => user.level >= 30 },
    'level_50': { id: 'level_50', name: '登堂入室', icon: '💫', desc: '达到50级', category: '等级', check: (user) => user.level >= 50 },
    'level_80': { id: 'level_80', name: '炉火纯青', icon: '✨', desc: '达到80级', category: '等级', check: (user) => user.level >= 80 },
    'level_100': { id: 'level_100', name: '登峰造极', icon: '👑', desc: '达到100级', category: '等级', check: (user) => user.level >= 100 },
    'gold_1k': { id: 'gold_1k', name: '小富即安', icon: '💰', desc: '累计获得1000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 1000 },
    'gold_10k': { id: 'gold_10k', name: '富甲一方', icon: '💰💰', desc: '累计获得10000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 10000 },
    'gold_100k': { id: 'gold_100k', name: '富可敌国', icon: '💰💰💰', desc: '累计获得100000金币', category: '财富', check: (user) => (user.totalGoldEarned || 0) >= 100000 },
    'diamond_100': { id: 'diamond_100', name: '钻石王', icon: '💎', desc: '累计获得100钻石', category: '财富', check: (user) => (user.totalDiamondEarned || 0) >= 100 },
    'battle_1': { id: 'battle_1', name: '初战告捷', icon: '⚔️', desc: '赢得第一场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 1 },
    'battle_10': { id: 'battle_10', name: '百战不殆', icon: '⚔️', desc: '赢得10场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 10 },
    'battle_100': { id: 'battle_100', name: '百战百胜', icon: '⚔️', desc: '赢得100场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 100 },
    'battle_500': { id: 'battle_500', name: '战无不胜', icon: '⚔️', desc: '赢得500场战斗', category: '战斗', check: (user) => (user.battleWins || 0) >= 500 },
    'crit_10': { id: 'crit_10', name: '暴击新手', icon: '💥', desc: '累计暴击10次', category: '战斗', check: (user) => (user.totalCrits || 0) >= 10 },
    'crit_100': { id: 'crit_100', name: '暴击大师', icon: '💥', desc: '累计暴击100次', category: '战斗', check: (user) => (user.totalCrits || 0) >= 100 },
    'dungeon_10': { id: 'dungeon_10', name: '探索者', icon: '🏰', desc: '通关10层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 10 },
    'dungeon_50': { id: 'dungeon_50', name: '冒险家', icon: '🗺️', desc: '通关50层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 50 },
    'dungeon_100': { id: 'dungeon_100', name: '地宫之王', icon: '👑', desc: '通关100层地宫', category: '地宫', check: (user) => (user.clearedFloors || []).length >= 100 },
    'boss_1': { id: 'boss_1', name: '屠龙勇士', icon: '🐉', desc: '击败第一个BOSS', category: 'BOSS', check: (user) => (user.defeatedMonsters || {}).bosses?.length >= 1 },
    'boss_5': { id: 'boss_5', name: 'BOSS杀手', icon: '👹', desc: '击败5个不同的BOSS', category: 'BOSS', check: (user) => (user.defeatedMonsters || {}).bosses?.length >= 5 },
    'boss_all': { id: 'boss_all', name: 'BOSS终结者', icon: '👑', desc: '击败所有BOSS', category: 'BOSS', check: (user) => {
        const bosses = (user.defeatedMonsters || {}).bosses || [];
        const allBossIds = Object.keys(BOSS_MONSTERS).map(Number);
        return allBossIds.every(id => bosses.includes(id));
    } },
    'equip_1': { id: 'equip_1', name: '装备收藏家', icon: '🎒', desc: '收集第一件装备', category: '收集', check: (user) => (user.collectedEquipment || []).length >= 1 },
    'equip_10': { id: 'equip_10', name: '装备大师', icon: '⚔️', desc: '收集10件不同的装备', category: '收集', check: (user) => (user.collectedEquipment || []).length >= 10 },
    'equip_all': { id: 'equip_all', name: '装备之王', icon: '👑', desc: '收集所有装备', category: '收集', check: (user) => {
        const collected = user.collectedEquipment || [];
        const allEquip = Object.keys(EQUIPMENT);
        return collected.length >= allEquip.length;
    } },
    'item_1': { id: 'item_1', name: '道具收藏家', icon: '📦', desc: '收集第一种道具', category: '收集', check: (user) => (user.collectedItems || []).length >= 1 },
    'item_all': { id: 'item_all', name: '道具大师', icon: '🎁', desc: '收集所有道具', category: '收集', check: (user) => {
        const collected = user.collectedItems || [];
        const allItems = Object.keys(ITEMS);
        return collected.length >= allItems.length;
    } },
    'monster_10': { id: 'monster_10', name: '怪物猎人', icon: '🐺', desc: '击败10种不同的怪物', category: '收集', check: (user) => {
        const monsters = (user.defeatedMonsters || {}).normals || [];
        const elites = (user.defeatedMonsters || {}).elites || [];
        return monsters.length + elites.length >= 10;
    } },
    'monster_all': { id: 'monster_all', name: '怪物图鉴全', icon: '📖', desc: '击败所有怪物', category: '收集', check: (user) => {
        const normalMonsters = Object.keys(MONSTERS).map(Number);
        const eliteMonsters = Object.keys(ELITE_MONSTERS).map(Number);
        const bossMonsters = Object.keys(BOSS_MONSTERS).map(Number);
        const defeatedNormal = (user.defeatedMonsters || {}).normals || [];
        const defeatedElite = (user.defeatedMonsters || {}).elites || [];
        const defeatedBoss = (user.defeatedMonsters || {}).bosses || [];
        const allDefeated = new Set([...defeatedNormal, ...defeatedElite, ...defeatedBoss]);
        const allMonsters = new Set([...normalMonsters, ...eliteMonsters, ...bossMonsters]);
        return allDefeated.size >= allMonsters.size;
    } },
    'pet_1': { id: 'pet_1', name: '驯宠新手', icon: '🐾', desc: '获得第一只宠物', category: '宠物', check: (user) => (user.pets || []).length >= 1 },
    'pet_5': { id: 'pet_5', name: '驯宠达人', icon: '🐕', desc: '获得5只宠物', category: '宠物', check: (user) => (user.pets || []).length >= 5 },
    'pet_legend': { id: 'pet_legend', name: '传说宠物', icon: '⭐', desc: '获得一只传说级宠物', category: '宠物', check: (user) => (user.pets || []).some(p => p.rarity === PET_RARITY.LEGENDARY) },
    'talent_1': { id: 'talent_1', name: '天赋觉醒', icon: '🌟', desc: '激活第一个天赋', category: '天赋', check: (user) => Object.values(user.talents || {}).some(lv => lv > 0) },
    'talent_all': { id: 'talent_all', name: '天赋大成', icon: '✨', desc: '所有天赋达到满级', category: '天赋', check: (user) => {
        const className = user.characterClass;
        const classTalents = TALENTS[className] || [];
        const userTalents = user.talents || {};
        return classTalents.every(talent => (userTalents[talent.id] || 0) >= talent.maxLevel);
    } },
    'rune_1': { id: 'rune_1', name: '符文入门', icon: '🔮', desc: '获得第一个符文', category: '符文', check: (user) => (user.runes || []).length >= 1 },
    'rune_6': { id: 'rune_6', name: '符文大师', icon: '✨', desc: '装备满6个符文', category: '符文', check: (user) => (user.activeRunes || []).filter(r => r).length >= 6 },
    'rune_5': { id: 'rune_5', name: '5级符文', icon: '💎', desc: '合成一个5级符文', category: '符文', check: (user) => (user.runes || []).some(r => r.level >= 5) },
    'endless_10': { id: 'endless_10', name: '无尽挑战者', icon: '∞', desc: '无尽模式达到10波', category: '挑战', check: (user) => (user.endlessWave || 1) >= 10 },
    'endless_50': { id: 'endless_50', name: '无尽王者', icon: '👑', desc: '无尽模式达到50波', category: '挑战', check: (user) => (user.endlessWave || 1) >= 50 },
    'first_tame': { id: 'first_tame', name: '驯兽师', icon: '🦊', desc: '成功驯服第一只宠物', category: '挑战', check: (user) => (user.hasTamed || false) },
    'evolution_1': { id: 'evolution_1', name: '超进化', icon: '👑', desc: '成功挑战一次进化BOSS', category: '挑战', check: (user) => {
        const evoCounts = user.bossEvolutionCounts || {};
        return Object.values(evoCounts).some(count => count > 0);
    } }
};
