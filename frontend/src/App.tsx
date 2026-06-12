import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Navigation from './components/Navigation/Navigation'
import Home from './pages/Home'
import Map from './pages/Map'
import Events from './pages/Events'
import Dashboard from './pages/Dashboard'
import LiveDataBar from './components/LiveDataBar/LiveDataBar'
import { useAuthStore } from './store/authStore'

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'not-configured'}>
      <Router>
        <div className="app">
          {isAuthenticated && <Navigation />}
          <LiveDataBar />
          <main className={isAuthenticated ? 'main-content' : 'main-content main-content--flush'}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={isAuthenticated ? <Map /> : <Navigate to="/" />} />
              <Route path="/events" element={<Events />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}
