import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, fetchCountries, fetchEvents, fetchRegions } from '../api/client'
import type { Country, Region, User } from '../api/types'
import {
  EVENT_SCOPES,
  EVENT_TYPES,
  type Event,
  type EventScope,
  type EventType,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import {
  WEEKDAY_KEYS,
  addDays,
  daysBetween,
  endOfMonth,
  monthKey,
  monthLabel,
  parseDate,
  shortDate,
  startOfWeek,
  toISODate,
  weekRangeLabel,
  type DateView,
} from '../utils/date'

/** MVP scope colors: world=red, Russia=blue, region=green, local=yellow. */
const SCOPE_CLASS: Record<EventScope, string> = {
  world: 'scope-world',
  Russia: 'scope-russia',
  region: 'scope-region',
  local: 'scope-local',
}

interface PanelProps {
  event: Event
  onClick: () => void
}

function EventPanel({ event, onClick }: PanelProps) {
  const { lang } = useI18n()
  return (
    <button type="button" className={`event-panel ${SCOPE_CLASS[event.scope]}`} onClick={onClick}>
      <span className="event-panel-name">{event.name}</span>
      <span className="event-panel-meta">
        {shortDate(event.startDate, lang)} – {shortDate(event.endDate, lang)}
      </span>
    </button>
  )
}

interface DayGridProps {
  month: string
  events: Event[]
  onSelect: (event: Event) => void
}

/** Days view: per-month weekday table starting Monday; panels stretch across day cells. */
function DayGrid({ month, events, onSelect }: DayGridProps) {
  const { t } = useI18n()
  const [y, m] = month.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const last = endOfMonth(first)

  const weeks: Date[][] = []
  let cursor = startOfWeek(first)
  while (cursor <= last) {
    const row: Date[] = []
    for (let i = 0; i < 7; i++) {
      row.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(row)
  }

  return (
    <div className="day-grid">
      <div className="day-grid-header">
        {WEEKDAY_KEYS.map((k) => (
          <span key={k}>{t(`weekday.${k}`)}</span>
        ))}
      </div>
      {weeks.map((week, wi) => {
        const weekStart = week[0]
        const weekEnd = week[6]
        const weekEvents = events.filter((e) => {
          const es = parseDate(e.startDate)
          const ee = parseDate(e.endDate)
          return ee >= weekStart && es <= weekEnd
        })
        return (
          <div className="day-grid-week" key={wi}>
            {week.map((day) => (
              <div
                key={toISODate(day)}
                className={`day-cell${day < first || day > last ? ' outside' : ''}`}
              >
                <span className="day-number">{day.getDate()}</span>
              </div>
            ))}
            {weekEvents.map((e) => {
              const es = parseDate(e.startDate)
              const col = (es.getDay() + 6) % 7 // Monday = 0
              const span = Math.min(daysBetween(es, parseDate(e.endDate)), 7 - col)
              return (
                <button
                  type="button"
                  key={e.id}
                  className={`event-chip ${SCOPE_CLASS[e.scope]}`}
                  style={{ gridColumn: `${col + 1} / span ${span}` }}
                  onClick={() => onSelect(e)}
                >
                  {e.name}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/** Can the user edit the event? Owner, or moderator/administrator. */
function canEditEvent(event: Event, user: User | null): boolean {
  if (!user) return false
  if (
    user.role === 'moderator' ||
    user.role === 'administrator' ||
    user.role === 'super admin'
  ) {
    return true
  }
  if (event.createdBy === user.id) return true
  return event.owners.some((o) => o.userId === user.id)
}

/** Calendar page: month/week/day views, scope & type filters, event popups. */
export default function Calendar() {
  const { token, user } = useAuth()
  const { t, lang } = useI18n()
  const [view, setView] = useState<DateView>('months')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scopes, setScopes] = useState<EventScope[]>([])
  const [types, setTypes] = useState<EventType[]>([])
  const [selected, setSelected] = useState<Event | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEvents({}, token)
      .then((list) => {
        if (!cancelled) setEvents(list)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : t('common.error'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // Country/region name maps for the popup and event panels.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchCountries(undefined, token)
      .then((list) => {
        if (!cancelled) setCountries(list)
      })
      .catch(() => undefined)
    fetchRegions(undefined, undefined, token)
      .then((list) => {
        if (!cancelled) setRegions(list)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [token])

  const countryName = (id: number | null) =>
    id === null ? '—' : (countries.find((c) => c.id === id)?.name ?? `#${id}`)
  const regionName = (id: number | null) =>
    id === null ? '—' : (regions.find((r) => r.id === id)?.name ?? `#${id}`)

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (scopes.length === 0 || scopes.includes(e.scope)) &&
          (types.length === 0 || types.includes(e.type)),
      ),
    [events, scopes, types],
  )

  const monthGroups = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of filtered) {
      const k = monthKey(parseDate(e.startDate))
      const arr = map.get(k) ?? []
      arr.push(e)
      map.set(k, arr)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const weeksByMonth = useMemo(() => {
    const map = new Map<string, { weekStart: Date; events: Event[] }[]>()
    for (const e of filtered) {
      const ws = startOfWeek(parseDate(e.startDate))
      const mk = monthKey(ws)
      const list = map.get(mk) ?? []
      let bucket = list.find((w) => toISODate(w.weekStart) === toISODate(ws))
      if (!bucket) {
        bucket = { weekStart: ws, events: [] }
        list.push(bucket)
      }
      bucket.events.push(e)
      map.set(mk, list)
    }
    for (const [, weeks] of map) {
      weeks.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])

  const toggleScope = (scope: EventScope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    )
  }

  const toggleType = (type: EventType) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t2) => t2 !== type) : [...prev, type],
    )
  }

  if (loading) {
    return (
      <main className="calendar-page">
        <p>{t('common.loading')}</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="calendar-page">
        <p className="form-error">{error}</p>
      </main>
    )
  }

  return (
    <main className="calendar-page">
      <div className="calendar-header">
        <h1>{t('calendar.title')}</h1>
        <Link className="btn-primary" to="/events/new">
          {t('calendar.createEvent')}
        </Link>
      </div>

      <div className="calendar-toolbar">
        <div className="view-toggle" role="group" aria-label="View">
          {(['months', 'weeks', 'days'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={view === v ? 'active' : ''}
              onClick={() => setView(v)}
            >
              {t(`calendar.view${v[0].toUpperCase()}${v.slice(1)}`)}
            </button>
          ))}
        </div>
        <div className="filters">
          <fieldset>
            <legend>{t('calendar.filterScope')}</legend>
            {EVENT_SCOPES.map((s) => (
              <label key={s}>
                <input
                  type="checkbox"
                  checked={scopes.includes(s)}
                  onChange={() => toggleScope(s)}
                />
                {t(`scope.${s}`)}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('calendar.filterType')}</legend>
            {EVENT_TYPES.map((ty) => (
              <label key={ty}>
                <input
                  type="checkbox"
                  checked={types.includes(ty)}
                  onChange={() => toggleType(ty)}
                />
                {t(`type.${ty}`)}
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="calendar-empty">{t('calendar.empty')}</p>
      ) : view === 'months' ? (
        <div className="calendar-months">
          {monthGroups.map(([key, monthEvents]) => (
            <section className="month-block" key={key}>
              <h2>{monthLabel(key, lang)}</h2>
              {monthEvents.map((e) => (
                <EventPanel key={e.id} event={e} onClick={() => setSelected(e)} />
              ))}
            </section>
          ))}
        </div>
      ) : view === 'weeks' ? (
        <div className="calendar-weeks">
          {weeksByMonth.map(([key, weeks]) => (
            <section className="month-block" key={key}>
              <h2>{monthLabel(key, lang)}</h2>
              {weeks.map(({ weekStart, events: weekEvents }) => (
                <div className="week-block" key={toISODate(weekStart)}>
                  <h3>{weekRangeLabel(weekStart, lang)}</h3>
                  {weekEvents.map((e) => (
                    <EventPanel key={e.id} event={e} onClick={() => setSelected(e)} />
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="calendar-days">
          {monthGroups.map(([key, monthEvents]) => (
            <section className="month-block" key={key}>
              <h2>{monthLabel(key, lang)}</h2>
              <DayGrid month={key} events={monthEvents} onSelect={setSelected} />
            </section>
          ))}
        </div>
      )}

      {selected && (
        <div className="event-popup-overlay" onClick={() => setSelected(null)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <span className={`scope-dot ${SCOPE_CLASS[selected.scope]}`} />
            <h3>{selected.name}</h3>
            <p>
              {t('event.startDate')}: {shortDate(selected.startDate, lang)}
            </p>
            <p>
              {t('event.endDate')}: {shortDate(selected.endDate, lang)}
            </p>
            <p>
              {t('event.country')}: {countryName(selected.countryId)}
            </p>
            <p>
              {t('event.region')}: {regionName(selected.regionId)}
            </p>
            <p>
              {t('event.type')}: {t(`type.${selected.type}`)}
            </p>
            <p>
              {t('event.scope')}: {t(`scope.${selected.scope}`)}
            </p>
            <div className="event-popup-actions">
              <Link to={`/events/${selected.id}`}>{t('calendar.popup.openEvent')}</Link>
              {canEditEvent(selected, user) && (
                <Link to={`/events/${selected.id}/edit`}>{t('calendar.popup.editEvent')}</Link>
              )}
              <button type="button" onClick={() => setSelected(null)}>
                {t('calendar.popup.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}