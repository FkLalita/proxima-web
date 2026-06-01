import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Plus, Loader2, MapPin, AlertCircle } from 'lucide-react'
import { BusinessCard } from './BusinessCard'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

const CATS = ['All', 'Restaurant', 'Pharmacy', 'Mechanic', 'Salon', 'Supermarket', 'Bank', 'Hotel']
const PEEK_HEIGHT = 180

export function MobileLayout({
  map, businesses, loading, error,
  selected, onSelect, onOpenDetail,
  onSearch, onCategory, activeCategory,
  locationError,
}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const drawerRef = useRef(null)
  const startY = useRef(null)
  const startH = useRef(null)

  const maxH = window.innerHeight * 0.85

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY
    startH.current = drawerRef.current?.offsetHeight || PEEK_HEIGHT
  }

  function onTouchMove(e) {
    if (startY.current === null) return
    const dy = startY.current - e.touches[0].clientY
    const newH = Math.min(maxH, Math.max(PEEK_HEIGHT, startH.current + dy))
    if (drawerRef.current) drawerRef.current.style.height = newH + 'px'
  }

  function onTouchEnd() {
    if (!drawerRef.current) return
    const h = drawerRef.current.offsetHeight
    const mid = (PEEK_HEIGHT + maxH) / 2
    if (h > mid) {
      drawerRef.current.style.height = maxH + 'px'
      setExpanded(true)
    } else {
      drawerRef.current.style.height = PEEK_HEIGHT + 'px'
      setExpanded(false)
    }
    startY.current = null
  }

  function handleSearch(e) {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <div style={{ position: 'relative', height: '100dvh', width: '100vw', overflow: 'hidden' }}>

      {/* Full screen map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {map}
      </div>

      {/* Top bar overlay */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-inner">
          <div className="header-left">
            <div className="logo-mark" style={{ width: 26, height: 26, fontSize: 13 }}>P</div>
            <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mobile-auth-btn"
                >
                  Dashboard
                </button>
                <button
                  onClick={signOut}
                  className="mobile-auth-btn"
                  style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  Out
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} className="mobile-auth-btn">
                Sign in
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mobile-search-wrap">
          <Search size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="mechanic, suya, pharmacy..."
            className="search-input"
            style={{ flex: 1 }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); onSearch('') }}>
              <X size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </form>

        {/* Category chips */}
        <div className="cat-chips" style={{ padding: '0 12px 10px' }}>
          {CATS.map(cat => {
            const val = cat === 'All' ? '' : cat
            return (
              <button
                key={cat}
                onClick={() => onCategory(val)}
                className={`cat-chip ${activeCategory === val ? 'cat-chip--active' : ''}`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Location warning */}
        {locationError && (
          <div className="location-warn" style={{ margin: '0 12px 10px' }}>
            <AlertCircle size={12} />
            {locationError}
          </div>
        )}
      </div>

      {/* FAB — add business */}
      <button
        className="mobile-fab"
        onClick={() => navigate('/add-business')}
        title="List your business"
      >
        <Plus size={22} strokeWidth={2.5} color="white" />
      </button>

      {/* Bottom drawer */}
      <div
        ref={drawerRef}
        className="mobile-drawer"
        style={{ height: PEEK_HEIGHT }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Handle */}
        <div
          className="drawer-handle-wrap"
          onClick={() => {
            const next = !expanded
            setExpanded(next)
            if (drawerRef.current) {
              drawerRef.current.style.height = (next ? maxH : PEEK_HEIGHT) + 'px'
            }
          }}
        >
          <div className="drawer-handle" />
        </div>

        {/* Count */}
        <div className="drawer-count">
          {loading ? (
            <><Loader2 size={12} className="spin" style={{ color: 'var(--accent)' }} /> Finding businesses…</>
          ) : businesses.length > 0 ? (
            <><MapPin size={12} style={{ color: 'var(--accent)' }} /> {businesses.length} businesses nearby</>
          ) : (
            'No businesses found'
          )}
        </div>

        {/* List */}
        <div className="drawer-list">
          {loading && (
            <div className="state-center" style={{ padding: 20 }}>
              <Loader2 size={20} className="spin" style={{ color: 'var(--accent)' }} />
            </div>
          )}
          {!loading && error && (
            <div className="state-center" style={{ padding: 20 }}>
              <AlertCircle size={20} strokeWidth={1.5} />
              <p className="state-sub">{error}</p>
            </div>
          )}
          {!loading && !error && businesses.map((b, i) => (
            <BusinessCard
              key={b.id || b.external_id || i}
              business={b}
              active={
                !!selected &&
                !!(b.external_id || b.id) &&
                (selected.external_id === b.external_id || selected.id === b.id)
              }
              onClick={() => {
                onSelect(b)
                setExpanded(false)
                if (drawerRef.current) drawerRef.current.style.height = PEEK_HEIGHT + 'px'
              }}
              onOpenDetail={onOpenDetail}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
