import { useState } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

export function ShareButton({ business }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const url = window.location.href
  const text = `Check out ${business.name} on Proxima — ${business.category || 'local business'} at ${business.address || 'Nigeria'}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setOpen(false)
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url })
      } catch { }
    } else {
      setOpen(v => !v)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={nativeShare}
        className="share-btn"
        title="Share this business"
      >
        <Share2 size={15} strokeWidth={2} />
        Share
      </button>

      {/* Fallback dropdown for desktop */}
      {open && (
        <div className="share-dropdown">
          <button onClick={copyLink} className="share-option">
            {copied ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          href={waShare}
          target="_blank"
          rel="noreferrer"
          className="share-option"
          onClick={() => setOpen(false)}
          >
          <MessageCircle size={14} color="#25D366" />
          Share on WhatsApp
        </a>
        </div>
  )
}

{/* Backdrop */ }
{
  open && (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 98 }}
      onClick={() => setOpen(false)}
    />
  )
}
    </div >
  )
}
