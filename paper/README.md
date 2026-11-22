# 文献清单与 PDF（逆向 UX：好的摩擦 vs 坏的摩擦）

整理日期：2026-11-21。PDF 用 **Git LFS** 存放在本目录（仓库是私有的，仅供组内阅读，不要外传）。

## 组员：怎么放 PDF

```bash
git lfs install                # 每台电脑只需一次
git switch main && git pull
git switch -c docs/papers-<你的名字>
# 把 PDF 按下表的文件名放进 paper/，然后：
git add paper/<文件名>.pdf
git commit -m "Add <ID> PDF"
git push -u origin docs/papers-<你的名字>   # 开 PR，Alex 合并
```

- `paper/*.pdf` 已经设置为走 LFS（见仓库根目录 `.gitattributes`），正常 `git add` 即可，不用额外操作。
- **文件名严格按下表**，取到一篇就在「已取」一栏打勾，跟 PDF 一起提交。
- 读完顺手核对一下「讲了什么」那一栏，写错了直接改。
- 取不到全文（付费墙）就在「备注」里写明，不要放盗版。

## 待取 PDF

| ID | 文件名 | 链接 | 已取 | 备注 |
|---|---|---|---|---|
| A1 | `A1-thaler-2018-nudge-not-sludge.pdf` | https://doi.org/10.1126/science.aau9241 | [ ] | |
| A2 | `A2-sunstein-2022-sludge-audits.pdf` | https://doi.org/10.1017/bpp.2019.32 | [ ] | |
| A3 | `A3-gray-2018-dark-patterns-ux.pdf` | https://doi.org/10.1145/3173574.3174108 | [ ] | |
| A4 | `A4-mathur-2019-dark-patterns-at-scale.pdf` | https://doi.org/10.1145/3359183 | [ ] | 作者主页有免费版 |
| B1 | `B1-cox-2016-design-frictions.pdf` | https://doi.org/10.1145/2851581.2892410 | [ ] | ⭐ 最核心 |
| B2 | `B2-mejtoft-2019-design-friction.pdf` | https://doi.org/10.1145/3335082.3335106 | [ ] | |
| B3 | `B3-caraban-2019-23-ways-to-nudge.pdf` | https://doi.org/10.1145/3290605.3300733 | [ ] | |
| B4 | `B4-hallnas-2001-slow-technology.pdf` | https://doi.org/10.1007/PL00000019 | [ ] | |
| B5 | `B5-baumer-2014-reviewing-reflection.pdf` | https://doi.org/10.1145/2598510.2598598 | [ ] | |
| C1 | `C1-unal-2023-fewer-clicks-more-purchases.pdf` | https://doi.org/10.1287/mnsc.2023.4716 | [ ] | ⭐ 问题陈述 |
| C2 | `C2-moser-2019-impulse-buying-chi.pdf` | https://doi.org/10.1145/3290605.3300472 | [ ] | ⭐ |
| C3 | `C3-moser-thesis-impulse-buying.pdf` | 密歇根大学 Deep Blue 仓库搜作者 Carol Moser | [ ] | 会议纪要 [2]，结论待核对 |
| C4 | `C4-rook-1987-buying-impulse.pdf` | https://doi.org/10.1086/209105 | [ ] | |
| C5 | `C5-hoch-1991-time-inconsistent-preferences.pdf` | https://doi.org/10.1086/208573 | [ ] | |
| C6 | `C6-baumeister-2002-yielding-to-temptation.pdf` | https://doi.org/10.1086/338209 | [ ] | 慎用，只作背景 |
| D1 | `D1-frederick-2009-opportunity-cost-neglect.pdf` | https://doi.org/10.1086/599764 | [ ] | ⭐ 对应「为什么不租/借」 |
| D2 | `D2-lord-1984-considering-the-opposite.pdf` | https://doi.org/10.1037/0022-3514.47.6.1231 | [ ] | |
| D3 | `D3-thaler-1985-mental-accounting.pdf` | https://doi.org/10.1287/mksc.4.3.199 | [ ] | 对应复核单「回本测算」 |
| D4 | `D4-prelec-1998-red-and-black.pdf` | https://doi.org/10.1287/mksc.17.1.4 | [ ] | |
| D5 | `D5-wilson-2005-affective-forecasting.pdf` | https://doi.org/10.1111/j.0963-7214.2005.00355.x | [ ] | 对应「一个月后」 |
| D6 | `D6-gollwitzer-1999-implementation-intentions.pdf` | https://doi.org/10.1037/0003-066X.54.7.493 | [ ] | |

优先取 ⭐ 的五篇，海报和路演主要靠它们。

---

**核对说明**
- 每条的作者、年份、标题、出处、DOI 都已经用 Crossref 元数据逐条核对过，标 ✅。
- 「讲了什么」「支撑我们哪一点」两栏是根据我对这些文献的了解写的，**没有逐篇读过原文**。上海报、写进路演稿之前，请至少打开原文摘要核对一遍结论。
- 标 ⚠️ 的条目有额外的注意事项。
- 标 📄 的条目，「讲了什么」已经对照摘要核对过（2026-11-22）。

---

## 一句话论点（海报用）

> 现实中的购物摩擦大多是 **sludge**：浪费时间、引诱消费，比如摇一摇开屏广告、人机验证。电商的另一面又在拼命**去掉摩擦**：一键下单让人买得更多。
> 我们一边夸张地模仿前者来讽刺它，一边把摩擦放在**下单前那一刻**，变成帮人想清楚的问题：为什么不租、算一算回本、一个月后它在哪。

---

## A. 两种摩擦：坏的 sludge 与暗黑模式（讽刺层的依据）

| # | 文献 | 讲了什么 | 支撑我们哪一点 |
|---|---|---|---|
| A1 ✅📄 | Thaler, R. H. (2018). Nudge, not sludge. *Science*, 361(6401), 431. https://doi.org/10.1126/science.aau9241 | nudge 帮人做出"自己认为"更好的选择；sludge 是"为恶的助推"，有两种：**阻止你做对自己有利的事**（例：返现要寄表格、收据、条码，大多数人懒得领，却仍被返现吸引去买，他称之为 buy bait），以及**怂恿你做对自己不利的事**。正好对应我们的墙和滑梯 | **核心框架**：我们的"讽刺层"（全屏广告、摇一摇、首次一律退回）就是在夸张模仿 sludge |
| A2 ✅ | Sunstein, C. R. (2022). Sludge audits. *Behavioural Public Policy*, 6(4), 654–673. https://doi.org/10.1017/bpp.2019.32 | 主张系统地审查、清理流程中的 sludge | 为什么要把坏摩擦"夸张给人看" |
| A3 ✅ | Gray, C. M., Kou, Y., Battles, B., Hoggatt, J., & Toombs, A. L. (2018). The Dark (Patterns) Side of UX Design. *CHI '18*, 1–14. https://doi.org/10.1145/3173574.3174108 | 暗黑模式分类：唠叨（nagging）、阻碍（obstruction）、偷塞（sneaking）、界面干扰、强迫行为 | 全屏广告、强制小游戏分别对应"界面干扰""强迫行为"，可以在海报上直接标出 |
| A4 ✅ | Mathur, A., Acar, G., Friedman, M. J., Lucherini, E., Mayer, J., Chetty, M., & Narayanan, A. (2019). Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites. *Proc. ACM HCI*, 3(CSCW), 1–32. https://doi.org/10.1145/3359183 | 爬取了约 1.1 万个购物网站，发现相当一部分在用暗黑模式（具体比例请核对原文） | 说明"购物页面在操纵你"不是我们编的，是规模化的现实 |

## B. 好的摩擦：HCI 里的有益摩擦和反思设计（有用层的依据）

| # | 文献 | 讲了什么 | 支撑我们哪一点 |
|---|---|---|---|
| B1 ✅ | Cox, A. L., Gould, S. J. J., Cecchinato, M. E., Iacovides, I., & Renfree, I. (2016). Design Frictions for Mindful Interactions: The Case for Microboundaries. *CHI EA '16*, 1389–1397. https://doi.org/10.1145/2851581.2892410 | 提出"微边界"：在自动化的操作之前加一个小障碍，让人从自动驾驶切换到有意识的决定 | **最直接的依据**：采购申请单、复核单就是放在下单前的微边界 |
| B2 ✅ | Mejtoft, T., Hale, S., & Söderström, U. (2019). Design Friction. *ECCE 2019*, 41–44. https://doi.org/10.1145/3335082.3335106 | 把摩擦当作一种可以刻意设计、可以带来正面效果的手段 | 逆向 UX 不等于坏 UX：摩擦是可以设计的 |
| B3 ✅ | Caraban, A., Karapanos, E., Gonçalves, D., & Campos, P. (2019). 23 Ways to Nudge: A Review of Technology-Mediated Nudging in HCI. *CHI '19*, 1–15. https://doi.org/10.1145/3290605.3300733 | 综述 HCI 中 23 种助推机制，其中包括增加摩擦一类 | 把我们的每处设计对到一种已知机制上 |
| B4 ✅ | Hallnäs, L., & Redström, J. (2001). Slow Technology – Designing for Reflection. *Personal and Ubiquitous Computing*, 5(3), 201–212. https://doi.org/10.1007/PL00000019 | "慢技术"：为反思而设计，而不是为效率而设计 | "冷静 3 秒""领导审阅中"这些慢下来的环节 |
| B5 ✅ | Baumer, E. P. S., Khovanskaya, V., Matthews, M., Reynolds, L., Schwanda Sosik, V., & Gay, G. (2014). Reviewing Reflection: On the Use of Reflection in Interactive System Design. *DIS '14*, 93–102. https://doi.org/10.1145/2598510.2598598 | 综述交互系统里"支持反思"的设计 | 复核单里两道反思题（一个月后、上一次冲动消费） |

## C. 冲动购物与电商（问题本身）

| # | 文献 | 讲了什么 | 支撑我们哪一点 |
|---|---|---|---|
| C1 ✅📄 | Unal, M., & Park, Y.-H. (2023). Fewer Clicks, More Purchases. *Management Science*, 69(12), 7317–7334. https://doi.org/10.1287/mnsc.2023.4716 | 一家线上零售商 35 个月的准实验数据：用户开通一键购买后，购买更频繁、件数更多；效应持续，且因人而异；机制是访问和浏览更多、跨品类买得更多（会议纪要 [1]） | **问题陈述**：去掉摩擦会让人买更多，所以我们要把摩擦放回来 |
| C2 ✅ | Moser, C., Schoenebeck, S. Y., & Resnick, P. (2019). Impulse Buying: Design Practices and Consumer Needs. *CHI '19*, 1–15. https://doi.org/10.1145/3290605.3300472 | 分析购物网站中助长冲动购物的设计，并调查消费者想要什么样的自控支持 | HCI 领域研究"冲动购物 × 界面设计"的直接对口文献 |
| C3 ⚠️ | Moser, C. 的博士论文 *Impulse Buying: Designing for Self-Control with E-commerce*（University of Michigan, UMSI） | 会议纪要 [2] 引用：列出买与不买的理由能降低自报冲动和购买意愿；十分钟等待没有显著减少实际冲动购买 | **Crossref 查不到学位论文，元数据和结论都未核对**，请到密歇根大学的 Deep Blue 仓库找原文。Crossref 上能查到她 2018 年的一篇 CHI 扩展摘要：https://doi.org/10.1145/3170427.3173026 |
| C4 ✅ | Rook, D. W. (1987). The Buying Impulse. *Journal of Consumer Research*, 14(2), 189–199. https://doi.org/10.1086/209105 | 冲动购买的经典定义：突然、强烈、持续的立刻要买的冲动 | 定义我们要对抗的对象 |
| C5 ✅ | Hoch, S. J., & Loewenstein, G. F. (1991). Time-Inconsistent Preferences and Consumer Self-Control. *Journal of Consumer Research*, 17(4), 492–507. https://doi.org/10.1086/208573 | 偏好会随时间变化，"现在想要"和"冷静后想要"不一样；讨论消费者的自控策略 | 为什么要延迟、冷静、二次确认（首次一律退回、冷静 3 秒） |
| C6 ⚠️ | Baumeister, R. F. (2002). Yielding to Temptation: Self-Control Failure, Impulsive Purchasing, and Consumer Behavior. *Journal of Consumer Research*, 28(4), 670–676. https://doi.org/10.1086/338209 | 从自控失败的角度解释冲动购买 | **慎用**：文中依赖的"自我损耗"（ego depletion）理论近年复现结果很差，最多当背景引用，不要拿它当证据 |

## D. 我们每处"有用摩擦"背后的消费心理（逐项对应）

| # | 文献 | 讲了什么 | 对应 App 里的哪个设计 |
|---|---|---|---|
| D1 ✅📄 | Frederick, S., Novemsky, N., Wang, J., Dhar, R., & Nowlis, S. (2009). Opportunity Cost Neglect. *Journal of Consumer Research*, 36(4), 553–561. https://doi.org/10.1086/599764 | 要考虑机会成本，消费者得自己主动想出"这笔钱还能干什么"，但他们常常不想；各种提醒线索会降低购买率，并让人更倾向便宜的选项（即使在鼓励认真思考的条件下也成立） | **「为什么不租 / 不借 / 现有的东西不行」**三栏，以及第五条（替代方案） |
| D2 ✅ | Lord, C. G., Lepper, M. R., & Preston, E. (1984). Considering the Opposite: A Corrective Strategy for Social Judgment. *Journal of Personality and Social Psychology*, 47(6), 1231–1243. https://doi.org/10.1037/0022-3514.47.6.1231 | "反向思考"能减少判断偏差 | 要求为"不买"的选项写理由 |
| D3 ✅ | Thaler, R. (1985). Mental Accounting and Consumer Choice. *Marketing Science*, 4(3), 199–214. https://doi.org/10.1287/mksc.4.3.199 | 心理账户：人们按类别给钱记账，同一笔钱换个框架感受就不同 | 复核单把"2728.90 元"换算成"租满 273 天才回本""每用一次约 X 元" |
| D4 ✅ | Prelec, D., & Loewenstein, G. (1998). The Red and the Black: Mental Accounting of Savings and Debt. *Marketing Science*, 17(1), 4–28. https://doi.org/10.1287/mksc.17.1.4 | "付款之痛"，以及付款和消费在心理上的耦合 | 单次成本题；也能用来讽刺复核单里的选项"0 元（花呗分期，不算花钱）" |
| D5 ✅ | Wilson, T. D., & Gilbert, D. T. (2005). Affective Forecasting: Knowing What to Want. *Current Directions in Psychological Science*, 14(3), 131–134. https://doi.org/10.1111/j.0963-7214.2005.00355.x | 人们会高估未来某件事带来的情绪有多强、能持续多久 | 复核单"一个月后它在哪"，以及商品页的"一个月后"吃灰图 |
| D6 ✅ | Gollwitzer, P. M. (1999). Implementation Intentions: Strong Effects of Simple Plans. *American Psychologist*, 54(7), 493–503. https://doi.org/10.1037/0003-066X.54.7.493 | "如果……就……"式的具体计划能显著提高执行率 | 申请单里的「首次使用日期」，以及 AI 批示里的可执行建议（"下周五就点亮家庭电影夜"） |

## 不要用

| 文献 | 原因 |
|---|---|
| ❌ Ariely, D., & Wertenbroch, K. (2002). Procrastination, Deadlines, and Performance: Self-Control by Precommitment. *Psychological Science*, 13(3), 219–224. https://doi.org/10.1111/1467-9280.00441 | **已撤稿**：Crossref 记录的标题前标着 RETRACTED。本来想用它支撑"预先承诺"（用户自愿给自己装上这套 OA），换别的文献 |

---

## 按 App 功能查文献（路演答辩用）

| App 里的设计 | 层 | 可引用 |
|---|---|---|
| 全屏广告 + 摇一摇关闭 | 讽刺 | A1 Thaler、A3 Gray、A4 Mathur |
| 首次申请一律退回、领导审阅中 | 讽刺 + 冷静 | A1、C5 Hoch & Loewenstein |
| 冷静 3 秒 | 有用 | B4 Hallnäs & Redström、C5 |
| 采购申请单（用途、替代方案） | 有用 | B1 Cox、D1 Frederick、D2 Lord |
| 复核单：回本测算、单次成本 | 有用 | D3 Thaler、D4 Prelec & Loewenstein |
| 复核单：一个月后、上一次冲动消费 | 有用 | B5 Baumer、D5 Wilson & Gilbert |
| AI 批示里的可执行建议 | 有用 | D6 Gollwitzer |
| 整体立意：一键下单让人买更多 | 问题 | C1 Unal & Park、C2 Moser |

## 还可以补的方向（未检索）

- 国内电商的具体证据：直播带货、"砍一刀"、"先用后付"，最好有中文实证研究。
- 冷静期（cooling-off period）相关的法律和行为研究，比如七天无理由退货政策。
- 先买后付（BNPL）对冲动消费的影响，可以接上复核单里"花呗分期"那个梗。
