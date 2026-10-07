import { useEffect, useState } from 'react'
import { fetchHealth } from '../api/client'

export default function Home() {
  const [health, setHealth] = useState<string>('checking…')

  useEffect(() => {
    let cancelled = false
    fetchHealth()
      .then((h) => {
        if (!cancelled) setHealth(h.status)
      })
      .catch(() => {
        if (!cancelled) setHealth('unreachable')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="home">
      <h1>AbadaGlobal</h1>
      <p>Frontend scaffold is up and running.</p>
      <p>
        Backend API health: <code>{health}</code>
      </p>
    </main>
  )
}