import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, fetchCountries, fetchEvent, fetchRegions } from '../api/client'
import type { Country, Event, Region, User } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import PersonLabel from '../components/PersonLabel'
import { useI18n } from '../i18n/I18nContext'
import { shortDate } from '../utils/date'

const SCOPE_CLASS: Record<Event['scope'], string> = {
  world: 'scope-world',
  Russia: 'scope-russia',
  region: 'scope-region',
  local: 'scope-local',
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

/** Full event information, loaded by id. */
export default function EventPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const { t, lang } = useI18n()
  const [event, setEvent] = useState<Event | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const countryName =
    event.countryId === null
      ? '—'
      : (countries.find((c) => c.id === event.countryId)?.name ?? `#${event.countryId}`)
  const regionName =
    event.regionId === null
      ? '—'
      : (regions.find((r) => r.id === event.regionId)?.name ?? `#${event.regionId}`)

  return (
    <main className="event-page">
      <article className="event-card">
        <h1>
          <span className={`scope-bar ${SCOPE_CLASS[event.scope]}`} />
          {event.name}
        </h1>
        {event.ownerList && event.ownerList.length > 0 && (
          <div className="event-guests">
            <span className="event-guests-label">{t('event.owners')}:</span>
            {event.ownerList.map((o, i) =>
              o.personId !== undefined ? (
                <PersonLabel
                  key={o.personId ?? i}
                  person={{ corda: o.corda, title: o.title, nickname: o.nickname }}
                />
              ) : (
                <span key={o.userId ?? i} className="person-label">
                  {o.nickname}
                </span>
              ),
            )}
          </div>
        )}
        {event.guests && event.guests.length > 0 && (
          <div className="event-guests">
            <span className="event-guests-label">{t('event.guests')}:</span>
            {event.guests.map((g) => (
              <PersonLabel key={g.id} person={g} />
            ))}
          </div>
        )}
        <dl className="event-facts">
          <dt>{t('event.startDate')}</dt>
          <dd>{shortDate(event.startDate, lang)}</dd>
          <dt>{t('event.endDate')}</dt>
          <dd>{shortDate(event.endDate, lang)}</dd>
          <dt>{t('event.country')}</dt>
          <dd>{countryName}</dd>
          <dt>{t('event.region')}</dt>
          <dd>{regionName}</dd>
          <dt>{t('event.type')}</dt>
          <dd>{t(`type.${event.type}`)}</dd>
          <dt>{t('event.scope')}</dt>
          <dd>{t(`scope.${event.scope}`)}</dd>
          <dt>{t('event.status')}</dt>
          <dd>{t(`status.${event.status}`)}</dd>
        </dl>
        <div className="event-actions">
          <Link to="/calendar">{t('event.back')}</Link>
          {canEditEvent(event, user) && (
            <Link className="btn-primary" to={`/events/${event.id}/edit`}>
              {t('event.edit')}
            </Link>
          )}
        </div>
      </article>
    </main>
  )
}