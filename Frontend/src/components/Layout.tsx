import { Outlet } from 'react-router-dom'
import NavPanel from './NavPanel'

/** App shell: nav panel + routed content. Used by all protected pages. */
export default function Layout() {
  return (
    <div className="app-layout">
      <NavPanel />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}