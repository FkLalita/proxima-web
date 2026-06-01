import { useEffect, useState, useCallback } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { MobileLayout } from './components/MobileLayout'
import { Map } from './components/Map'
import { BusinessDetail } from './pages/BusinessDetail'
import { AddBusiness } from './pages/AddBusiness'
import { Auth } from './pages/Auth'
import { businessApi } from './api/businesses'
import { useLocation } from './hooks/useLocation'
import { useAuth } from './context/AuthContext'
import { Dashboard } from './pages/Dashboard'


function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth" replace />
  if (!user.email_confirmed_at) return <Navigate to="/auth" replace />
  return children
}

function AppLoader() {
  const { loading } = useAuth()
  if (!loading) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'var(--accent)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 800, fontSize: 22, color: 'white',
        animation: 'mapPulse 1.4s ease-in-out infinite',
      }}>P</div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Loading Proxima…
      </p>
    </div>
  )
}


function Home() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { location, error: locationError, loading: locationLoading } = useLocation()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('')

  const fetchNearby = useCallback(async (lat, lng, cat = '') => {
    setLoading(true)
    setError(null)
    try {
      const res = await businessApi.nearby(lat, lng, { radius: 2000, category: cat })
      setBusinesses(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSearch = useCallback(async (q, lat, lng) => {
    setLoading(true)
    setError(null)
    try {
      const res = await businessApi.search(q, lat, lng)
      setBusinesses(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (location) fetchNearby(location.lat, location.lng, category)
  }, [location, category])
  function handleSearch(q) {
    if (!location) return
    if (q) fetchSearch(q, location.lat, location.lng)
    else fetchNearby(location.lat, location.lng, category)
  }

  function handleCategory(cat) {
    setCategory(cat)
  }

  function handleOpenDetail(b) {
    navigate(`/business/${b.external_id || b.id}`, { state: { business: b } })
  }

  const mapEl = (
    <Map
      businesses={businesses}
      location={location}
      selected={selected}
      onSelectBusiness={setSelected}
      onOpenDetail={handleOpenDetail}
      radius={2000}
      loading={loading || locationLoading}
    />
  )

  if (isMobile) {
    return (
      <MobileLayout
        map={mapEl}
        businesses={businesses}
        loading={loading || locationLoading}
        error={error}
        selected={selected}
        onSelect={setSelected}
        onOpenDetail={handleOpenDetail}
        onSearch={handleSearch}
        onCategory={handleCategory}
        activeCategory={category}
        locationError={locationError}
      />
    )
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        businesses={businesses}
        loading={loading || locationLoading}
        error={error}
        selected={selected}
        onSelect={setSelected}
        onOpenDetail={handleOpenDetail}
        onSearch={handleSearch}
        onCategory={handleCategory}
        activeCategory={category}
        locationError={locationError}
        location={location}
      />
      <div style={{ flex: 1, height: '100dvh', position: 'relative', overflow: 'hidden' }}>
        {locationLoading ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 13 }}>
            Getting your location…
          </div>
        ) : mapEl}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <AppLoader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/add-business" element={<ProtectedRoute><AddBusiness /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
