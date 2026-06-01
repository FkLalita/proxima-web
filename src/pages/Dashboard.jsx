import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Eye, MessageCircle, MapPin, Edit2, Trash2, ShieldCheck, AlertCircle, Loader2, BarChart2 } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { businessApi } from '../api/businesses'

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
  const tier = b.verification_tier
  return (
    <div className="dash-biz-row">
      <div className="dash-biz-main">
        <div className="dash-biz-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 className="dash-biz-name">{b.name}</h3>
            {tier !== 'unverified' && (
              <span className="biz-badge">
                <ShieldCheck size={10} />
                {tier}
              </span>
            )}
          </div>
          <p className="dash-biz-meta">
            {b.category}
            {b.address && <> · <MapPin size={10} style={{ display: 'inline', marginBottom: -1 }} /> {b.address}</>}
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
        <span className="dash-stat">
          <Eye size={11} /> {b.view_count || 0} views
        </span>
        <span className="dash-stat">
          <MessageCircle size={11} /> {b.wa_clicks || 0} WhatsApp taps
        </span>
      </div>
    </div>
  )
}

function EditModal({ business: b, onSave, onClose }) {
  const { getToken } = useAuth()
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch(`/api/v1/businesses/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      onSave(data.data)
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
        <div className="modal-body">
          {[
            ['Business Name', 'name', 'text', "Ade's Auto Repair"],
            ['Category', 'category', 'text', 'Mechanic'],
            ['Address', 'address', 'text', '12 Taiwo Road, Ilorin'],
            ['Phone', 'phone', 'text', '08012345678'],
            ['WhatsApp', 'whatsapp', 'text', '08012345678'],
            ['Website', 'website', 'url', 'https://...'],
            ['Instagram', 'instagram', 'text', '@handle'],
          ].map(([label, field, type, ph]) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[field]} onChange={set(field)} placeholder={ph} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">About</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} rows={3} />
          </div>
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
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) return
    load()
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
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">My Businesses</h1>
            <p className="dash-sub">{user?.email}</p>
          </div>
          <button onClick={() => navigate('/add-business')} className="btn-wa" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}>
            <Plus size={15} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {/* Summary stats */}
        {businesses.length > 0 && (
          <div className="stats-grid">
            <StatCard icon={BarChart2} label="Total listings" value={businesses.length} color="#1B7A4A" />
            <StatCard icon={Eye} label="Total views" value={totalViews} color="#1A56A8" />
            <StatCard icon={MessageCircle} label="WhatsApp taps" value={totalWA} color="#25D366" />
          </div>
        )}

        {/* Business list */}
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
            <button onClick={() => navigate('/add-business')} className="btn-wa" style={{ marginTop: 12, padding: '10px 20px' }}>
              <Plus size={14} /> List a business
            </button>
          </div>
        )}

        <div className="dash-list">
          {businesses.map(b => (
            <BusinessRow
              key={b.id}
              b={b}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {editing && (
        <EditModal
          business={editing}
          onSave={handleSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
