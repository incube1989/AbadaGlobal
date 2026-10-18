import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, fetchEvent } from '../api/client'
import type { Event } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import { shortDate } from '../utils/date'

const SCOPE_CLASS: Record<Event['scope'], string> = {
  world: 'scope-world',
  Russia: 'scope-russia',
  region: 'scope-region',
  local: 'scope-local',
}

/** Full event information, loaded by id. */
export default function EventPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const { t, lang } = useI18n()
  const [event, setEvent] = useState<Event | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !id) return
    let cancelled = false
    setEvent(null)
    setNotFound(false)
    setError(null)
    fetchEvent(Number(id), token)
      .then((e) => {
        if (!cancelled) setEvent(e)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof ApiError ? err.message : String(err))
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  if (notFound) {
    return (
      <main className="event-page">
        <h1>{t('event.notFound')}</h1>
        <Link to="/calendar">{t('event.back')}</Link>
      </main>
    )
  }

  if (error) {
    return (
      <main className="event-page">
        <p className="form-error">{error}</p>
        <Link to="/calendar">{t('event.back')}</Link>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="event-page">
        <p>{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="event-page">
      <article className="event-card">
        <h1>
          <span className={`scope-bar ${SCOPE_CLASS[event.scope]}`} />
          {event.name}
        </h1>
        <dl className="event-facts">
          <dt>{t('event.startDate')}</dt>
          <dd>{shortDate(event.startDate, lang)}</dd>
          <dt>{t('event.endDate')}</dt>
          <dd>{shortDate(event.endDate, lang)}</dd>
          <dt>{t('event.place')}</dt>
          <dd>{event.place}</dd>
          <dt>{t('event.type')}</dt>
          <dd>{t(`type.${event.type}`)}</dd>
          <dt>{t('event.scope')}</dt>
          <dd>{t(`scope.${event.scope}`)}</dd>
        </dl>
        <Link to="/calendar">{t('event.back')}</Link>
      </article>
    </main>
  )
}