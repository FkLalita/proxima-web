import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { BusinessCard } from './BusinessCard'
import { ThemeToggle } from './ThemeToggle'
import { RouteSearch } from './RouteSearch'
import { Loader2, MapPin, AlertCircle, Building2, Navigation } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Sidebar({
  businesses, loading, error,
  selected, onSelect, onOpenDetail,
  onSearch, onCategory, activeCategory,
  locationError, location, onRouteResults,
}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showRoute, setShowRoute] = useState(false)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="header-left">
          <div className="logo-mark">P</div>
          <span className="logo-text">Proxima</span>
        </div>
        <div className="header-right">
          {!loading && businesses.length > 0 && (
            <span className="biz-count">{businesses.length.toLocaleString()} nearby</span>
          )}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                className="auth-indicator"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/dashboard')}
              >
                <div className="auth-dot" />
                <span>dashboard</span>
              </div>
            </div>
          ) : (
            <div
              className="auth-indicator"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/auth')}
            >
              <div className="auth-dot auth-dot--out" />
              <span>sign in</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="sidebar-search">
        <SearchBar
          onSearch={onSearch}
          onCategory={onCategory}
          activeCategory={activeCategory}
        />
        <button
          onClick={() => setShowRoute(r => !r)}
          className={`cat-chip ${showRoute ? 'cat-chip--active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}
        >
          <Navigation size={11} />
          Route Search
        </button>
        {showRoute && (
          <div style={{ marginTop: 8 }}>
            <RouteSearch
              userLocation={location}
              onResults={(results) => {
                onRouteResults && onRouteResults(results)
              }}
              onClose={() => setShowRoute(false)}
            />
          </div>
        )}
      </div>

      {locationError && (
        <div className="location-warn">
          <AlertCircle size={12} />
          {locationError}
        </div>
      )}

      <div className="sidebar-list">
        {loading && (
          <div className="state-center">
            <Loader2 size={22} className="spin" style={{ color: 'var(--accent)' }} />
            <span>Finding businesses…</span>
          </div>
        )}
        {!loading && error && (
          <div className="state-center">
            <AlertCircle size={28} strokeWidth={1.5} />
            <p>Could not load businesses</p>
            <p className="state-sub">{error}</p>
          </div>
        )}
        {!loading && !error && businesses.length === 0 && (
          <div className="state-center">
            <MapPin size={28} strokeWidth={1.5} />
            <p>No businesses found</p>
            <p className="state-sub">Try a different search or category</p>
          </div>
        )}
        {!loading && !error && businesses.map((b, i) => (
          <BusinessCard
            key={b.id || b.external_id || i}
            business={b}
            active={!!selected && !!(b.external_id || b.id) && (selected.external_id === b.external_id || selected.id === b.id)}
            onClick={() => onSelect(b)}
            onOpenDetail={onOpenDetail}
            index={i}
          />
        ))}
      </div>

      <div className="spotlight" onClick={() => navigate('/add-business')}>
        <div className="spotlight-inner">
          <Building2 size={16} strokeWidth={2} />
          <div>
            <p className="spotlight-title">LOCAL SPOTLIGHT</p>
            <p className="spotlight-sub">Business Owner? List for free</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
