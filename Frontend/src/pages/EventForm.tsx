import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ApiError,
  createEvent,
  fetchCountries,
  fetchEvent,
  fetchRegions,
  updateEvent,
} from '../api/client'
import {
  EVENT_SCOPES,
  EVENT_TYPES,
  type Country,
  type EventOwner,
  type EventScope,
  type EventType,
  type Region,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import OwnerSelect from '../components/OwnerSelect'
import { useI18n } from '../i18n/I18nContext'

/**
 * Create (/events/new) and edit (/events/:id/edit) form.
 * Actions: cancel, publish event, save as draft (disabled for now).
 */
export default function EventForm() {
  const { id } = useParams()
  const editing = id !== undefined
  const { token, user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [countryId, setCountryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [type, setType] = useState<EventType>('competition')
  const [scope, setScope] = useState<EventScope>('local')
  const [owners, setOwners] = useState<EventOwner[]>([])
  const [guests, setGuests] = useState<EventOwner[]>([])

  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Load countries once; load the event when editing.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchCountries(undefined, token)
      .then((list) => {
        if (!cancelled) setCountries(list)
      })
      .catch(() => {
        if (!cancelled) setError(t('common.error'))
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token || !editing || !id) return
    let cancelled = false
    fetchEvent(Number(id), token)
      .then((event) => {
        if (cancelled) return
        setName(event.name)
        setStartDate(event.startDate)
        setEndDate(event.endDate)
        setCountryId(event.countryId ? String(event.countryId) : '')
        setRegionId(event.regionId ? String(event.regionId) : '')
        setType(event.type)
        setScope(event.scope)
        setOwners(event.owners ?? [])
        setGuests((event.guests ?? []).map((g) => ({ personId: g.id })))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof ApiError ? err.message : t('common.error'))
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, editing, id])

  // Load regions for the selected country.
  useEffect(() => {
    if (!token || !countryId) {
      setRegions([])
      setRegionId('')
      return
    }
    let cancelled = false
    fetchRegions(Number(countryId), undefined, token)
      .then((list) => {
        if (!cancelled) setRegions(list)
      })
      .catch(() => {
        if (!cancelled) setRegions([])
      })
    return () => {
      cancelled = true
    }
  }, [token, countryId])

  const canEdit = useMemo(() => {
    if (!user) return false
    return (
      user.role === 'moderator' ||
      user.role === 'administrator' ||
      user.role === 'super admin'
    )
  }, [user])

  if (notFound) {
    return (
      <main className="event-form-page">
        <h1>{t('event.notFound')}</h1>
        <Link to="/calendar">{t('event.back')}</Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="event-form-page">
        <p>{t('common.loading')}</p>
      </main>
    )
  }

  const handleSubmit = async (e: FormEvent, status: 'published' | 'draft') => {
    e.preventDefault()
    if (!token) return
    setError(null)
    if (!name.trim() || !startDate || !endDate) {
      setError(t('eventForm.required'))
      return
    }
    if (startDate > endDate) {
      setError(t('eventForm.dateOrder'))
      return
    }
    setSaving(true)
    try {
      const input = {
        name: name.trim(),
        startDate,
        endDate,
        countryId: countryId ? Number(countryId) : null,
        regionId: regionId ? Number(regionId) : null,
        type,
        scope,
        status,
        owners,
        guests: guests.map((g) => g.personId!),
      }
      if (editing && id) {
        await updateEvent(Number(id), input, token)
      } else {
        await createEvent(input, token)
      }
      navigate('/calendar')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="event-form-page">
      <h1>{editing ? t('eventForm.editTitle') : t('eventForm.createTitle')}</h1>
      <form className="event-form" onSubmit={(e) => handleSubmit(e, 'published')}>
        <label>
          {t('event.name')}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <div className="form-row">
          <label>
            {t('event.startDate')}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label>
            {t('event.endDate')}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            {t('event.country')}
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
            >
              <option value="">—</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('event.region')}
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              disabled={!countryId}
            >
              <option value="">—</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            {t('event.type')}
            <select value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {EVENT_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`type.${ty}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('event.scope')}
            <select value={scope} onChange={(e) => setScope(e.target.value as EventScope)}>
              {EVENT_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {t(`scope.${s}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="owners-section">
          <legend>{t('eventForm.owners')}</legend>
          <OwnerSelect owners={owners} onOwnersChange={setOwners} />
          <p className="muted">{t('eventForm.ownerHint')}</p>
        </fieldset>
        <fieldset className="owners-section">
          <legend>{t('eventForm.guests')}</legend>
          <OwnerSelect owners={guests} onOwnersChange={setGuests} />
          <p className="muted">{t('eventForm.guestHint')}</p>
        </fieldset>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/calendar')}>
            {t('eventForm.cancel')}
          </button>
          <button type="submit" disabled={saving}>
            {t('eventForm.publish')}
          </button>
          <button type="button" disabled title={t('eventForm.draftDisabled')}>
            {t('eventForm.saveDraft')}
          </button>
        </div>
        {editing && !canEdit && (
          <p className="form-error">{t('eventForm.noEditRights')}</p>
        )}
      </form>
    </main>
  )
}