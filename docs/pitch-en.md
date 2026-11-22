# Pitch (English, 3 minutes): Strange Shop 奇怪小店

Same story as the Chinese script (`docs/pitch.md`), cut to three minutes. About 430 spoken words
(roughly 2:40 at 160 words a minute), leaving about 20 seconds for the demo taps. The app's UI is in Chinese, so the
speaker translates the key lines on screen; the English for each one is written into the script.

**The one line:** Shopping apps push you one way: toward "buy". We flipped the direction.

| Time | Part |
|---|---|
| 0:00 | Hook: the thing in the corner |
| 0:20 | One direction: slides in, walls out |
| 1:00 | The reverse: Strange Shop |
| 1:20 | Live demo |
| 2:35 | Why it works |
| 2:50 | Close |

---

## Script

### 0:00 · Hook

> Quick show of hands. Who owns something you just *had* to have… and now it's sitting in a corner, collecting dust?
>
> *(Show the "one month later" photo of the dusty projector.)*
>
> Buying online now takes about one second.

### 0:20 · One direction

> Shopping apps push you one way: toward "buy".
>
> The way in is a **slide**: one-click checkout, buy now, pay later. A study in *Management Science* found that once shoppers turned on one-click buying, they bought more often, and they bought more.
>
> The way out is a **wall**. Refunds need a reason. The cancel button hides. Try to leave, and you get: "Wait! Here's a coupon."
>
> Slides and walls have one thing in common: neither asks you to think. The Nobel economist Richard Thaler has a word for design that pushes you against your own interest, whether it makes the bad choice easy or the good one hard: *sludge*.

### 1:00 · The reverse

> This track is Reverse UX. Most teams take something easy and make it painful. We reversed the **direction**.
>
> Meet Strange Shop. It looks like any online store. But tap "Buy now", and your purchase becomes a procurement request. Your wallet just got a manager.
>
> On the way to buying, we put **questions**. On the way out, we put **nothing**.

### 1:20 · Live demo

The speaker talks, a teammate taps. Pause on the four ★ moments.

> Let's buy a projector. About 2,700 yuan. **Buy now.**
>
> ★ And the slide stops. Orange turns into paperwork: *"Your purchase has been converted into a procurement request."*
>
> First, a wall, on purpose: an ad you have to shake to close, then three seconds to calm down.
>
> The form is all multiple choice. Why buy it? *"Everyone else has one."* Why not rent? *"Never thought about it."*
>
> ★ Rejected: *"'Everyone else has one' is not a reason. It's an excuse."* And a similar projector rents for ten yuan a day.
>
> We fix it and get approved. One last check before checkout: how many days of renting cost the same as buying? We guess wrong. ★ It's **273 days**.
>
> The manager signs off. *(Read the AI's remark off the screen, e.g. "I appreciate your honesty that it'll end up gathering dust. Approved.")*
>
> Now the other half. Same projector, **Buy now**, and this time: *"Never mind."* ★ One tap. No "are you sure?", no coupon. Just: *"You saved 2,728 yuan."*

### 2:35 · Why it works

> Two kinds of friction. The walls are satire. The questions are the point. Researchers call it *opportunity-cost neglect*: we forget what else the money could do, and a simple reminder makes us less likely to buy. Every question here is that reminder.
>
> And bad UX isn't bad code: rules make the decision, the AI only does the voice, and every price in the app is real.

### 2:50 · Close

> That's our reverse. Not easy-to-hard. We flipped the direction.
>
> Think three seconds before you buy. Walk away whenever you want.
>
> Scan the code and try to buy something. Good luck.

*(QR code on screen.)*

---

## If you're running long

Cut in this order:

1. The ad-and-calm sentence in the demo: say "There's an ad wall and a cool-down first; we'll skip those", and the teammate skips ahead.
2. The Thaler sentence at the end of "One direction".
3. The manager's remark: go straight from 273 days to "Now the other half."

Never cut the "Buy now → paperwork" moment or the "Never mind → you saved" moment. Those two are the reverse.

## Demo taps (for the teammate)

1. Shop → 米家投影仪 青春版2 → 立即购买
2. 开始办理 → 开始摇一摇 (or 点击关闭广告 ×30) → wait 3 s → 理性尚存，继续填表
3. Form: 用途 别人都有了 · 首次使用 本周内 · 频率 只用一次 · 为什么不租 没想过可以租 · 总价 2699 → 提交领导审批
4. 补充材料，重新提交: 用途 和朋友、家人一起用 · 频率 每周 · 不租 要长期用，租金会超过买价 · 不借 身边没人有 · 总价 2728.9 → 提交 → 去下单
5. Quiz: Q1 pick a wrong answer → 提交复核 → pick 273 天 · Q2 每周 · Q3 在角落安静吃灰 · Q4 想不起来买过什么 → 提交复核
6. 返回首页 → 米家投影仪 青春版2 → 立即购买 → 不买了

## Short answers for Q&A

- **What exactly did you reverse?** The direction. Normal shopping apps make buying easy and leaving hard. We make buying come with questions, and leaving free.
- **Who would use this? It doesn't make money.** Platforms won't build it, because it pushes the other way. But people already put brakes on themselves: screen-time limits, deleting shopping apps, card spending caps. This could be a "think-it-over mode" in a shopping app or a banking app.
- **Does it actually make people buy less?** We haven't tested that, so we won't claim it. Prior work suggests that asking people for reasons helps more than making them wait, which is why our friction is questions, not countdowns.

## The studies we cite out loud

All metadata checked against Crossref; see `paper/README.md` for the full list and PDFs.

- "A study in *Management Science*": Unal, M., & Park, Y.-H. (2023). Fewer Clicks, More Purchases. *Management Science*, 69(12), 7317–7334. https://doi.org/10.1287/mnsc.2023.4716
- "Richard Thaler … *sludge*" (both forms: discouraging what's in your interest, encouraging what defeats you): Thaler, R. H. (2018). Nudge, not sludge. *Science*, 361(6401), 431. https://doi.org/10.1126/science.aau9241
- "*Opportunity-cost neglect*": Frederick, S., Novemsky, N., Wang, J., Dhar, R., & Nowlis, S. (2009). Opportunity Cost Neglect. *Journal of Consumer Research*, 36(4), 553–561. Abstract
To properly consider the opportunity costs of a purchase, consumers must actively generate the alternatives that it would displace. The current research suggests that consumers often fail to do so. Even under conditions promoting cognitive effort, various cues to consider opportunity costs reduce purchase rates and increase the choice share of more affordable options. Sensitivity to such cues varies with chronic dispositional differences in spending attitudes. We discuss the implications of these results for the marketing strategies of economy and premium brands.

Checked against the abstracts (2026-11-22): every sentence we say about these three matches. One wording fix came out of it: Thaler's sludge covers both the slide and the wall, so the script now says that.
