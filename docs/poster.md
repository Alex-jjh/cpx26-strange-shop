# 海报架构（英文海报）

海报和英文路演稿（`docs/pitch-en.md`）是同一条线：讲到哪一段，就指向哪一块。
负责人：Helen（D）。海报上的文字是**最终英文文案**，可以直接用；括号里的中文是给我们自己看的说明。

---

## 0. 三条原则

1. **3 秒测试**：评委从两米外走过，只看标题区和 ③ 那张对照图，就能知道我们做了什么："把购物 App 的方向倒过来"。
2. **按路演顺序排**：① → ② → ③ → ④ → ⑤ → ⑥，从上到下、从左到右，和讲稿的段落一一对应。现场演示出问题时，对着 ④ 的截图就能把故事讲完。
3. **只说站得住的话**：数字和文献都有出处；不写"让人少买了多少"这种我们没测过的结论。

## 1. 尺寸和格式

- **先向主办方确认**海报尺寸和交付格式（打印还是屏幕展示）。没有说明的话，默认 **A1 竖版（594 × 841 mm）**，按 300 dpi 制作，导出 PDF 和 PNG 各一份。
- 如果是屏幕展示（比如 16:9 大屏），把下面的版式改成左右两栏：左栏放 ① ② ③，右栏放 ④ ⑤ ⑥。
- 四周留白 30 mm，各块之间间距 15 mm。

## 2. 版式（A1 竖版）

```
┌──────────────────────────────────────────────┐  ← 约 14% 高
│ ① HEADER                                      │
│  Strange Shop 奇怪小店                         │
│  Shopping apps push you one way. We flipped it.│
├──────────────────────┬───────────────────────┤  ← 约 22% 高
│ ② ONE DIRECTION      │ ③ OUR REVERSE（最大） │
│  slide / wall        │  2×2 对照图            │
│  吃灰投影仪 + 数据   │                        │
├──────────────────────┴───────────────────────┤  ← 约 30% 高
│ ④ TRY TO BUY A PROJECTOR                       │
│  [1]  →  [2]  →  [3]  →  [4]  →  [5]          │
│  5 张手机截图 + 每张一句英文说明               │
├──────────────────────┬───────────────────────┤  ← 约 22% 高
│ ⑤ TWO KINDS OF       │ ⑥ BAD UX ≠ BAD CODE   │
│   FRICTION           │  4 条要点 + 二维码     │
├──────────────────────┴───────────────────────┤  ← 约 6% 高
│ References · Team · Built with AMD            │
└──────────────────────────────────────────────┘
```

③ 比 ② 宽一些（大约 6:4），因为它是整张海报的核心。

## 3. 视觉规范

**两个世界，两套颜色**，和 App 里完全一致：

| 用途 | 颜色 | 用在哪里 |
|---|---|---|
| 购物世界（滑梯） | 橙红 `#f5601f` → `#d63a0e`，价格红 `#d92b17`，暖灰底 `#f6f2ec` | ② 的"slide"、③ 的"Normal shopping app"一栏 |
| 审批世界（问题） | 公文蓝 `#1f4e8c`，冷灰底 `#eceff3`，白纸 `#ffffff`，线条 `#cfd5de` | ③ 的"Strange Shop"一栏、⑤、⑥ |
| 驳回 / 墙 | 红 `#c62828` | ⑤ 的"Walls"、驳回章 |
| 同意 / 省下的钱 | 绿 `#2e7d32` | ④ 第 5 张截图的说明、"You saved" |
| 正文 | 近黑 `#1d1d1f`，次要文字 `#5a606b` | 全部 |

**字体**：英文用 Inter 或 Source Sans；截图里的中文是 App 原样，不用另配中文字体。

**A1 字号**（最小不低于 24 pt，两米外要看得清）：

| 层级 | 字号 |
|---|---|
| 标题 Strange Shop 奇怪小店 | 140 pt |
| 一句话标语 | 54 pt |
| 各块标题 | 48 pt |
| 要点文字 | 30–34 pt |
| 截图说明 | 28 pt |
| 引用、页脚 | 22–24 pt |

## 4. 每一块的内容

### ① Header

- **Title**：`Strange Shop 奇怪小店`
- **Tagline**：`Shopping apps push you one way: toward "buy". We flipped the direction.`
- **Small line**：`CPX 2026 · Track 2: Reverse UX · Team <队名>`
- 视觉：标题左边放一个小图标：橙色购物袋上盖一个蓝色"申请"章（用 AMD 生成，见第 6 节）。

**讲稿对应**：开场和结尾都指这里。

### ② One direction（问题）

- **Heading**：`Shopping apps only push one way`
- **Slide**（橙色小标题）：`The way in is a slide.` 下面一行：`One-click checkout. Buy now, pay later.`
- **Data callout**（大一号）：`After shoppers adopt one-click buying, they buy more often and buy more items.`
  出处小字：`Unal & Park, Management Science (2023)`
- **Wall**（红色小标题）：`The way out is a wall.` 下面一行：`Refunds need a reason. Cancel buttons hide. "Wait! Here's a coupon."`
- **Punchline**：`Neither one asks you to think.`
- **Quote**（斜体小字）：`"This 'sludge' just mucks things up and makes wise decision-making … more difficult."` `— Richard Thaler, Science (2018)`
- **Image**：吃灰投影仪图，说明 `One month later.`（如果用的是 AI 生成图，加一行极小字 `AI-generated illustration`）

**讲稿对应**："One direction" 一段。

### ③ Our reverse（核心，最大）

- **Heading**：`Our reverse: flip the direction`
- **2×2 对照图**（左栏橙色、右栏蓝色）：

| | Normal shopping app | Strange Shop |
|---|---|---|
| **Buying** | A slide. One tap, no questions. | Questions first. Every purchase becomes a request. |
| **Leaving** | A wall. Reasons, retention pop-ups, coupons. | Nothing. One tap: "Never mind." No "are you sure?" |

- **图下一句**：`On the way to buying, we put questions. On the way out, we put nothing.`

画法建议：四格用两种底色（左橙右蓝），"Buying"一行画一个向下的滑梯箭头（左）和一个问号路牌（右），"Leaving"一行画一堵墙（左）和一扇敞开的门（右）。插画用 AMD 生成。

**讲稿对应**："The reverse" 一段。

### ④ Try to buy a projector（演示）

- **Heading**：`Try to buy a projector`
- 五张截图横排，之间用箭头连接；每张下面一句英文说明（28 pt）：

| # | 截图（见第 5 节） | 英文说明 |
|---|---|---|
| 1 | 商品页 | `Looks like any store. Big orange "Buy now".` |
| 2 | 转为采购申请 | `"Buy now" doesn't pay. It files a request.` |
| 3 | 驳回 | `"'Everyone else has one' is not a reason. It's an excuse."` |
| 4 | 复核单答错 | `How many days of renting cost the same as buying? 273.` |
| 5 | 不买了 | `Never mind. One tap. You saved ¥2,728.90.`（绿色） |

- 第 2 张和第 3 张之间加一个小标注（只用文字，不放广告截图，那是真实品牌的广告）：`+ a full-screen ad you shake to close (a wall, on purpose)`

**讲稿对应**：Live demo 一段。第 2 张和第 5 张就是 reverse 的两半，讲的时候点这两张。

### ⑤ Two kinds of friction（设计逻辑）

- **Heading**：`Two kinds of friction`
- **左半：Walls**（红色小标题 `Walls: satire`）
  - `A full-screen ad you shake to close`
  - `Every first application is sent back, "to show prudence"`
  - `"The manager is reviewing…"`
  - 一句总结：`We exaggerate what apps already do to you.`
- **右半：Questions**（蓝色小标题 `Questions: the point`）
  - `Why do you need it?`
  - `Why not rent or borrow?`
  - `How many days until buying beats renting?`
  - `Where will it be in a month?`
  - 一句总结：`Each question reminds you of something we forget when we buy: what else the money could do, the real total, and our future self.`
- **引用**（小字）：`Simple cues to consider opportunity costs reduce purchase rates. — Frederick et al., Journal of Consumer Research (2009)`

**讲稿对应**："Why it works" 前半段。

### ⑥ Bad UX ≠ bad code（实现 + 二维码）

- **Heading**：`Bad UX ≠ bad code`
- 四条要点：
  - `Rules decide, AI only speaks.` 下面小字：`Approval is rule-based, so it is fair and reproducible. The AI writes the manager's voice from your own answers.`
  - `Real data.` 下面小字：`25 real products, prices and rental terms, each with a source and a capture date.`
  - `Works offline.` 下面小字：`No network? The app falls back to the rule text and still runs end to end.`
  - `Built for phones.` 下面小字：`Mobile web app; open it from the QR code.`
- **二维码**（至少 40 × 40 mm）：指向 `https://cpx26-strange-shop.vercel.app/`，旁边写 `Scan and try to buy something.`

**讲稿对应**："Why it works" 后半段和结尾。

### 页脚

- **References**（22 pt，一行一条）：
  - Unal, M., & Park, Y.-H. (2023). Fewer Clicks, More Purchases. *Management Science*, 69(12), 7317–7334.
  - Thaler, R. H. (2018). Nudge, not sludge. *Science*, 361(6401), 431.
  - Frederick, S., et al. (2009). Opportunity Cost Neglect. *Journal of Consumer Research*, 36(4), 553–561.
- **Team**：`Alex · CrazyMike · mAw · Helen`（按需要加角色）
- **Built with**：`Poster created with the AMD plugin in Dify` 以及用到的其他 AMD 工具

海报上**只放这三篇**：它们的内容已经对照摘要核对过（见 `paper/README.md` 里的 📄）。其他文献核对过摘要之后再加。

## 5. 截图清单

印刷用截图在 `docs/poster/screens/`，按 390 × 844 的手机视图、3 倍分辨率（1170 × 2532 像素）拍摄：

| 文件 | 内容 | 用在 |
|---|---|---|
| `1-product.png` | 商品页：投影仪、红色价格、底部「立即购买」 | ④-1 |
| `2-converted.png` | 转为采购申请，顶部有「不买了」 | ④-2 |
| `3-rejected.png` | 驳回页，红色驳回章，第二条"不是用途，是借口" | ④-3 |
| `4-quiz-wrong.png` | 复核单答错，"2728.90 ÷ 10 ≈ 273 天" | ④-4 |
| `5-withdrawn.png` | 不买了，"本次省下 ¥2728.90" | ④-5 |
| `6-receipt.png` | 审批回执和公章 | 备用 |

截图是本地运行时拍的，没有连 AI，所以驳回意见显示的是规则原文。这样反而更稳定，每次拍出来都一样。想换成 AI 话术的版本，就在线上地址手动截图。

摆进海报时，每张截图外面套一个简单的手机边框（圆角矩形就行），不要用某个具体品牌的手机外形。

## 6. 用 AMD 插件生成（赛题要求）

赛题要求海报必须用 Dify 的 AMD 插件生成，之后可以编辑。AI 生成图片时排文字（尤其是中文）通常不可靠，所以分工是：**AMD 负责版式和视觉素材，文字、截图、二维码之后手动排上去。**

1. **在 Dify 里用 AMD 插件生成海报底稿**，提示词参考：

   > A clean, modern A1 portrait poster layout for a student hackathon project called "Strange Shop". Two visual worlds side by side: a warm orange-red online shopping world on the left (a playful slide leading to a shopping cart) and a calm blue-grey government-office paperwork world on the right (forms, a round red stamp, a question-mark sign). Flat illustration style, lots of white space, clear panel grid with a large header area, a wide central comparison area, a horizontal strip for five phone screenshots, and two lower panels. No text, no logos, no brand names.

2. **单独生成几张插画**（同样不要文字）：
   - 滑梯通向购物车（③ 左上格）
   - 写着问号的路牌立在滑梯中间（③ 右上格）
   - 一堵墙挡在出口前（③ 左下格）
   - 一扇敞开的门（③ 右下格）
   - 一个月后落灰的投影仪（②）。顺带解决一个遗留问题：现在 App 里的吃灰图不是用 AMD 生成的，用 OneclickAMD 重做一张，App 和海报都换上。
3. **在设计工具里**（Figma、Canva、Keynote 都行）把底稿当背景，按第 4 节排文字，放截图和二维码。
4. **留存证明**：保存每次 AMD 生成的提示词、生成结果截图、导出文件，放进 `docs/poster/amd/`。评审要查时能拿出来。

## 7. 打印前检查

- [ ] 两米外能看清标题和 ③ 的对照图
- [ ] 所有文字不小于 24 pt
- [ ] 数字和 App 一致：¥2,699、¥2,728.90、273 days、¥10/day
- [ ] 三条引用的作者、年份、期刊和页脚一致
- [ ] 二维码用手机实测能打开
- [ ] 没有任何真实品牌的 Logo 或广告图（App 里的全屏广告目前是真实品牌截图，**不要放进海报**）
- [ ] AMD 生成记录已存到 `docs/poster/amd/`
- [ ] 导出 PDF（打印用）和 PNG（线上提交用）
