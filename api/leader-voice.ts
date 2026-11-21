// Vercel serverless function: rewrites rule findings in the "AI leader" voice.
//
// Public, unauthenticated by design (judges scan a QR code). It is NOT a general LLM proxy:
// the client sends only a catalog product id and rule ids from a fixed list — no free text —
// and the prompt is built here from the server's own copy of the catalog (see ./_prompt.ts).
// The API key lives only in server env vars.
//
// Env: LLM_API_KEY (required), LLM_BASE_URL (OpenAI-compatible, e.g. https://aihubmix.com/v1),
//      LLM_MODEL, ALLOWED_ORIGINS (comma-separated, for the Capacitor app / preview URLs).

import catalog from '../src/data/products.json' with { type: 'json' }
import type { Product, RuleId } from '../src/domain/types.ts'

const products = catalog as Product[]

// --- Prompt ---
// Framing: this is PERSONAL shopping. There is no company — the app only borrows the tone of a
// corporate OA approval as satire. The leader may only ask for fields that exist on the form,
// and it cannot see what the user typed (the client sends rule ids only), so it must not quote it.

const RULE_TEXT: Record<RuleId, string> = {
  'purpose-too-short': '「采购用途」写得太简略，看不出要用它做什么',
  'total-mismatch': '「申报总价」不对：没把必需配件和运费算进去',
  'why-not-rent': '使用频率填了「只用一次」，却没在「为什么不租？」里说明理由',
  'first-use-too-far': '「首次使用日期」在两周以后，现在买为时过早',
  'alternatives-missing': '「为什么不租 / 不借 / 现有的东西不行」三项里，至少要认真回答两项',
}

export const RULE_IDS = Object.keys(RULE_TEXT) as RuleId[]

const FORM_FIELDS = '采购用途、首次使用日期、预计使用频率、为什么不租、为什么不借、为什么现有的东西不行、申报总价'

export function buildPrompt(product: Product, rules: RuleId[], attempt: number): string {
  const required = product.accessories.filter((a) => a.required)
  const facts = [
    `商品：${product.name}，标价 ${product.price} 元。`,
    required.length
      ? `必需配件：${required.map((a) => a.name).join('、')}；运费 ${product.shipping} 元。可选配件不计入总价。`
      : `没有必需配件；运费 ${product.shipping} 元。`,
    product.alternatives.rent ? `可以租：${product.alternatives.rent.where}，每天 ${product.alternatives.rent.pricePerDay} 元。` : '',
  ].filter(Boolean)

  return [
    '你是用户给自己的钱包请来的"AI 领导"。这是个人消费：用户自己花钱给自己买东西，没有公司、部门、岗位、报销或发票。',
    '你故意模仿公司 OA 审批的官腔来讽刺冲动消费，但审的是个人购物。',
    '',
    ...facts,
    `这是第 ${attempt} 次提交。规则检查发现以下问题：`,
    ...[...new Set(rules)].map((r) => `- ${RULE_TEXT[r]}`),
    '',
    '写 2 到 3 句驳回意见，要求：',
    '1. 语气是一本正经的 OA 官腔，带一点讽刺，但要让人明白具体该补什么。',
    `2. 只能要求补充申请单上真实存在的栏目：${FORM_FIELDS}。不要提部门、岗位、公司、报销、发票、含税、费用明细。`,
    '3. 只针对上面列出的问题，不要另外挑毛病。',
    '4. 你看不到申请人填写的内容，不要引用、复述或猜测他写了什么。',
    '5. 可以点名必需配件，但不要算出或说出总价数字，让他自己算。',
    '6. 不要称呼、不要落款，直接输出意见正文。',
  ].join('\n')
}

// --- Handler ---
const CAPACITOR_ORIGINS = ['https://localhost', 'capacitor://localhost']
const MAX_ATTEMPT = 20

// Best-effort per-instance limit. The hard ceiling is the provider credit, so also set a
// spending limit on the key itself.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 10
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = [...CAPACITOR_ORIGINS, ...(process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)]
  if (!origin || !allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

export function OPTIONS(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

export async function POST(request: Request): Promise<Response> {
  const cors = corsHeaders(request.headers.get('origin'))
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) return json({ error: 'rate_limited' }, 429, cors)

  const key = process.env.LLM_API_KEY
  if (!key) return json({ error: 'not_configured' }, 503, cors)

  let body: { productId?: unknown; rules?: unknown; attempt?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request' }, 400, cors)
  }
  const { productId, rules, attempt } = body
  const product = products.find((p) => p.id === productId)
  if (
    !product ||
    !Array.isArray(rules) ||
    rules.length === 0 ||
    !rules.every((r) => (RULE_IDS as unknown[]).includes(r)) ||
    typeof attempt !== 'number' ||
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    attempt > MAX_ATTEMPT
  ) {
    return json({ error: 'bad_request' }, 400, cors)
  }

  const prompt = buildPrompt(product, rules as RuleId[], attempt)

  // `||` not `??`: an env var set to "" in the Vercel UI must fall back too.
  const baseUrl = (process.env.LLM_BASE_URL || 'https://aihubmix.com/v1').trim().replace(/\/+$/, '')
  const model = (process.env.LLM_MODEL || 'deepseek-v4.1-flash').trim()

  // Failures are logged server-side (Vercel → Logs) with the upstream body; the client only
  // gets a coarse reason, never the upstream message.
  const fail = (reason: string, detail?: unknown) => {
    console.error('leader-voice upstream failure', { reason, model, baseUrl, detail })
    return json({ error: 'upstream', reason }, 502, cors)
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        // Headroom for reasoning models, which spend tokens before writing `content`.
        max_tokens: 800,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return fail(`http_${res.status}`, (await res.text()).slice(0, 500))
    const data = (await res.json()) as {
      choices?: { finish_reason?: string; message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content?.trim()
    return text ? json({ text }, 200, cors) : fail('empty_content', data.choices?.[0]?.finish_reason)
  } catch (e) {
    return fail(e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network', String(e))
  }
}
