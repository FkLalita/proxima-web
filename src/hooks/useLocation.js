import { useEffect, useState } from 'react'

const FALLBACK = { lat: 6.5244, lng: 3.3792 }
const TIMEOUT = 8000

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(FALLBACK)
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    // Set a hard timeout — don't wait forever
    const timer = setTimeout(() => {
      if (loading) {
        setLocation(FALLBACK)
        setError('Location timed out — showing default')
        setLoading(false)
      }
    }, TIMEOUT)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        clearTimeout(timer)
        setLocation({ lat: coords.latitude, lng: coords.longitude })
        setLoading(false)
      },
      (err) => {
        clearTimeout(timer)
        setLocation(FALLBACK)
        setError(
          err.code === 1
            ? 'Location access denied — allow in browser settings'
            : 'Could not get location'
        )
        setLoading(false)
      },
      { timeout: TIMEOUT, enableHighAccuracy: false, maximumAge: 30000 }
    )

    return () => clearTimeout(timer)
  }, [])

  return { location, error, loading }
}
