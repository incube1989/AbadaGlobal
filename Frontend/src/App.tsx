import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Calendar from './pages/Calendar'
import EventPage from './pages/EventPage'
import Login from './pages/Login'
import UnderConstruction from './pages/UnderConstruction'

/** The main page is out of MVP scope: "/" lands on login or calendar. */
function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'loading') {
    return <div className="page-loader">…</div>
  }
  return <Navigate to={status === 'authed' ? '/calendar' : '/login'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/events/:id" element={<EventPage />} />
        <Route path="/database" element={<UnderConstruction />} />
        <Route path="/profile" element={<UnderConstruction />} />
        <Route path="/settings" element={<UnderConstruction />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App