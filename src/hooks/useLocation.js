import { useEffect, useState } from 'react'

async function getIPLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.latitude) return { lat: data.latitude, lng: data.longitude }
  } catch { }
  return { lat: 6.5244, lng: 3.3792 } // Lagos last resort
}

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // Start IP lookup immediately as fallback
    getIPLocation().then(ipLoc => {
      if (!cancelled && !location) {
        setLocation(ipLoc)
        setLoading(false)
      }
    })

    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    // Try GPS in parallel — overwrites IP location if successful
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!cancelled) {
          setLocation({ lat: coords.latitude, lng: coords.longitude })
          setError(null)
          setLoading(false)
        }
      },
      () => {
        if (!cancelled) {
          setError('Using approximate location')
          setLoading(false)
        }
      },
      { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
    )

    return () => { cancelled = true }
  }, [])

  return { location, error, loading }
}
