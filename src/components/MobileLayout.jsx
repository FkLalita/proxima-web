import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Plus, Loader2, MapPin, AlertCircle, List, Map as MapIcon } from 'lucide-react'
import { BusinessCard } from './BusinessCard'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

const CATS = ['All', 'Restaurant', 'Pharmacy', 'Mechanic', 'Salon', 'Supermarket', 'Bank', 'Hotel']

export function MobileLayout({
  map, businesses, loading, error,
  selected, onSelect, onOpenDetail,
  onSearch, onCategory, activeCategory,
  locationError,
}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [view, setView] = useState('map') // 'map' | 'list'
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <div style={{ position: 'relative', height: '100dvh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {view === 'map' && (
        <>
          {/* Full screen map */}
          <div style={{ position: 'absolute', inset: 0, bottom: 120 }}>
            {map}
          </div>

          {/* Top bar */}
          <div className="mobile-topbar">
            <div className="mobile-topbar-inner">
              <div className="header-left">
                <div className="logo-mark" style={{ width: 26, height: 26, fontSize: 13 }}>P</div>
                <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate('/dashboard')} className="mobile-auth-btn">Dashboard</button>
                    <button onClick={signOut} className="mobile-auth-btn" style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Out</button>
                  </div>
                ) : (
                  <button onClick={() => navigate('/auth')} className="mobile-auth-btn">Sign in</button>
                )}
                <ThemeToggle />
              </div>
            </div>

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
          </div>

          {/* Bottom bar */}
          <div className="mobile-bottom-bar">
            <button className="mobile-fab-inline" onClick={() => navigate('/add-business')}>
              <Plus size={18} strokeWidth={2.5} color="white" />
              <span>List Business</span>
            </button>

            <button className="mobile-list-btn" onClick={() => setView('list')}>
              <List size={18} strokeWidth={2} />
              <span>
                {loading
                  ? 'Loading…'
                  : `${businesses.length} nearby`
                }
              </span>
            </button>
          </div>
        </>
      )}

      {view === 'list' && (
        <div className="mobile-list-view">
          {/* List header */}
          <div className="mobile-list-header">
            <button className="detail-back" onClick={() => setView('map')}>
              <MapIcon size={16} strokeWidth={2} />
            </button>
            <div style={{ flex: 1 }}>
              <form onSubmit={handleSearch} className="mobile-search-wrap" style={{ margin: 0 }}>
                <Search size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search businesses..."
                  className="search-input"
                  style={{ flex: 1 }}
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); onSearch('') }}>
                    <X size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </form>
            </div>
            <ThemeToggle />
          </div>

          {/* Categories */}
          <div className="cat-chips" style={{ padding: '8px 12px' }}>
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

          {/* Count */}
          <div className="drawer-count" style={{ padding: '4px 16px 8px' }}>
            {loading
              ? <><Loader2 size={12} className="spin" style={{ color: 'var(--accent)' }} /> Finding businesses…</>
              : <><MapPin size={12} style={{ color: 'var(--accent)' }} /> {businesses.length} businesses nearby</>
            }
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading && (
              <div className="state-center">
                <Loader2 size={20} className="spin" style={{ color: 'var(--accent)' }} />
              </div>
            )}
            {!loading && error && (
              <div className="state-center">
                <AlertCircle size={20} strokeWidth={1.5} />
                <p className="state-sub">{error}</p>
              </div>
            )}
            {!loading && !error && businesses.length === 0 && (
              <div className="state-center">
                <MapPin size={28} strokeWidth={1.5} />
                <p>No businesses found</p>
              </div>
            )}
            {!loading && !error && businesses.map((b, i) => (
              <BusinessCard
                key={b.id || b.external_id || i}
                business={b}
                active={!!selected && !!(b.external_id || b.id) && (selected.external_id === b.external_id || selected.id === b.id)}
                onClick={() => { onSelect(b); setView('map') }}
                onOpenDetail={onOpenDetail}
                index={i}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mobile-list-footer">
            <button className="mobile-fab-inline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/add-business')}>
              <Plus size={16} strokeWidth={2.5} color="white" />
              List your business free
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
