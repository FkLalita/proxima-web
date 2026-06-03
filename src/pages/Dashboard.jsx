import { useSEO } from '../hooks/useSEO'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Eye, MessageCircle, MapPin, Edit2, Trash2, ShieldCheck, AlertCircle, Loader2, BarChart2, Clock } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { validate, sanitize, sanitizePhone } from '../utils/validate'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CATEGORIES = ['Restaurant', 'Pharmacy', 'Mechanic', 'Salon', 'Supermarket', 'Bank', 'Hotel', 'Church', 'Mosque', 'School', 'Hospital', 'Bar', 'Bakery', 'Gym', 'Other']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18', color }}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}

function BusinessRow({ b, onEdit, onDelete }) {
  return (
    <div className="dash-biz-row">
      <div className="dash-biz-main">
        <div className="dash-biz-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 className="dash-biz-name">{b.name}</h3>
            {b.verification_tier !== 'unverified' && (
              <span className="biz-badge">
                <ShieldCheck size={10} />
                {b.verification_tier}
              </span>
            )}
          </div>
          <p className="dash-biz-meta">
            {b.category}
            {b.address && <> · {b.address}</>}
          </p>
        </div>
        <div className="dash-biz-actions">
          <button className="dash-icon-btn" onClick={() => onEdit(b)} title="Edit">
            <Edit2 size={14} strokeWidth={2} />
          </button>
          <button className="dash-icon-btn dash-icon-btn--danger" onClick={() => onDelete(b)} title="Remove">
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="dash-biz-stats">
        <span className="dash-stat"><Eye size={11} /> {b.view_count || 0} views</span>
        <span className="dash-stat"><MessageCircle size={11} /> {b.wa_clicks || 0} WhatsApp taps</span>
      </div>
    </div>
  )
}

const DEFAULT_HOURS = {
  Monday: { open: '08:00', close: '18:00', closed: false },
  Tuesday: { open: '08:00', close: '18:00', closed: false },
  Wednesday: { open: '08:00', close: '18:00', closed: false },
  Thursday: { open: '08:00', close: '18:00', closed: false },
  Friday: { open: '08:00', close: '17:00', closed: false },
  Saturday: { open: '09:00', close: '15:00', closed: false },
  Sunday: { open: '', close: '', closed: true },
}

function EditModal({ business: b, onSave, onClose }) {
  const { getToken } = useAuth()
  const [tab, setTab] = useState('info') // 'info' | 'hours'
  const [form, setForm] = useState({
    name: b.name || '',
    category: b.category || '',
    address: b.address || '',
    phone: b.phone || '',
    whatsapp: b.whatsapp || '',
    website: b.website || '',
    instagram: b.instagram || '',
    description: b.description || '',
    coordinates: b.coordinates,
  })
  const [hours, setHours] = useState(b.hours || DEFAULT_HOURS)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(ev => ({ ...ev, [field]: null }))
  }

  function validateForm() {
    const e = {}
    const nameErr = validate.name(form.name)
    if (nameErr) e.name = nameErr
    const addrErr = validate.address(form.address)
    if (addrErr) e.address = addrErr
    const phoneErr = validate.phone(form.phone)
    if (phoneErr) e.phone = phoneErr
    const waErr = validate.whatsapp(form.whatsapp)
    if (waErr) e.whatsapp = waErr
    const urlErr = validate.url(form.website)
    if (urlErr) e.website = urlErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function setHourField(day, field, value) {
    setHours(h => ({
      ...h,
      [day]: { ...h[day], [field]: value }
    }))
  }

  async function handleSave() {
    if (!validateForm()) return
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch(`/api/v1/businesses/${b.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: sanitize(form.name),
          category: sanitize(form.category),
          address: sanitize(form.address),
          coordinates: form.coordinates,
          phone: sanitizePhone(form.phone),
          whatsapp: sanitizePhone(form.whatsapp),
          website: sanitize(form.website),
          instagram: sanitize(form.instagram),
          description: sanitize(form.description),
        }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      onSave({ ...data.data, hours })
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Listing</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'info' ? 'modal-tab--active' : ''}`}
            onClick={() => setTab('info')}
          >
            Business Info
          </button>
          <button
            className={`modal-tab ${tab === 'hours' ? 'modal-tab--active' : ''}`}
            onClick={() => setTab('hours')}
          >
            <Clock size={13} strokeWidth={2} />
            Opening Hours
          </button>
        </div>

        <div className="modal-body">
          {tab === 'info' && (
            <>
              {[
                ['Business Name *', 'name', 'text', "Ade's Auto Repair"],
                ['Address *', 'address', 'text', '12 Taiwo Road, Ilorin'],
                ['Phone', 'phone', 'text', '08012345678'],
                ['WhatsApp', 'whatsapp', 'text', '08012345678'],
                ['Website', 'website', 'url', 'https://...'],
                ['Instagram', 'instagram', 'text', '@handle'],
              ].map(([label, field, type, ph]) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <input
                    className={`form-input ${errors[field] ? 'form-input--error' : ''}`}
                    type={type}
                    value={form[field]}
                    onChange={set(field)}
                    placeholder={ph}
                  />
                  {errors[field] && <p style={{ fontSize: 11, color: '#cc3333', marginTop: 3 }}>{errors[field]}</p>}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">About</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="What makes your business special?"
                />
              </div>
            </>
          )}

          {tab === 'hours' && (
            <div className="hours-editor">
              {DAYS.map(day => (
                <div key={day} className="hours-editor-row">
                  <div className="hours-editor-day">
                    <label className="hours-toggle">
                      <input
                        type="checkbox"
                        checked={!hours[day]?.closed}
                        onChange={e => setHourField(day, 'closed', !e.target.checked)}
                      />
                      <span>{day.slice(0, 3)}</span>
                    </label>
                  </div>
                  {!hours[day]?.closed ? (
                    <div className="hours-editor-times">
                      <input
                        type="time"
                        className="form-input hours-time-input"
                        value={hours[day]?.open || '08:00'}
                        onChange={e => setHourField(day, 'open', e.target.value)}
                      />
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
                      <input
                        type="time"
                        className="form-input hours-time-input"
                        value={hours[day]?.close || '18:00'}
                        onChange={e => setHourField(day, 'close', e.target.value)}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: '#cc3333' }}>{error}</p>}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-call">Cancel</button>
          <button onClick={handleSave} className="btn-wa" disabled={saving}>
            {saving ? <><Loader2 size={14} className="spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user, getToken } = useAuth()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  useSEO({
    title: 'My Business Dashboard',
    description: 'Manage your Proxima business listings',
  })

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/v1/owner/businesses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setBusinesses(data.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(b) {
    if (!confirm(`Remove "${b.name}" from Proxima?`)) return
    try {
      const token = await getToken()
      await fetch(`/api/v1/businesses/${b.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setBusinesses(prev => prev.filter(x => x.id !== b.id))
    } catch (e) {
      alert('Could not delete: ' + e.message)
    }
  }

  function handleSaved(updated) {
    setBusinesses(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b))
    setEditing(null)
  }

  const totalViews = businesses.reduce((s, b) => s + (b.view_count || 0), 0)
  const totalWA = businesses.reduce((s, b) => s + (b.wa_clicks || 0), 0)

  return (
    <div className="dash-page">
      <div className="detail-topbar">
        <button onClick={() => navigate('/')} className="detail-back">
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="dash-body">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">My Businesses</h1>
            <p className="dash-sub">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate('/add-business')}
            className="btn-wa"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {businesses.length > 0 && (
          <div className="stats-grid">
            <StatCard icon={BarChart2} label="Listings" value={businesses.length} color="#1B7A4A" />
            <StatCard icon={Eye} label="Total views" value={totalViews} color="#1A56A8" />
            <StatCard icon={MessageCircle} label="WA taps" value={totalWA} color="#25D366" />
          </div>
        )}

        {loading && (
          <div className="state-center">
            <Loader2 size={24} className="spin" style={{ color: 'var(--accent)' }} />
            <span>Loading your listings…</span>
          </div>
        )}

        {!loading && error && (
          <div className="state-center">
            <AlertCircle size={28} strokeWidth={1.5} />
            <p>Could not load listings</p>
            <p className="state-sub">{error}</p>
          </div>
        )}

        {!loading && !error && businesses.length === 0 && (
          <div className="state-center" style={{ paddingTop: 60 }}>
            <MapPin size={40} strokeWidth={1} style={{ color: 'var(--text-light)' }} />
            <p style={{ fontWeight: 600 }}>No listings yet</p>
            <p className="state-sub">Add your first business to appear on the map</p>
            <button
              onClick={() => navigate('/add-business')}
              className="btn-wa"
              style={{ marginTop: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> List a business
            </button>
          </div>
        )}

        <div className="dash-list">
          {businesses.map(b => (
            <BusinessRow key={b.id} b={b} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {editing && (
        <EditModal business={editing} onSave={handleSaved} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
