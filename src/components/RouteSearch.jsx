import { useState } from 'react'
import { Navigation, X, Loader2 } from 'lucide-react'

export function RouteSearch({ userLocation, onResults, onClose }) {
  const [endAddress, setEndAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function geocode(address) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=ng`
    )
    const data = await res.json()
    if (!data.length) throw new Error('Location not found')
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!userLocation) { setError('Enable location first'); return }
    if (!endAddress.trim()) { setError('Enter a destination'); return }
    setLoading(true)
    setError(null)
    try {
      const end = await geocode(endAddress)
      const res = await fetch(
        `/api/v1/businesses/route?start_lat=${userLocation.lat}&start_lng=${userLocation.lng}&end_lat=${end.lat}&end_lng=${end.lng}&radius=500`
      )
      const data = await res.json()
      onResults(data.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="route-search">
      <div className="route-search-header">
        <Navigation size={15} strokeWidth={2} style={{ color:'var(--accent)' }} />
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Route Search</span>
        <button onClick={onClose} style={{ marginLeft:'auto', color:'var(--text-muted)' }}>
          <X size={15} />
        </button>
      </div>
      <form onSubmit={handleSearch} className="route-search-form">
        <div className="route-point">
          <div className="route-dot route-dot--start" />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Your location</span>
        </div>
        <div className="route-line" />
        <div className="route-point">
          <div className="route-dot route-dot--end" />
          <input
            className="search-input"
            value={endAddress}
            onChange={e => setEndAddress(e.target.value)}
            placeholder="Destination (e.g. Lagos Island)"
            style={{ flex:1 }}
          />
        </div>
        {error && <p style={{ fontSize:11, color:'#cc3333' }}>{error}</p>}
        <button
          type="submit"
          className="btn-wa"
          style={{ width:'100%', justifyContent:'center', padding:'10px' }}
          disabled={loading}
        >
          {loading
            ? <><Loader2 size={14} className="spin" /> Searching…</>
            : 'Find businesses on route'
          }
        </button>
      </form>
    </div>
  )
}
