import { MapPin, Phone, MessageCircle, ShieldCheck, Share2, ChevronRight } from 'lucide-react'

export function BusinessCard({ business: b, active, onClick, onOpenDetail, index }) {
  const isVerified = b.verification_tier === 'verified' || b.verification_tier === 'claimed'
  const waLink = b.whatsapp
    ? `https://wa.me/${b.whatsapp.replace(/\D/g, '')}?text=Hi, I found you on Proxima`
    : null

  return (
    <div
      className={`biz-card${active ? ' biz-card--active' : ''}`}
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div className="biz-card-top">
        <div className="biz-name-row">
          <h3 className="biz-name">{b.name}</h3>
          {isVerified && (
            <span className="biz-badge">
              <ShieldCheck size={10} strokeWidth={2.5} />
              Verified
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onOpenDetail(b) }}
          className="biz-detail-btn"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      {b.category && <p className="biz-meta">{b.category}</p>}

      {b.address && (
        <p className="biz-address">
          <MapPin size={11} strokeWidth={2} />
          <span>{b.address}</span>
        </p>
      )}

      <div className="biz-actions">
        {waLink && (
          <a href={waLink} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()} className="btn-wa">
            <MessageCircle size={13} strokeWidth={2} />
            WhatsApp
          </a>
        )}
        <button
          onClick={e => {
            e.stopPropagation()
            const url = `${window.location.origin}/business/${b.external_id || b.id}`
            if (navigator.share) {
              navigator.share({ title: b.name, url })
            } else {
              navigator.clipboard.writeText(url)
            }
          }}
          className="biz-detail-btn"
          title="Share"
        >
          <Share2 size={13} strokeWidth={2} />
        </button>
        {b.phone && (
          <a href={`tel:${b.phone}`}
            onClick={e => e.stopPropagation()} className="btn-call">
            <Phone size={13} strokeWidth={2} />
            Call
          </a>
        )}
      </div>
    </div>
  )
}
