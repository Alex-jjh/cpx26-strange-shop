# 团队协作指南（4 人 + AI）

目标：4 个人各自用 AI 并行开发，互相不打架，`main` 随时能拿去演示。

## 一、分工：每人一块，文件不重叠

| 角色 | 成员 | 负责什么 | 主要改动的文件 | 分支前缀 |
|---|---|---|---|---|---|
| **A 数据与素材** | CrazyMike | 10 个商品的真实价格、配件、运费、日租价；用 OneclickAMD 生成商品图和投影仪"吃灰"图 | `CRAZYMIKE/`（研究输入与生成脚本）→ 生成 `src/data/products.json`、`src/data/product-details.json`、`public/products/` | `data/` |
| **B 摩擦与小游戏** | mAw（ricoalyssa） | 打磨摇一摇验证；做第 4 处摩擦（如"领导出差中"排队、冷静期倒计时）；在 iPhone 和微信里实测 | `src/screens/ShakeGate.tsx`、新摩擦的页面文件、`src/device/` | `feat/` |
| **C AI 领导与部署** | Alex | 审批规则和难度；领导话术提示词；Vercel 部署和国内访问测试；可选的驳回排行榜 | `src/domain/`、`src/llm/`、`api/` | `feat/` |
| **D 视觉、海报与路演** | Helen | 页面视觉、回执和印章；用 Dify 的 AMD 插件做海报；路演稿和演示彩排 | `src/index.css`、`src/screens/Decision.tsx`、`Receipt.tsx`、`docs/pitch.md` | `ui/`、`docs/` |

**共享文件**：`src/App.tsx`、`src/flow.ts`、`src/domain/types.ts`，由 Alex 把关。改之前先在群里说一声，PR 请 Alex 看过再合并。新增页面一般都要动 `App.tsx` 和 `flow.ts`，每次只加一个 case，冲突会很小。

## 二、分支流程

```bash
# 1. 第一次：设置自己的提交身份（仓库是公开的，用个人邮箱或 GitHub noreply 邮箱）
git config user.name "你的名字"
git config user.email "你的邮箱"

# 2. 每次开始新任务：从最新的 main 拉一个分支
git switch main && git pull
git switch -c feat/cooldown-timer

# 3. 小步提交，按文件路径添加（不要 git add -A）
git add src/screens/Cooldown.tsx
git commit -m "Add cooldown timer friction"

# 4. 合并前：同步 main，跑三项检查
git fetch && git rebase origin/main
npm test && npm run build && npm run lint

# 5. 推送，开 Pull Request
git push -u origin feat/cooldown-timer
```

规则：

- **`main` 必须随时能演示。** 不往 `main` 直接推送，一律走 Pull Request。
- **分支要短。** 一个分支只做一件事，最好半天内合并，越拖冲突越多。
- **CI 不过不合并。** GitHub Actions 会自动跑测试、构建和代码检查。
- **合并方式选 Squash**，保持 `main` 的历史干净。
- 改了共享文件的 PR，至少请一位队友看一眼再合并；只改自己负责的文件，CI 通过就可以自己合并。

## 三、怎么让 AI 帮你干活

仓库根目录的 `AGENTS.md` 是写给 AI 看的规则，Claude Code、Codex、Cursor 都会自动读取。里面写了架构、不能破坏的约束和必须跑的检查。

给 AI 布置任务时，这样说效果最好：

> 我是 mAw，负责 B（摩擦与小游戏）。任务：在提交审批后加一个"冷静期"页面，倒计时 30 秒才能继续。
> 只改 `src/screens/` 下的新文件，`App.tsx` 和 `flow.ts` 里只加必要的 case。
> 做完跑 `npm test && npm run build && npm run lint`。

注意事项：

1. **先说清楚你负责哪一块、只能改哪些文件。** 否则 AI 很容易顺手"优化"别人的文件，制造冲突。
2. **提交前自己看一遍改动**（`git diff`）。AI 有时会顺手重排整个文件、删掉注释、改掉不相关的地方，这些都要撤回。
3. **不要把 API key、兑换码贴进 AI 对话里。** key 只配在 Vercel 的环境变量里。
4. **路演流程测试不能红。** `src/domain/review.test.ts` 锁定了路演那条流程。AI 说"测试过不了，我把测试改了"时要警惕，先确认是不是真的想改路演流程。
5. **审批结果永远由规则决定**，AI 领导只负责措辞。不要让 AI 把审批改成"让大模型判断批不批"，否则现场演示结果会不稳定。

## 四、时间节点（按实际赛程调整）

| 节点 | 完成标准 |
|---|---|
| M1 主流程定型 | 真实商品数据、商品图到位；部署成功，国内手机能打开 |
| M2 摩擦齐全 | 4 处摩擦全部可用；iPhone、安卓、微信都实测过 |
| M3 海报和路演 | 海报定稿；路演完整彩排两遍 |
| **代码冻结**（演示前 2 小时） | 之后只修 bug，不加功能；冻结时的 `main` 打上 tag，APK 也从这个版本打包 |

## 五、每天同步一次（5 分钟）

每人说三句：做完了什么、接下来做什么、卡在哪里。顺便确认今天要动哪些共享文件。
