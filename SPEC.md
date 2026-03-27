# 儿童英语听写练习 App - 完整规格说明书

**版本：** v1.0
**日期：** 2026-03-27
**状态：** 🚧 开发中

---

## 一、项目概述

- **一句话：** 儿童英语听力拼写练习工具，卡通风格，本地运行，听中文播报拼写英文，含奖励系统
- **目标用户：** 4-10 岁儿童
- **技术栈：** React + Vite + Capacitor（Android APK），纯本地无需网络

---

## 二、设计规范

### 2.1 色彩体系

| 用途 | 色值 |
|------|------|
| 主色（珊瑚红） | `#FF6B6B` |
| 次要色（青绿） | `#4ECDC4` |
| 强调色（明黄） | `#FFE66D` |
| 背景色（暖白） | `#FFF9F0` |
| 卡片色 | `#FFFFFF` |
| 文字主色 | `#2D3436` |
| 成功绿 | `#00B894` |
| 错误红 | `#FF7675` |

### 2.2 尺寸规范

- 按钮最小：**64px 高**
- 字号最小：**20sp**
- 圆角：`12px`（小）/`20px`（卡片）/`24px`（大按钮）/`32px`（弹窗）
- 间距：8pt 网格（xs=4, sm=8, md=16, lg=24, xl=32, xxl=48）

### 2.3 字体

- 中文：`Noto Sans SC`
- 英文/数字：`Fredoka One`

---

## 三、页面结构

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 欢迎、积分、快捷入口、进度 |
| 级别选择 | `/levels` | 选择学前/一年级/二年级/三年级/扩展 |
| 听写练习 | `/practice` | 播放→拼写→反馈 |
| 测试模式 | `/test` | 选择题+听写题混合，计时 |
| 错题本 | `/wrong` | 错题列表+重新练习 |
| 奖励页 | `/rewards` | 积分+徽章+贴纸 |
| 我的 | `/profile` | 个人信息+进度+设置 |

**底部导航 5 Tab：** 首页 / 练习 / 测试 / 奖励 / 我的

---

## 四、功能详情

### 4.1 听写练习

1. 选择级别 → 选择主题（动物/颜色/食物等）
2. 播放 TTS 英文发音（可重复点击播放）
3. 用户点击字母键盘拼写
4. 点击 ✔️ 确认：
   - ✅ 正确：欢呼动画 + "+10积分"飘字 → 自动下一题
   - ❌ 错误：温柔鼓励 + 显示正确答案 → 记入错题本
5. 可跳过（记为未掌握）

### 4.2 测试模式

- 每套 10 题（选择题 + 听写题混合）
- 选择题：4 选 1，显示中文或图片
- 听写题：同练习页字母键盘
- 每题限时 30 秒，超时自动下一题
- 完成后显示得分 + 用时

### 4.3 错题本

- 自动记录答错单词
- 显示：单词、音标、中文、错误答案
- 支持重新练习单条错题
- 连续答对 2 次自动移出错题本

### 4.4 奖励系统

| 类型 | 规则 |
|------|------|
| 积分 | 答对 +10，测试满分 +50，连续登录 +5/天 |
| 贴纸 | 每答对 5 题随机获得 1 张 |
| 徽章 | 累计积分解锁（初次学习/学习达人/连续7天等） |

---

## 五、词库主题

| 主题 | 颜色 |
|------|------|
| 🐾 动物 | `#D63031` |
| 🎨 颜色 | `#FD79A8` |
| 🍎 食物 | `#E17055` |
| 👨‍👩‍👧 家庭 | `#A29BFE` |
| 🔢 数字 | `#0984E3` |
| 🏫 学校 | `#00CEC9` |
| ☀️ 天气 | `#FDCB6E` |
| 👕 衣物 | `#00B894` |
| 🧸 玩具 | `#FF7675` |
| 👋 身体 | `#E17055` |

---

## 六、技术架构

### 6.1 技术选型

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + Vite |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| 样式 | CSS Variables + 原生 CSS（无 Tailwind） |
| 动画 | Framer Motion |
| TTS | Web Speech API (SpeechSynthesis) |
| 本地存储 | localStorage |
| 打包 | Capacitor → Android APK |

### 6.2 组件结构

```
src/
├── components/
│   ├── common/          # Button, Card, Modal, ProgressBar, Toast
│   ├── dictation/       # LetterKeyboard, AnswerSlot, FeedbackModal
│   ├── test/            # QuestionCard, OptionButton
│   └── reward/          # BadgeWall, StickerBook
├── pages/
│   ├── Home/
│   ├── LevelSelect/
│   ├── Practice/
│   ├── Test/
│   ├── WrongNotes/
│   ├── Rewards/
│   └── Profile/
├── hooks/
│   ├── useAudio.ts
│   ├── useProgress.ts
│   └── useRewards.ts
├── store/
│   └── index.ts         # Zustand store
├── data/
│   └── vocabulary.json  # 词库
└── utils/
    └── storage.ts       # localStorage 封装
```

### 6.3 localStorage 结构

```javascript
{
  "user_profile": { "name": "小明", "avatar": "🧒", "level": 3 },
  "learning_progress": {
    "completedWords": ["cat", "dog"],
    "wrongWords": [{ "word": "rabbit", "wrongAnswer": "rat", "count": 2 }]
  },
  "user_rewards": {
    "points": 1250,
    "badges": ["first_lesson", "learner_100"],
    "stickers": { "star": 23, "fire": 8 }
  },
  "app_settings": {
    "sound": true,
    "ttsSpeed": 0.8,
    "dailyGoal": 10
  },
  "last_login_date": "2026-03-27"
}
```

---

## 七、验收标准

- [ ] 4-10 岁儿童能独立完成一次听写流程
- [ ] 无网络环境下完整运行
- [ ] 答对/答错动效反馈及时
- [ ] 奖励系统积分计算正确
- [ ] 错题连续答对 2 次自动移出
- [ ] 所有圆角、字号、颜色符合设计规范
