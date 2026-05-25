export const GIFTPACKS = {
    starter: {
        id: 'starter',
        name: '新手礼包',
        desc: '新手六件套+初级血瓶+初级魔瓶',
        price: 0,
        currency: 'free',
        limit: 1,
        items: [
            { name: '新手铁剑', type: 'equipment' },
            { name: '新手草帽', type: 'equipment' },
            { name: '新手上衣', type: 'equipment' },
            { name: '新手裤子', type: 'equipment' },
            { name: '新手靴子', type: 'equipment' },
            { name: '新手护符', type: 'equipment' },
            { name: '初级血瓶', type: 'item', quantity: 3 },
            { name: '初级魔瓶', type: 'item', quantity: 3 }
        ]
    },
    scroll: {
        id: 'scroll',
        name: '卷轴家族礼包',
        desc: '暴戾、金甲、飓风、威能卷轴各10张',
        price: 99,
        currency: 'diamond',
        limit: null,
        items: [
            { name: '暴戾卷轴', type: 'item', quantity: 10 },
            { name: '金甲卷轴', type: 'item', quantity: 10 },
            { name: '飓风卷轴', type: 'item', quantity: 10 },
            { name: '威能卷轴', type: 'item', quantity: 10 }
        ]
    },
    exp: {
        id: 'exp',
        name: '葵花宝典礼包',
        desc: '大/中/小经验瓶超值组合',
        price: 199,
        currency: 'diamond',
        limit: null,
        items: [
            { name: '大经验瓶', type: 'item', quantity: 3 },
            { name: '中经验瓶', type: 'item', quantity: 5 },
            { name: '小经验瓶', type: 'item', quantity: 10 }
        ]
    },
    tame: {
        id: 'tame',
        name: '凌驾大师礼包',
        desc: '契约卷轴+通灵卷轴',
        price: 299,
        currency: 'diamond',
        limit: null,
        items: [
            { name: '契约卷轴', type: 'item', quantity: 1 },
            { name: '通灵卷轴', type: 'item', quantity: 1 }
        ]
    }
};
