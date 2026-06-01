import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useLocation } from '../hooks/useLocation'

const CATEGORIES = ['Restaurant', 'Pharmacy', 'Mechanic', 'Salon', 'Supermarket', 'Bank', 'Hotel', 'Church', 'Mosque', 'School', 'Hospital', 'Bar', 'Bakery', 'Gym', 'Other']

function PinPicker({ onPick, pin }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  if (!pin) return null
  return (
    <Marker
      position={[pin.lat, pin.lng]}
      icon={L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:#1B7A4A;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.28);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })}
    />
  )
}

export function AddBusiness() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { location } = useLocation()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [pin, setPin] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', address: '',
    phone: '', whatsapp: '', website: '', instagram: '', description: ''
  })

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))
  const step1Valid = () => form.name.trim() && form.category && form.address.trim()

  async function handleSubmit() {
    if (!pin) { setError('Please pin your business location on the map'); return }
    setSubmitting(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('Please sign in first')
      const res = await fetch('/api/v1/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          address: form.address,
          coordinates: pin,
          phone: form.phone,
          whatsapp: form.whatsapp,
          website: form.website,
          instagram: form.instagram,
          description: form.description,
        })
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      setStep(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const mapCenter = pin || location || { lat: 9.0820, lng: 8.6753 }
  const mapZoom = pin ? 15 : location ? 14 : 6

  if (step === 3) return (
    <div className="add-page">
      <div className="add-topbar">
        <button onClick={() => navigate('/')} className="detail-back"><ArrowLeft size={18} /></button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="add-success">
        <div className="success-icon"><Check size={32} strokeWidth={2.5} color="white" /></div>
        <h2 className="add-title">Business Listed!</h2>
        <p className="add-sub">Your business has been submitted and will appear on the map shortly.</p>
        <button onClick={() => navigate('/')} className="btn-wa" style={{ marginTop: 8, padding: '12px 28px' }}>
          Back to map
        </button>
      </div>
    </div>
  )

  return (
    <div className="add-page">
      <div className="add-topbar">
        <button onClick={() => step === 1 ? navigate('/') : setStep(1)} className="detail-back">
          <ArrowLeft size={18} />
        </button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="add-steps">
        <div className={`add-step ${step >= 1 ? 'add-step--active' : ''}`}>
          <div className="add-step-dot">{step > 1 ? <Check size={10} /> : '1'}</div>
          <span>Business Info</span>
        </div>
        <div className="add-step-line" />
        <div className={`add-step ${step >= 2 ? 'add-step--active' : ''}`}>
          <div className="add-step-dot">2</div>
          <span>Pin Location</span>
        </div>
      </div>

      <div className="add-body">
        {step === 1 && (
          <div className="add-form">
            <div>
              <h2 className="add-title">Tell us about your business</h2>
              <p className="add-sub">Fields marked * are required</p>
            </div>

            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Ade's Auto Repair" />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={set('category')}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address *</label>
              <input className="form-input" value={form.address} onChange={set('address')} placeholder="e.g. 12 Taiwo Road, Ilorin" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="08012345678" />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input className="form-input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="08012345678" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" value={form.website} onChange={set('website')} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input className="form-input" value={form.instagram} onChange={set('instagram')} placeholder="@handle" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">About your business</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={set('description')}
                placeholder="What do you offer? What makes you special?"
                rows={3}
              />
            </div>

            <button
              className="btn-wa"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}
              disabled={!step1Valid()}
              onClick={() => setStep(2)}
            >
              Next: Pin Location
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="add-map-step">
            <div style={{ padding: '16px 16px 0' }}>
              <h2 className="add-title">Pin your location</h2>
              <p className="add-sub">
                {location
                  ? 'Map centered on your location — tap to place your business pin'
                  : 'Tap anywhere on the map to place your business pin'}
              </p>
              {pin && (
                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, fontWeight: 600 }}>
                  ✓ Location pinned — {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
                </p>
              )}
            </div>

            <div className="add-map-wrap">
              <MapContainer
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={mapZoom}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <PinPicker onPick={setPin} pin={pin} />
              </MapContainer>
            </div>

            {error && (
              <div className="add-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div style={{ padding: '12px 16px' }}>
              <button
                className="btn-wa"
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                disabled={!pin || submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <><Loader2 size={16} className="spin" /> Submitting…</>
                  : 'List My Business'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
