export const EXP_CURVE_CONFIG = {
    phaseMultipliers: {
        '1-40': 1.18,
        '41-80': 1.14,
        '81-120': 1.10
    },
    phaseThresholds: [1, 41, 81, 121],
    baseExp: 100
};

export const CLASS_BASE_STATS = {
    '狂战': { strength: 10, constitution: 9, agility: 5, perception: 4, intelligence: 3, luck: 5, magic: 30 },
    '游侠': { strength: 5, constitution: 6, agility: 10, perception: 8, intelligence: 5, luck: 7, magic: 35 },
    '牧师': { strength: 4, constitution: 5, agility: 4, perception: 9, intelligence: 8, luck: 8, magic: 50 },
    '法师': { strength: 3, constitution: 4, agility: 5, perception: 7, intelligence: 10, luck: 6, magic: 60 },
    '盾骑': { strength: 8, constitution: 10, agility: 3, perception: 5, intelligence: 4, luck: 5, magic: 25 },
    '武僧': { strength: 7, constitution: 8, agility: 9, perception: 8, intelligence: 6, luck: 5, magic: 40 },
    '平民': { strength: 5, constitution: 5, agility: 5, perception: 6, intelligence: 6, luck: 10, magic: 35 }
};

export const CLASS_COEFFICIENTS = {
    '狂战': { hpCoefficient: 2.5, attackCoefficient: { stat: 'strength', value: 1.6 }, defenseCoefficient: 0.8 },
    '游侠': { hpCoefficient: 2.3, attackCoefficient: { stat: 'agility', value: 1.4 }, defenseCoefficient: 0.75 },
    '牧师': { hpCoefficient: 2.2, attackCoefficient: { stat: 'perception', value: 1.4 }, defenseCoefficient: 0.7 },
    '法师': { hpCoefficient: 2.0, attackCoefficient: { stat: 'intelligence', value: 1.7 }, defenseCoefficient: 0.6 },
    '盾骑': { hpCoefficient: 2.8, attackCoefficient: { stat: 'strength', value: 1.2 }, defenseCoefficient: 1.2 },
    '武僧': { hpCoefficient: 2.2, attackCoefficient: { stat: 'agility', value: 1.4 }, defenseCoefficient: 0.7 },
    '平民': { hpCoefficient: 2.2, attackCoefficient: { stat: 'luck', value: 1.3 }, defenseCoefficient: 0.7 }
};

export const WARRIOR_GROWTH = {
    coreStats: ['strength', 'constitution'],
    majorStats: ['agility'],
    minorStats: ['perception', 'intelligence', 'luck', 'magic'],
    phase1: { core: 0.84, major: 0.24, minor: { perception: 0.16, intelligence: 0.12, luck: 0.24, magic: 0.16 } },
    phase2: { core: 0.7, major: 0.2, minor: { perception: 0.13, intelligence: 0.1, luck: 0.2, magic: 0.14 } },
    phase3: { core: 0.56, major: 0.16, minor: { perception: 0.1, intelligence: 0.08, luck: 0.16, magic: 0.11 } },
    phase4: { core: 0.42, major: 0.12, minor: { perception: 0.08, intelligence: 0.06, luck: 0.12, magic: 0.08 } }
};

export const RANGER_GROWTH = {
    coreStats: ['agility', 'perception'],
    majorStats: ['luck'],
    minorStats: ['strength', 'constitution', 'intelligence', 'magic'],
    phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, intelligence: 0.12, magic: 0.12 } },
    phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, intelligence: 0.1, magic: 0.1 } },
    phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, intelligence: 0.08, magic: 0.08 } },
    phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, intelligence: 0.06, magic: 0.06 } }
};

export const PRIEST_GROWTH = {
    coreStats: ['perception', 'intelligence', 'magic'],
    majorStats: ['luck'],
    minorStats: ['strength', 'constitution', 'agility'],
    phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, agility: 0.12 } },
    phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, agility: 0.1 } },
    phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, agility: 0.08 } },
    phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, agility: 0.06 } }
};

export const MAGE_GROWTH = {
    coreStats: ['intelligence', 'perception', 'magic'],
    majorStats: ['luck'],
    minorStats: ['strength', 'constitution', 'agility'],
    phase1: { core: 0.84, major: 0.24, minor: { strength: 0.16, constitution: 0.12, agility: 0.12 } },
    phase2: { core: 0.7, major: 0.2, minor: { strength: 0.13, constitution: 0.1, agility: 0.1 } },
    phase3: { core: 0.56, major: 0.16, minor: { strength: 0.1, constitution: 0.08, agility: 0.08 } },
    phase4: { core: 0.42, major: 0.12, minor: { strength: 0.08, constitution: 0.06, agility: 0.06 } }
};

export const GUARDIAN_GROWTH = {
    coreStats: ['constitution', 'strength'],
    majorStats: ['agility'],
    minorStats: ['perception', 'intelligence', 'luck', 'magic'],
    phase1: { core: 0.84, major: 0.24, minor: { perception: 0.16, intelligence: 0.12, luck: 0.24, magic: 0.12 } },
    phase2: { core: 0.7, major: 0.2, minor: { perception: 0.13, intelligence: 0.1, luck: 0.2, magic: 0.1 } },
    phase3: { core: 0.56, major: 0.16, minor: { perception: 0.1, intelligence: 0.08, luck: 0.16, magic: 0.08 } },
    phase4: { core: 0.42, major: 0.12, minor: { perception: 0.08, intelligence: 0.06, luck: 0.12, magic: 0.06 } }
};

export const MONK_GROWTH = {
    coreStats: ['agility', 'perception'],
    majorStats: ['strength', 'constitution', 'magic'],
    minorStats: ['intelligence', 'luck'],
    phase1: { core: 0.84, major: { strength: 0.48, constitution: 0.48, magic: 0.24 }, minor: { intelligence: 0.16, luck: 0.16 } },
    phase2: { core: 0.7, major: { strength: 0.4, constitution: 0.4, magic: 0.2 }, minor: { intelligence: 0.13, luck: 0.13 } },
    phase3: { core: 0.56, major: { strength: 0.32, constitution: 0.32, magic: 0.16 }, minor: { intelligence: 0.1, luck: 0.1 } },
    phase4: { core: 0.42, major: { strength: 0.24, constitution: 0.24, magic: 0.12 }, minor: { intelligence: 0.08, luck: 0.08 } }
};

export const COMMONER_GROWTH = {
    coreStats: ['luck'],
    majorStats: ['perception', 'intelligence', 'magic'],
    minorStats: ['strength', 'constitution', 'agility'],
    phase1: { core: 0.84, major: { perception: 0.24, intelligence: 0.24, magic: 0.2 }, minor: { strength: 0.16, constitution: 0.16, agility: 0.16 } },
    phase2: { core: 0.7, major: { perception: 0.2, intelligence: 0.2, magic: 0.17 }, minor: { strength: 0.13, constitution: 0.13, agility: 0.13 } },
    phase3: { core: 0.56, major: { perception: 0.16, intelligence: 0.16, magic: 0.13 }, minor: { strength: 0.1, constitution: 0.1, agility: 0.1 } },
    phase4: { core: 0.42, major: { perception: 0.12, intelligence: 0.12, magic: 0.1 }, minor: { strength: 0.08, constitution: 0.08, agility: 0.08 } }
};

export const CLASS_GROWTHS = {
    '狂战': WARRIOR_GROWTH,
    '游侠': RANGER_GROWTH,
    '牧师': PRIEST_GROWTH,
    '法师': MAGE_GROWTH,
    '盾骑': GUARDIAN_GROWTH,
    '武僧': MONK_GROWTH,
    '平民': COMMONER_GROWTH
};
