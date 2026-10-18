import { useEffect, useRef, useState } from 'react'
import { fetchOwnerCandidates, resolveOwnerCandidates } from '../api/client'
import type { EventOwner, OwnerCandidate } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import PersonLabel from './PersonLabel'

interface OwnerSelectProps {
  /** Current owner list (persons only). */
  owners: EventOwner[]
  onOwnersChange: (owners: EventOwner[]) => void
}

/**
 * Multiselect owner picker for events. Owners are persons only: type to search
 * non-deleted persons by nickname (backend /owner-candidates), pick results
 * from the dropdown, remove chips. Existing owners are resolved to labels on
 * mount.
 */
export default function OwnerSelect({ owners, onOwnersChange }: OwnerSelectProps) {
  const { token } = useAuth()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<OwnerCandidate[]>([])
  const [selected, setSelected] = useState<OwnerCandidate[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const initialized = useRef(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const rootRef = useRef<HTMLDivElement>(null)

  // Resolve labels for the existing owner list (edit mode).
  useEffect(() => {
    if (initialized.current || !token) return
    if (owners.length === 0) {
      initialized.current = true
      return
    }
    const ids = owners.map((o) => `person:${o.personId}`).join(',')
    resolveOwnerCandidates(ids, token)
      .then((cands) => {
        if (!initialized.current) {
          setSelected(cands)
          initialized.current = true
        }
      })
      .catch(() => {
        initialized.current = true
      })
  }, [owners, token])

  // Debounced substring search over persons (typing).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!query.trim() || !token) {
      setOptions([])
      setLoading(false)
      return
    }
    setLoading(true)
    setOpen(true)
    debounce.current = setTimeout(() => {
      fetchOwnerCandidates(query.trim(), token)
        .then(setOptions)
        .catch(() => setOptions([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => {
      if (debounce.current) clearTimeout(debounce.current)
    }
  }, [query, token])

  const handleFocus = () => {
    if (!token || open) return
    setOpen(true)
    setLoading(true)
    // Empty query returns all persons in alphabetical order.
    fetchOwnerCandidates(query.trim(), token)
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const isSelected = (c: { id: number }) =>
    selected.some((s) => s.id === c.id)

  const add = (c: OwnerCandidate) => {
    if (isSelected(c)) return
    const next = [...selected, c]
    setSelected(next)
    onOwnersChange(next.map((s) => ({ personId: s.id })))
    setQuery('')
    setOptions([])
    setOpen(false)
  }

  const remove = (id: number) => {
    const next = selected.filter((s) => s.id !== id)
    setSelected(next)
    onOwnersChange(next.map((s) => ({ personId: s.id })))
  }

  const shownOptions = options.filter((o) => !isSelected(o))

  return (
    <div className="owner-select" ref={rootRef}>
      <div className="owner-select-box">
        {selected.map((s) => (
          <span key={s.id} className="owner-chip">
            <PersonLabel person={{ corda: s.corda, title: s.title, nickname: s.label }} />
            <button
              type="button"
              className="owner-chip-remove"
              aria-label={t('eventForm.ownerRemove')}
              onClick={() => remove(s.id)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="owner-search-input"
          placeholder={t('eventForm.ownerSearch')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
      </div>
      {open && (
        <ul className="owner-options" role="listbox">
          {loading && <li className="owner-options-muted">{t('common.loading')}</li>}
          {!loading && shownOptions.length === 0 && query.trim() && (
            <li className="owner-options-muted">{t('eventForm.ownerNoResults')}</li>
          )}
          {!loading &&
            shownOptions.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(o)}
                >
                  <PersonLabel person={{ corda: o.corda, title: o.title, nickname: o.label }} />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}