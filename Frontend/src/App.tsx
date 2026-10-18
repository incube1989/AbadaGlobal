import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Admin from './pages/Admin'
import Calendar from './pages/Calendar'
import EventForm from './pages/EventForm'
import EventPage from './pages/EventPage'
import Login from './pages/Login'
import Moderation from './pages/Moderation'
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
        <Route path="/events/new" element={<EventForm />} />
        <Route path="/events/:id" element={<EventPage />} />
        <Route path="/events/:id/edit" element={<EventForm />} />
        <Route
          path="/moderation"
          element={
            <RoleRoute roles={['moderator', 'administrator', 'super admin']}>
              <Moderation />
            </RoleRoute>
          }
        />
        <Route
          path="/administration"
          element={
            <RoleRoute roles={['administrator', 'super admin']}>
              <Admin />
            </RoleRoute>
          }
        />
        <Route path="/database" element={<UnderConstruction />} />
        <Route path="/profile" element={<UnderConstruction />} />
        <Route path="/settings" element={<UnderConstruction />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App