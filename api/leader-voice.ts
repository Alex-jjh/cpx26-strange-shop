// Vercel serverless function: rewrites rule findings in the "AI leader" voice.
//
// Public, unauthenticated by design (judges scan a QR code). It is NOT a general LLM proxy:
// the client sends only rule ids from a fixed list plus a short product name, and the prompt
// is built here. The API key lives only in server env vars.
//
// Env: LLM_API_KEY (required), LLM_BASE_URL (OpenAI-compatible, e.g. https://aihubmix.com/v1),
//      LLM_MODEL, ALLOWED_ORIGINS (comma-separated, for the Capacitor app / preview URLs).

const RULE_TEXT: Record<string, string> = {
  'purpose-too-short': '用途说明太简略',
  'total-mismatch': '申报总价没算配件和运费',
  'why-not-rent': '只用一次却不考虑租',
  'first-use-too-far': '两周内都用不上',
  'alternatives-missing': '没论证租、借、用现有物品为什么不行',
}

const CAPACITOR_ORIGINS = ['https://localhost', 'capacitor://localhost']
const MAX_PRODUCT_NAME = 40
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

  let body: { productName?: unknown; rules?: unknown; attempt?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request' }, 400, cors)
  }
  const { productName, rules, attempt } = body
  if (
    typeof productName !== 'string' ||
    productName.length > MAX_PRODUCT_NAME ||
    !Array.isArray(rules) ||
    rules.length === 0 ||
    !rules.every((r) => typeof r === 'string' && r in RULE_TEXT) ||
    typeof attempt !== 'number' ||
    attempt < 1 ||
    attempt > MAX_ATTEMPT
  ) {
    return json({ error: 'bad_request' }, 400, cors)
  }

  const issues = [...new Set(rules as string[])].map((r) => `- ${RULE_TEXT[r]}`).join('\n')
  const prompt = [
    `你是一位一本正经、爱打官腔的部门领导，正在审批下属的个人采购申请：购买「${productName}」。`,
    `这是第 ${attempt} 次提交。申请存在以下问题：\n${issues}`,
    '用 2 到 3 句话写驳回意见：语气像公司 OA 审批，带一点讽刺，但要让人知道具体该补什么。不要加称呼和落款。',
  ].join('\n')

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
