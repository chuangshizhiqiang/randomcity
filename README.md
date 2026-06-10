# 🎲 随机城市 · RandomCity

一个**随机抽选城市**的小游戏集合：不知道下一站去哪儿旅行？让命运替你决定。

纯前端静态页面，零依赖、零构建、数据内置、离线可用，手机与电脑均可访问，视觉风格参考 Apple 设计语言（毛玻璃、大圆角、弹簧动效、自动深浅色模式）。

## ✨ 功能

- **四种抽选小游戏**
  - 🎡 幸运轮盘 —— 转盘减速，指针定城
  - 🎯 飞镖靶盘 —— 靶盘旋转，掷镖定城
  - 🎰 老虎机 —— 三列滚轮，以中间列为准
  - 🃏 卡牌翻翻乐 —— 洗牌后凭直觉翻一张
- **城市分组多选**：中国大陆（默认）、港澳台、亚洲、欧洲、北美洲、南美洲、大洋洲、非洲，共 120+ 座城市，可任意叠加组合
- **城市详情卡片**：中选后展示城市简介、必游景点、特色美食、最佳旅行时间，并附彩带庆祝动效
- **抽选历史**：本地保存最近 30 次结果，可随时回看
- **响应式**：移动端优先设计，桌面端宽屏布局，自动跟随系统深浅色模式

## 🚀 本地运行

无需安装任何依赖，直接用浏览器打开 `index.html` 即可；或启动一个本地静态服务器：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 📦 部署（GitHub Pages）

仓库已内置 `.github/workflows/deploy.yml`，推送到 `main` 分支即自动部署。

首次使用需在仓库设置中启用：**Settings → Pages → Build and deployment → Source 选择 "GitHub Actions"**。

## 🗂 项目结构

```
randomcity/
├── index.html              # 单页入口
├── css/style.css           # Apple 风格样式（含深色模式）
├── js/
│   ├── app.js              # 主逻辑：分组、游戏切换、历史
│   ├── confetti.js         # 彩带庆祝动效
│   ├── city-card.js        # 城市详情弹层
│   └── games/              # 四个游戏模块（统一 mount/spin 接口）
│       ├── wheel.js        # 轮盘
│       ├── dart.js         # 飞镖
│       ├── slot.js         # 老虎机
│       └── cards.js        # 卡牌
├── data/cities.js          # 城市数据库（分组 / 景点 / 美食）
└── .github/workflows/deploy.yml  # GitHub Pages 自动部署
```

## ➕ 添加城市

编辑 `data/cities.js`，按现有 schema 追加对象即可，所有游戏与界面自动生效。

## 📄 License

Apache-2.0
