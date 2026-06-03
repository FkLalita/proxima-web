
import { useSEO } from '../hooks/useSEO'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft, ShieldCheck, Star, Phone, MessageCircle,
  MapPin, Clock, Globe, ExternalLink
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MOCK_HOURS = {
  Monday: { open: '08:00', close: '18:00' },
  Tuesday: { open: '08:00', close: '18:00' },
  Wednesday: { open: '08:00', close: '18:00' },
  Thursday: { open: '08:00', close: '18:00' },
  Friday: { open: '08:00', close: '17:00' },
  Saturday: { open: '09:00', close: '15:00' },
  Sunday: null,
}

function isOpenNow(hours) {
  if (!hours) return null
  const now = new Date()
  const day = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]
  const todayHours = hours[day]
  if (!todayHours) return false
  const [oh, om] = todayHours.open.split(':').map(Number)
  const [ch, cm] = todayHours.close.split(':').map(Number)
  const mins = now.getHours() * 60 + now.getMinutes()
  return mins >= oh * 60 + om && mins <= ch * 60 + cm
}

function makePin() {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;background:#1B7A4A;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.28);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

export function BusinessDetail() {
  const { state } = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()
  const b = state?.business

  // Use mock hours for now — will come from DB when owners fill it in
  const hours = b?.hours || MOCK_HOURS
  const open = isOpenNow(hours)
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  useSEO({
    title: b ? `${b.name} — ${b.category || 'Business'} in ${b.address?.split(',').slice(-2).join(',').trim() || 'Nigeria'}` : 'Business',
    description: b?.description
      || `${b?.name} is a ${b?.category || 'local business'} located at ${b?.address || 'Nigeria'}. Find contact details and directions on Proxima.`,
    url: window.location.href,
  })

  const waLink = b?.whatsapp
    ? `https://wa.me/${b.whatsapp.replace(/\D/g, '')}?text=Hi, I found you on Proxima`
    : null

  if (!b) {
    return (
      <div className="detail-not-found">
        <p>Business not found.</p>
        <button onClick={() => navigate('/')} className="btn-back">Go back</button>
      </div>
    )
  }

  return (
    <div className="detail-page">
      {/* Top bar */}
      <div className="detail-topbar">
        <button onClick={() => navigate(-1)} className="detail-back">
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="detail-body">
        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-hero-placeholder">
            <MapPin size={40} strokeWidth={1} style={{ color: 'var(--text-light)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>No photo yet</span>
          </div>
        </div>

        <div className="detail-content">
          {/* Name + status */}
          <div className="detail-name-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 className="detail-name">{b.name}</h1>
                {b.verification_tier !== 'unverified' && (
                  <span className="biz-badge">
                    <ShieldCheck size={11} strokeWidth={2.5} />
                    Verified
                  </span>
                )}
              </div>
              <div className="detail-meta">
                {b.rating && (
                  <span className="detail-rating">
                    <Star size={13} fill="#F5A623" color="#F5A623" />
                    {b.rating}
                  </span>
                )}
                {b.category && <span>{b.category}</span>}
                {open !== null && (
                  <span style={{ color: open ? '#1B7A4A' : '#cc3333', fontWeight: 600 }}>
                    {open ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="detail-ctas">
            {waLink ? (
              <a href={waLink} target="_blank" rel="noreferrer" className="detail-btn-wa">
                <MessageCircle size={16} strokeWidth={2} />
                Message on WhatsApp
              </a>
            ) : (
              <span className="detail-btn-wa" style={{ opacity: 0.4, cursor: 'default' }}>
                <MessageCircle size={16} strokeWidth={2} />
                No WhatsApp listed
              </span>
            )}
            {b.phone ? (
              <a href={`tel:${b.phone}`} className="detail-btn-call">
                <Phone size={16} strokeWidth={2} />
                Call Business
              </a>
            ) : (
              <span className="detail-btn-call" style={{ opacity: 0.4, cursor: 'default' }}>
                <Phone size={16} strokeWidth={2} />
                No phone listed
              </span>
            )}
          </div>

          {/* About */}
          {b.description && (
            <div className="detail-section">
              <h2 className="detail-section-title">ABOUT THE BUSINESS</h2>
              <p className="detail-section-body">{b.description}</p>
            </div>
          )}

          {/* Address + Hours */}
          <div className="detail-info-grid">
            <div className="detail-section">
              <h2 className="detail-section-title">PHYSICAL ADDRESS</h2>
              <div className="detail-info-row">
                <MapPin size={14} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <p className="detail-section-body">{b.address || 'Not provided'}</p>
              </div>
              {b.website && (
                <div className="detail-info-row" style={{ marginTop: 8 }}>
                  <Globe size={14} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <a href={b.website} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: 'var(--accent)' }}>
                    {b.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h2 className="detail-section-title">OPENING HOURS</h2>
              <div className="hours-list">
                {DAYS.map(day => {
                  const h = hours[day]
                  const isToday = day === today
                  return (
                    <div key={day} className={`hours-row ${isToday ? 'hours-row--today' : ''}`}>
                      <span className="hours-day">{day.slice(0, 3)}</span>
                      <span className="hours-time">
                        {h ? `${h.open} – ${h.close}` : 'Closed'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Map */}
          {b.coordinates?.lat && (
            <div className="detail-section">
              <h2 className="detail-section-title">LOCATION</h2>
              <div className="detail-map-wrap">
                <MapContainer
                  center={[b.coordinates.lat, b.coordinates.lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                  dragging={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <Marker
                    position={[b.coordinates.lat, b.coordinates.lng]}
                    icon={makePin()}
                  />
                </MapContainer>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${b.coordinates.lat},${b.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="detail-open-maps"
                >
                  <ExternalLink size={13} />
                  Open in Maps
                </a>
              </div>
            </div>
          )}

          {/* Proxima Protection */}
          {b.verification_tier !== 'unverified' && (
            <div className="detail-protection">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <ShieldCheck size={16} strokeWidth={2} style={{ color: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>Proxima Protection</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This business is a verified Proxima partner. All services are backed by our community excellence guarantee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
