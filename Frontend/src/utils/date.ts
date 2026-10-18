import type { Lang } from '../i18n/dictionaries'

export type DateView = 'months' | 'weeks' | 'days'

export const WEEKDAY_KEYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const

const MS_PER_DAY = 24 * 60 * 60 * 1000

function localeFor(lang: Lang): string {
  return lang === 'ru' ? 'ru-RU' : lang === 'pt' ? 'pt-BR' : 'en-GB'
}

/** Parse a YYYY-MM-DD string as a local-midnight Date. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Format a Date as a YYYY-MM-DD string. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Monday-based start of the week containing d. */
export function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (copy.getDay() + 6) % 7 // Monday = 0
  return addDays(copy, -dow)
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/** Inclusive number of days between two dates. */
export function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
}

/** YYYY-MM key grouping events into months. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Localized long month label, e.g. "October 2026". */
export function monthLabel(key: string, lang: Lang): string {
  const [y, m] = key.split('-').map(Number)
  return new Intl.DateTimeFormat(localeFor(lang), {
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, 1))
}

/** Localized short date label, e.g. "23 Oct 2026". */
export function shortDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(iso))
}

/** Localized week range label, e.g. "19 – 25 Oct". */
export function weekRangeLabel(weekStart: Date, lang: Lang): string {
  const weekEnd = addDays(weekStart, 6)
  const fmt = new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
  })
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`
}