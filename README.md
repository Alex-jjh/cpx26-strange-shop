# 个人采购 OA（CPX 2026 · 赛道二 逆向 UX）

把购物结账变成个人采购审批：通过真人验证、填写采购申请单、获得 AI 领导批准，才能模拟下单。

## 三处摩擦

| # | 摩擦 | 类型 | 代码 |
|---|---|---|---|
| 1 | 真人验证：摇一摇 8 次，不支持就点 30 次 | 讽刺无意义的摩擦 | `src/screens/ShakeGate.tsx` |
| 2 | 采购申请单：用途、首次使用日期、频率、租/借/现有替代、总价 | 有用的摩擦 | `src/screens/ProcurementForm.tsx` |
| 3 | 领导驳回与复审：补材料、换方案或撤回 | 两者兼有 | `src/screens/Decision.tsx` |

## 路演流程（已用自动化走通）

1. 首页点「家用投影仪」→「申请采购」→ 完成真人验证。
2. 填写：用途「周末看一场球赛」，频率「只用一次」，总价填标价 2499，替代方案留空 → 提交。
3. **被驳回**：总价没算配件和运费；只用一次，为什么不租？
4. 补充材料：频率改「每周」，「为什么不租」填理由，总价改为 2667 → 再次提交。
5. 审批通过 → 模拟下单 → 审批回执（带印章）。

## 关键设计

- **批还是不批由规则决定**（`src/domain/review.ts`），保证演示稳定。LLM 只把驳回意见改写成"领导口吻"；断网或没配 key 时退回规则原文，流程不受影响。
- 「难缠领导」档额外检查：首次使用须在 14 天内；租、借、现有替代至少论证两项。
- 设备能力（震动、通知、摇一摇）统一走 `src/device/`。App 里调 Capacitor 插件，网页里调浏览器接口，不支持就静默跳过。
- 商品数据在 `src/data/products.json`。`source: null` 表示示例价格，页面上会显示"待采集"标签。

## 开发

```bash
npm install
npm run dev       # 本机 http://localhost:5173
npm test          # 规则与数据测试
npm run build
```

手机真机调试不要用 `--host` 暴露到局域网。请部署一个 Vercel 预览地址（自带 HTTPS，摇一摇也需要 HTTPS）。

## 部署（Vercel）

1. 导入仓库，框架选 Vite。
2. 在项目环境变量里配置 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`（见 `.env.example`）。**key 只放服务端，绝不能放进前端或提交到仓库。**
3. 在模型平台上给这个 key 设一个消费上限。`api/leader-voice.ts` 的限流只是尽力而为，按实例计数。

`api/leader-voice.ts` 是公开接口（评委扫码就能用），但不是通用 LLM 代理：只接受固定的规则编号和不超过 40 字的商品名，提示词在服务端拼出来。

## 安卓 APK（Capacitor）

需要 JDK 和 Android SDK，建议在装了 Android Studio 的电脑上操作：

```bash
VITE_API_BASE=https://<你的部署域名> npm run build
npx cap add android      # 只需执行一次
npx cap sync android
npx cap open android     # 在 Android Studio 里运行或打包
```

## 待办

- [ ] 采集 10 个商品的真实价格、配件、运费、日租价，填上 `source`
- [ ] 商品图（建议用 AMD 图像生成），放进 `public/products/`；投影仪另加一张"吃灰"图
- [ ] 在微信内置浏览器和 iPhone 上实测摇一摇
- [ ] 海报（Dify 的 AMD 插件）
