# 千雾古都

一款基于 Vue 3 的文字 RPG 冒险游戏。

## 游戏特色

- 🗡️ **回合制战斗** — 地宫探索、无尽模式、PVP 对战、BOSS 超进化
- 🎒 **装备系统** — 六件套装备栏 + 背包管理 + 锻造升级
- 🐾 **宠物系统** — 驯服怪物为宠物，协助战斗
- 🔮 **符文系统** — 八种属性符文，合成升级
- 🌟 **天赋系统** — 多路线天赋树，自由搭配
- 🏠 **家园系统** — 钓鱼、种植、打工
- 🌫️ **迷雾岛** — 随机迷宫探索
- 🏆 **成就系统** — 24+ 成就待解锁

## 技术栈

- Vue 3 + Vite
- Pinia 状态管理
- Vue Router（Hash 模式）
- 纯前端，数据存储在 localStorage

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署

项目使用 GitHub Actions 自动构建并部署到 GitHub Pages，推送至 `main` 分支即可触发。

## 项目结构

```
src/
├── components/    # 组件（战斗、背包、商店等弹窗）
├── data/          # 游戏数据（装备、怪物、技能等）
├── stores/        # Pinia 状态管理
├── utils/         # 工具函数（战斗计算、迷宫生成）
├── views/         # 页面视图
└── router/        # 路由配置
```

## 在线体验

[mac.yocim.top](https://mac.yocim.top)
