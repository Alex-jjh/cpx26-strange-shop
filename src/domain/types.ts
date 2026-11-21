// Domain model. Product fields exist to feed the approval levels, not to mirror a real shop.

export interface Accessory {
  name: string
  price: number
  /** Required accessories count toward the true total the reviewer checks. */
  required: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  /** Image paths under /public/products. Second image = "one month later, gathering dust". */
  images: { unboxed: string; dusty?: string }
  accessories: Accessory[]
  shipping: number
  alternatives: {
    rent?: { pricePerDay: number; where: string }
    borrow?: string
    existing?: string
  }
  typicalUsage: string
  /** Where the real price came from. null = placeholder, must be filled before the demo. */
  source: { url: string; capturedAt: string } | null
}

export type UsageFrequency = 'once' | 'monthly' | 'weekly' | 'daily'
export type Difficulty = 'normal' | 'hard'

/** The "procurement PRD" the user fills in. */
export interface Application {
  productId: string
  purpose: string
  /** ISO date (YYYY-MM-DD). */
  firstUseDate: string
  frequency: UsageFrequency
  /** Why not rent / borrow / use what you already have. Empty = not considered. */
  vsRent: string
  vsBorrow: string
  vsExisting: string
  declaredTotal: number | null
}

export type RuleId =
  | 'purpose-too-short'
  | 'total-mismatch'
  | 'why-not-rent'
  | 'first-use-too-far'
  | 'alternatives-missing'
  | 'perfunctory-answer'
  | 'first-submission'

export interface Finding {
  rule: RuleId
  /** Fallback wording shown when the LLM is unavailable. */
  message: string
}

export type Decision =
  | { kind: 'approved' }
  | { kind: 'rejected'; findings: Finding[] }
