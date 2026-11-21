// 《个人钱包管理暂行办法》: one fixed article per review rule, plus decorative articles.
// Wording lives in regulations.json so anyone can edit it without touching code; the server
// (api/leader-voice.ts) reads the same JSON so the AI leader cites the same article numbers.

import raw from './regulations.json'
import type { Article, RuleId } from './types'

export type { Article }

export const regulations = raw as { title: string; articles: Article[] }

export function articleFor(rule: RuleId): Article {
  const a = regulations.articles.find((x) => x.rule === rule)
  if (!a) throw new Error(`No article for rule ${rule}`)
  return a
}

/** "依据第四条（先租后议）：" */
export function citation(rule: RuleId): string {
  const a = articleFor(rule)
  return `依据${a.no}${a.title ? `（${a.title}）` : ''}：`
}
