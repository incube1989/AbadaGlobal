import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  createCountry,
  createPerson,
  createRegion,
  deleteCountry,
  deletePerson,
  deleteRegion,
  fetchCountries,
  fetchPersons,
  fetchRegions,
  updateCountry,
  updatePerson,
  updateRegion,
} from '../api/client'
import type { Country, Person, Region } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

type Tab = 'countries' | 'regions' | 'persons'

/** Moderation page: countries / regions / persons tabs (moderator+). */
export default function Moderation() {
  const { t } = useI18n()
  const [tab, setTab] = useState<Tab>('countries')

  return (
    <main className="moderation-page">
      <h1>{t('moderation.title')}</h1>
      <div className="tabs" role="tablist">
        {(['countries', 'regions', 'persons'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {t(`moderation.tab.${key}`)}
          </button>
        ))}
      </div>
      {tab === 'countries' && <CountriesTab />}
      {tab === 'regions' && <RegionsTab />}
      {tab === 'persons' && <PersonsTab />}
    </main>
  )
}

function useToken() {
  const { token } = useAuth()
  return token!
}

function CountriesTab() {
  const { t } = useI18n()
  const token = useToken()
  const [items, setItems] = useState<Country[]>([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Country | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setItems(await fetchCountries(search || undefined, token))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }, [search, token, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createCountry(name.trim(), token)
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing || !editName.trim()) return
    try {
      await updateCountry(editing.id, editName.trim(), token)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCountry(id, token)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  return (
    <section className="moderation-tab">
      <input
        type="search"
        placeholder={t('moderation.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <form className="inline-form" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('moderation.countryName')}
        />
        <button type="submit">{t('moderation.add')}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <ul className="moderation-list">
        {items.map((c) => (
          <li key={c.id}>
            {editing?.id === c.id ? (
              <form className="inline-form" onSubmit={handleSave}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <button type="submit">{t('moderation.save')}</button>
                <button type="button" onClick={() => setEditing(null)}>
                  {t('moderation.cancel')}
                </button>
              </form>
            ) : (
              <>
                <span>{c.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(c)
                    setEditName(c.name)
                  }}
                >
                  {t('moderation.edit')}
                </button>
                <button type="button" onClick={() => handleDelete(c.id)}>
                  {t('moderation.delete')}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function RegionsTab() {
  const { t } = useI18n()
  const token = useToken()
  const [countries, setCountries] = useState<Country[]>([])
  const [items, setItems] = useState<Region[]>([])
  const [countryId, setCountryId] = useState('')
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Region | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCountries(undefined, token)
      .then(setCountries)
      .catch(() => setError(t('common.error')))
  }, [token, t])

  const load = useCallback(async () => {
    try {
      setItems(
        await fetchRegions(countryId ? Number(countryId) : undefined, search || undefined, token),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }, [countryId, search, token, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !countryId) return
    try {
      await createRegion(name.trim(), Number(countryId), token)
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing || !editName.trim()) return
    try {
      await updateRegion(editing.id, editName.trim(), editing.countryId, token)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRegion(id, token)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  return (
    <section className="moderation-tab">
      <div className="inline-form">
        <select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
          <option value="">{t('moderation.allCountries')}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder={t('moderation.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <form className="inline-form" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('moderation.regionName')}
        />
        <button type="submit" disabled={!countryId}>
          {t('moderation.add')}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <ul className="moderation-list">
        {items.map((r) => (
          <li key={r.id}>
            {editing?.id === r.id ? (
              <form className="inline-form" onSubmit={handleSave}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <button type="submit">{t('moderation.save')}</button>
                <button type="button" onClick={() => setEditing(null)}>
                  {t('moderation.cancel')}
                </button>
              </form>
            ) : (
              <>
                <span>{r.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r)
                    setEditName(r.name)
                  }}
                >
                  {t('moderation.edit')}
                </button>
                <button type="button" onClick={() => handleDelete(r.id)}>
                  {t('moderation.delete')}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function PersonsTab() {
  const { t } = useI18n()
  const token = useToken()
  const [countries, setCountries] = useState<Country[]>([])
  const [items, setItems] = useState<Person[]>([])
  const [countryId, setCountryId] = useState('')
  const [search, setSearch] = useState('')
  const [nickname, setNickname] = useState('')
  const [editing, setEditing] = useState<Person | null>(null)
  const [editNickname, setEditNickname] = useState('')
  const [editUserId, setEditUserId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCountries(undefined, token)
      .then(setCountries)
      .catch(() => setError(t('common.error')))
  }, [token, t])

  const load = useCallback(async () => {
    try {
      setItems(
        await fetchPersons(countryId ? Number(countryId) : undefined, search || undefined, token),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }, [countryId, search, token, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !countryId) return
    try {
      await createPerson(nickname.trim(), Number(countryId), token)
      setNickname('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing || !editNickname.trim()) return
    try {
      const userId = editUserId.trim() === '' ? null : Number(editUserId)
      await updatePerson(
        editing.id,
        { nickname: editNickname.trim(), countryId: editing.countryId, userId },
        token,
      )
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePerson(id, token)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  return (
    <section className="moderation-tab">
      <div className="inline-form">
        <select value={countryId} onChange={(e) => setCountryId(e.target.value)}>
          <option value="">{t('moderation.allCountries')}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder={t('moderation.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <form className="inline-form" onSubmit={handleAdd}>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('moderation.personNickname')}
        />
        <button type="submit" disabled={!countryId}>
          {t('moderation.add')}
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <ul className="moderation-list">
        {items.map((p) => (
          <li key={p.id}>
            {editing?.id === p.id ? (
              <form className="inline-form" onSubmit={handleSave}>
                <input
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                />
                <input
                  type="number"
                  placeholder={t('moderation.userId')}
                  value={editUserId}
                  onChange={(e) => setEditUserId(e.target.value)}
                />
                <button type="submit">{t('moderation.save')}</button>
                <button type="button" onClick={() => setEditing(null)}>
                  {t('moderation.cancel')}
                </button>
              </form>
            ) : (
              <>
                <span>
                  {p.nickname}
                  {p.userId !== null && (
                    <span className="badge">{t('moderation.linked')} #{p.userId}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(p)
                    setEditNickname(p.nickname)
                    setEditUserId(p.userId !== null ? String(p.userId) : '')
                  }}
                >
                  {t('moderation.edit')}
                </button>
                <button type="button" onClick={() => handleDelete(p.id)}>
                  {t('moderation.delete')}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}