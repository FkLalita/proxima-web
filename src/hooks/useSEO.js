import { useEffect } from 'react'

export function useSEO({ title, description, url, image }) {
  useEffect(() => {
    if (title) {
      document.title = title + ' — Proxima'
    }
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description)
      setMeta('twitter:description', description)
    }
    if (url) {
      setMeta('og:url', url)
      setCanonical(url)
    }
    if (title) {
      setMeta('og:title', title)
      setMeta('twitter:title', title)
    }
    if (image) {
      setMeta('og:image', image)
      setMeta('twitter:image', image)
    }

    return () => {
      document.title = 'Proxima — Discover Local Businesses in Nigeria'
    }
  }, [title, description, url, image])
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      el.setAttribute('property', name)
    } else {
      el.setAttribute('name', name)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}
