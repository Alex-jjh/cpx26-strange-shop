import { describe, expect, it } from 'vitest'
import { findDetails, findProduct, products } from '../data/catalog'
import { buildQuiz, gradeQuiz, reflections, type QuizQuestion } from './quiz'
import type { Application } from './types'

const projector = findProduct('projector')!
const app: Application = {
  productId: 'projector',
  purpose: '每周五家庭电影夜，并用于周末看球赛直播',
  firstUseDate: '2026-11-28',
  frequency: 'weekly',
  vsRent: '每周都用，租一个月就超过买的价格',
  vsBorrow: '朋友的投影仪只能借一晚',
  vsExisting: '',
  declaredTotal: 2728.9,
}
const quizFor = (id: string, a: Partial<Application> = {}, difficulty: 'normal' | 'hard' = 'normal') =>
  buildQuiz(findProduct(id)!, findDetails(id), { ...app, productId: id, ...a }, difficulty)
const byId = (quiz: QuizQuestion[], id: QuizQuestion['id']) => quiz.find((q) => q.id === id)!
const correctText = (q: QuizQuestion) => q.options.find((o) => o.id === q.answerId)!.text
const allCorrect = (quiz: QuizQuestion[]) =>
  Object.fromEntries(quiz.map((q) => [q.id, q.answerId ?? q.options[0].id]))

describe('money question', () => {
  it('projector: break-even days against the per-day rental (2728.90 / 10)', () => {
    const q = byId(quizFor('projector'), 'money')
    expect(q.prompt).toContain('2728.90')
    expect(correctText(q)).toBe('273 天')
  })

  it('hourly practice room: break-even hours', () => {
    const drum = findProduct('e-drum')!
    const q = byId(quizFor('e-drum'), 'money')
    expect(correctText(q)).toBe(`${Math.ceil((drum.price + 65 + 380 + 120) / 50)} 小时`)
  })

  it('no rental: cost per use from the declared frequency', () => {
    const q = byId(quizFor('massage-gun', { frequency: 'monthly' }), 'money')
    expect(q.title).toBe('单次成本')
    expect(correctText(q)).toBe(`约 ${Math.round(899 / 12)} 元`)
  })
})

describe('every product', () => {
  it.each(products.map((p) => p.id))('%s: 4 distinct options, answer present, stable order', (id) => {
    for (const q of quizFor(id, {}, 'hard')) {
      expect(new Set(q.options.map((o) => o.text)).size, q.id).toBe(q.options.length)
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3)
      if (q.kind === 'graded') expect(q.options.map((o) => o.id), q.id).toContain(q.answerId)
    }
    expect(quizFor(id)).toEqual(quizFor(id))
  })
})

describe('grading', () => {
  const quiz = quizFor('projector')

  it('passes when graded answers are right; reflective answers are never wrong', () => {
    expect(gradeQuiz(quiz, allCorrect(quiz)).passed).toBe(true)
    const honest = { ...allCorrect(quiz), 'one-month': 'resale', 'last-impulse': 'forgot' }
    expect(gradeQuiz(quiz, honest).passed).toBe(true)
  })

  it('reports wrong graded answers and unanswered questions', () => {
    const answers = { ...allCorrect(quiz), money: 'wrong-1' }
    delete (answers as Record<string, string>)['last-impulse']
    const g = gradeQuiz(quiz, answers)
    expect(g.wrong.map((q) => q.id)).toEqual(['money'])
    expect(g.unanswered.map((q) => q.id)).toEqual(['last-impulse'])
    expect(g.passed).toBe(false)
  })

  it('checks the frequency the user actually declared', () => {
    expect(byId(quiz, 'frequency-check').answerId).toBe('weekly')
  })

  it('hard mode adds the total check', () => {
    expect(quizFor('projector', {}, 'hard').map((q) => q.id)).toContain('total-check')
    expect(quiz.map((q) => q.id)).not.toContain('total-check')
  })

  it('passes reflective answers on as text for the AI remark', () => {
    expect(reflections(quiz, { ...allCorrect(quiz), 'one-month': 'resale' })['one-month']).toBe('已经挂上二手平台')
  })
})

it('uses the real total for the demo product', () => {
  expect(byId(quizFor('projector', {}, 'hard'), 'total-check').options.map((o) => o.text)).toContain('2728.90 元')
  expect(projector.price).toBe(2699)
})
