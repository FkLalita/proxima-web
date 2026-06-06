import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makePin(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.28);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  })
}

function FlyTo({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15, { duration: 1 })
  }, [center, map])
  return null
}

function Init({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.setView([location.lat, location.lng], 14)
  }, [location, map])
  return null
}

function ZoomTracker({ onZoom }) {
  useMapEvents({
    zoomend(e) { onZoom(e.target.getZoom()) }
  })
  return null
}

function ClusterLayer({ location, zoom }) {
  const [clusters, setClusters] = useState([])
  const map = useMap()

  useEffect(() => {
    if (!location || zoom >= 13) { setClusters([]); return }
    const radius = zoom <= 8 ? 500000 : zoom <= 10 ? 100000 : 50000
    fetch(`/api/v1/businesses/clusters?lat=${location.lat}&lng=${location.lng}&radius=${radius}&zoom=${zoom}`)
      .then(r => r.json())
      .then(d => setClusters(d.data || []))
      .catch(() => { })
  }, [location, zoom])

  return clusters.map(c => (
    <Marker
      key={c.cluster_id}
      position={[c.lat, c.lng]}
      icon={L.divIcon({
        className: '',
        html: `<div style="
          width:44px;height:44px;
          background:#1B7A4A;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:14px;
          font-family:sans-serif;
        ">${c.count}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })}
    >
      <Popup>
        <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
          <p style={{ fontWeight: 700, fontSize: 14 }}>{c.count} businesses</p>
          <p style={{ fontSize: 11, color: '#888' }}>Zoom in to see them</p>
        </div>
      </Popup>
    </Marker>
  ))
}

export function Map({ businesses, location, selected, onSelectBusiness, onOpenDetail, radius, loading }) {
  const center = location || { lat: 9.0820, lng: 8.6753 }
  const zoom = location ? 14 : 6
  const [currentZoom, setCurrentZoom] = useState(zoom)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {loading && (
        <div className="map-loading">
          <div className="map-loading-pulse" />
          <span className="map-loading-text">Finding businesses near you…</span>
        </div>
      )}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Init location={location} />
        <ZoomTracker onZoom={setCurrentZoom} />
        {selected?.coordinates && <FlyTo center={selected.coordinates} />}

        {currentZoom < 13 && <ClusterLayer location={location} zoom={currentZoom} />}

        {location && (
          <>
            <Circle
              center={[location.lat, location.lng]}
              radius={radius || 2000}
              pathOptions={{ color: '#1B7A4A', fillColor: '#1B7A4A', fillOpacity: 0.05, weight: 1.5, dashArray: '4' }}
            />
            <Marker
              position={[location.lat, location.lng]}
              icon={L.divIcon({
                className: '',
                html: `<div style="width:14px;height:14px;background:#1B7A4A;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px #1B7A4A40;"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {currentZoom >= 13 && businesses.map((b, i) => {
          if (!b.coordinates?.lat) return null
          const isSelected = selected?.external_id === b.external_id || selected?.id === b.id
          const color = isSelected ? '#145c37' : '#1B7A4A'
          const waLink = b.whatsapp
            ? `https://wa.me/${b.whatsapp.replace(/\D/g, '')}?text=Hi, I found you on Proxima`
            : null

          return (
            <Marker
              key={b.external_id || b.id || i}
              position={[b.coordinates.lat, b.coordinates.lng]}
              icon={makePin(color)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelectBusiness(b) }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: 160 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.name}</p>
                  {b.category && <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{b.category}</p>}
                  {b.address && <p style={{ fontSize: 11, marginBottom: 10 }}>{b.address}</p>}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {waLink && (
                      <button
                        onClick={() => window.open(waLink, '_blank')}
                        style={{ background: '#1B7A4A', color: 'white', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                      >
                        WhatsApp
                      </button>
                    )}
                    {onOpenDetail && (
                      <button
                        onClick={() => onOpenDetail(b)}
                        style={{ background: '#f0f0f0', color: '#111', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
