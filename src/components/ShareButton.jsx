import { useState } from 'react'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

export function ShareButton({ business }) {
  const [copied, setCopied] = useState(false)

  const url = window.location.href
  const text = `Check out ${business.name} on Proxima${business.address ? ` — ${business.address}` : ''}`
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url })
        return
      } catch { }
    }
    handleCopy()
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="share-row">
      <button onClick={handleShare} className="share-btn">
        {copied
          ? <><Check size={14} strokeWidth={2.5} /> Copied!</>
          : <><Share2 size={14} strokeWidth={2} /> Share</>
        }
      </button>
      <a href={waShareUrl} target="_blank" rel="noreferrer" className="share-btn share-btn--wa">
        <MessageCircle size={14} strokeWidth={2} />
        Share on WhatsApp
      </a>
      <button onClick={handleCopy} className="share-btn share-btn--copy">
        {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
      </button>
    </div>
  )
}
