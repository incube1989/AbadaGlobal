import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  changeUserRole,
  fetchAdminUsers,
  setUserBan,
} from '../api/client'
import { USER_ROLES, type User, type UserRole } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'

/** Administration page: list users, change rights, ban/unban (administrator+). */
export default function Admin() {
  const { t } = useI18n()
  const { token, user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      setUsers(await fetchAdminUsers(token))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }, [token, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleRole = async (id: number, role: UserRole) => {
    if (!token) return
    try {
      await changeUserRole(id, role, token)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  const handleBan = async (id: number, banned: boolean) => {
    if (!token) return
    try {
      await setUserBan(id, banned, token)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
    }
  }

  return (
    <main className="admin-page">
      <h1>{t('admin.title')}</h1>
      {error && <p className="form-error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t('admin.name')}</th>
            <th>{t('admin.email')}</th>
            <th>{t('admin.role')}</th>
            <th>{t('admin.status')}</th>
            <th>{t('admin.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSuper = u.role === 'super admin'
            const isSelf = me?.id === u.id
            return (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {isSuper ? (
                    <span className="badge">{t(`role.${u.role}`)}</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRole(u.id, e.target.value as UserRole)}
                    >
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t(`role.${r}`)}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  {u.isBanned ? (
                    <span className="badge banned">{t('admin.banned')}</span>
                  ) : (
                    <span className="badge">{t('admin.active')}</span>
                  )}
                </td>
                <td>
                  {isSuper ? (
                    <span className="muted">{t('admin.protected')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBan(u.id, !u.isBanned)}
                      disabled={isSelf}
                      title={isSelf ? t('admin.cannotBanSelf') : undefined}
                    >
                      {u.isBanned ? t('admin.unban') : t('admin.ban')}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}