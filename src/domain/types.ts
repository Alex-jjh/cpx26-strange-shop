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
export type FirstUse = 'this-week' | 'two-weeks' | 'month' | 'unsure'

/** One answer on the form: a chosen option id ('' = not answered) and a note, used only for "other". */
export interface Choice {
  choice: string
  note: string
}

/** The "procurement PRD" the user fills in, mostly by tapping (see formOptions.ts). */
export interface Application {
  productId: string
  purpose: Choice
  firstUse: FirstUse | ''
  frequency: UsageFrequency
  /** Why not rent / borrow / use what you already have. */
  vsRent: Choice
  vsBorrow: Choice
  vsExisting: Choice
  declaredTotal: number | null
}

export type RuleId =
  | 'purpose-unclear'
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

/** An article of 《个人钱包管理暂行办法》 (see regulations.json). */
export interface Article {
  no: string
  title?: string
  text: string
  /** The review rule this article backs. Absent = decorative, quotable for flavour. */
  rule?: RuleId
}

/**
 * Collected purchase/rental conditions per product (src/data/product-details.json, owned by role A).
 * Only the fields the app reads are typed; the JSON carries more evidence fields.
 */
export interface RentalOffer {
  kind: 'equipment-rental' | 'onsite-practice-room' | null
  model: string | null
  /** false = a comparable model, not the same product. */
  modelMatch: boolean | null
  merchant: string | null
  pricePerDay: number | null
  minimumDays: number | null
  packagePrice: number | null
  packageDaysIncluded: number | null
  extraDayPrice: number | null
  pricePerHour: number | null
}

export interface ProductDetails {
  quoteLabel: string
  priceNote: string
  scenario: string
  shippingCondition: string
  imageNote?: string
  rental: RentalOffer | null
}
