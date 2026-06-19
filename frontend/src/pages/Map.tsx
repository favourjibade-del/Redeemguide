import { FormEvent, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents, LayersControl, LayerGroup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Location, Route, locationService } from '../services/locations'
import 'leaflet/dist/leaflet.css'

const defaultCenter: [number, number] = [6.8126, 3.4446]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const POLL_INTERVAL_MS = 30000

const calculateTravelTime = (distanceInMeters: number) => {
  // Average walking speed: 1.4 meters per second (approx 5 km/h)
  const seconds = distanceInMeters / 1.4;
  const minutes = Math.ceil(seconds / 60);
  return minutes;
};

function MapClickHandler({ onPick }: { onPick: (position: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng])
    }
  })

  return null
}

const emptyForm = {
  name: '',
  description: '',
  location_type: 'other',
  address: '',
  contact_phone: '',
  contact_email: '',
  business_name: '',
  business_website: ''
}

type RoutePoint = NonNullable<Route['waypoints']>[number]

const routePointToLatLng = (point: RoutePoint): [number, number] | null => {
  if (Array.isArray(point) && point.length >= 2) return [Number(point[0]), Number(point[1])]
  if (!point || typeof point !== 'object') return null
  if ('latitude' in point && 'longitude' in point) return [Number(point.latitude), Number(point.longitude)]
  if ('lat' in point && 'lng' in point) return [Number(point.lat), Number(point.lng)]
  return null
}

function NavigationBounder({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [points, map])
  return null
}

export default function Map() {
  const [locations, setLocations] = useState<Location[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickedPosition, setPickedPosition] = useState<[number, number] | null>(null)
  const [form, setForm] = useState(emptyForm)

  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [navigationPath, setNavigationPath] = useState<[number, number][] | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<Location | null>(null)
  const [navMetrics, setNavMetrics] = useState<{ distance: number; time: number } | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const center = useMemo<[number, number]>(() => {
    const firstLocation = locations.find((location) => location.latitude && location.longitude)
    return firstLocation ? [Number(firstLocation.latitude), Number(firstLocation.longitude)] : defaultCenter
  }, [locations])

  useEffect(() => {
    let mounted = true

    const loadRealtimeData = async () => {
      await loadLocations(mounted)
      await loadRoutes(mounted)
    }

    loadRealtimeData()
    const timer = window.setInterval(loadRealtimeData, POLL_INTERVAL_MS)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  const loadLocations = async (mounted = true) => {
    try {
      if (mounted) {
        setLoading(true)
        setError(null)
      }
      const data = await locationService.getLocations()
      if (mounted) setLocations(data)
    } catch (error) {
      if (mounted) setError('Failed to load locations. Please try again.')
      console.error('Error loading locations:', error)
    } finally {
      if (mounted) setLoading(false)
    }
  }

  const loadRoutes = async (mounted = true) => {
    try {
      const data = await locationService.getAllRoutes()
      if (mounted) setRoutes(data)
    } catch (error) {
      console.error('Error loading routes:', error)
    }
  }

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location)
    setPickedPosition([Number(location.latitude), Number(location.longitude)])
    setForm({
      name: location.name || '',
      description: location.description || '',
      location_type: location.location_type || 'other',
      address: location.address || '',
      contact_phone: location.contact_phone || '',
      contact_email: location.contact_email || '',
      business_name: location.business_name || '',
      business_website: location.business_website || ''
    })
  }

  const handleStartNavigation = (destination: Location) => {
    setPendingDestination(destination)
    setShowStartPicker(true)
  }

  const buildRoutePath = (startCoords: [number, number], endCoords: [number, number], route?: Route) => {
    if (!route?.waypoints?.length) return [startCoords, endCoords]

    const waypoints = route.waypoints
      .map(routePointToLatLng)
      .filter((point): point is [number, number] => Boolean(point))

    return [startCoords, ...waypoints, endCoords]
  }

  const pathDistance = (path: [number, number][]) => {
    return path.reduce((total, point, index) => {
      if (index === 0) return total
      return total + L.latLng(path[index - 1]).distanceTo(L.latLng(point))
    }, 0)
  }

  const findBestRoute = (startId: string, destinationId: string) => {
    return routes
      .filter((route) => route.start_location === startId && route.end_location === destinationId)
      .sort((a, b) => a.distance_km - b.distance_km)[0]
  }

  const showRoute = (startCoords: [number, number], endCoords: [number, number], route?: Route) => {
    const path = buildRoutePath(startCoords, endCoords, route)
    const distance = route?.distance_km ? route.distance_km * 1000 : pathDistance(path)

    setNavigationPath(path)
    setNavMetrics({
      distance: Math.round(distance),
      time: route?.estimated_time_minutes || calculateTravelTime(distance)
    })
    setIsNavigating(true)
  }

  const finalizeNavigation = (start: Location) => {
    if (!pendingDestination) return
    
    const startCoords: [number, number] = [Number(start.latitude), Number(start.longitude)]
    const endCoords: [number, number] = [Number(pendingDestination.latitude), Number(pendingDestination.longitude)]
    const route = findBestRoute(start.id, pendingDestination.id)

    showRoute(startCoords, endCoords, route)
    setShowStartPicker(false)
    setPendingDestination(null)
  }

  const finalizeNavigationFromCurrentLocation = () => {
    if (!pendingDestination) return

    if (!navigator.geolocation) {
      setError('Current location is not available in this browser. Choose a starting point instead.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const startCoords: [number, number] = [position.coords.latitude, position.coords.longitude]
        const endCoords: [number, number] = [Number(pendingDestination.latitude), Number(pendingDestination.longitude)]
        showRoute(startCoords, endCoords)
        setShowStartPicker(false)
        setPendingDestination(null)
      },
      () => setError('Unable to use current location. Choose a starting point instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }


  const clearNavigation = () => {
    setNavigationPath(null)
    setIsNavigating(false)
    setNavMetrics(null)
  }

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [locations, searchQuery])

  const resetEditor = () => {
    setSelectedLocation(null)
    setPickedPosition(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!pickedPosition) {
      return
    }

    const payload = {
      ...form,
      latitude: pickedPosition[0],
      longitude: pickedPosition[1],
      current_occupancy: selectedLocation?.current_occupancy || 0,
      status: selectedLocation?.status || 'active'
    }

    try {
      if (selectedLocation?.id) {
        await locationService.updateLocation(selectedLocation.id, payload)
      } else {
        await locationService.createLocation(payload)
      }
      setError(null)
      resetEditor()
      await loadLocations()
    } catch (err: any) {
      setError(`Failed to ${selectedLocation?.id ? 'update' : 'create'} location: ${err.response?.data?.detail || err.message}`)
    }
  }

  const renderMarkers = useCallback((typeFilter?: string) => {
    const list = typeFilter ? locations.filter(l => l.location_type === typeFilter) : filteredLocations
    return list.map((location) => (
      <Marker
        key={location.id}
        icon={markerIcon}
        position={[Number(location.latitude), Number(location.longitude)]}
      >
        <Popup>
          <div className="map-popup">
            <strong>{location.name}</strong>
            <br />
            <span className="type-tag">{location.location_type}</span>
            <br />
            <button 
              className="nav-btn-link"
              onClick={() => handleStartNavigation(location)}
              style={{ marginTop: '8px', cursor: 'pointer', color: '#0066cc', border: 'none', background: 'none', textDecoration: 'underline', padding: 0 }}
            >
              Navigate Here
            </button>
            <br />
            <button onClick={() => handleEdit(location)} style={{ marginTop: '4px', fontSize: '0.8em' }}>Edit Details</button>
          </div>
        </Popup>
      </Marker>
    ))
  }, [locations, filteredLocations])

  const renderRoutes = useCallback(() => {
    return routes.map((route) => {
      const start = locations.find((location) => location.id === route.start_location)
      const end = locations.find((location) => location.id === route.end_location)
      if (!start || !end) return null

      const positions = buildRoutePath(
        [Number(start.latitude), Number(start.longitude)],
        [Number(end.latitude), Number(end.longitude)],
        route
      )

      return (
        <Polyline
          key={route.id}
          positions={positions}
          color="#1357b8"
          weight={3}
          opacity={0.65}
        />
      )
    })
  }, [routes, locations])

  return (
    <div className="page map-page">
      <div className="map-header">
        <div>
          <h1>RedeemGuide Map</h1>
          <p>Click the map to add a location, or choose a marker to edit details.</p>
        </div>
        <button className="secondary-action" type="button" onClick={resetEditor}>
          New location
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="map-container">
        {loading ? (
          <p className="loading">Loading map...</p>
        ) : (
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <MapContainer 
              center={center} 
              zoom={15} 
              className="leaflet-map"
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <LayersControl position="topright">
                <LayersControl.Overlay checked name="All Locations">
                  <LayerGroup>{renderMarkers()}</LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Navigation Routes">
                  <LayerGroup>{renderRoutes()}</LayerGroup>
                </LayersControl.Overlay>
                
                <LayersControl.Overlay name="Serving Points">
                  <LayerGroup>{renderMarkers('dining')}</LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Accommodations">
                  <LayerGroup>{renderMarkers('accommodation')}</LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Parking Spots">
                  <LayerGroup>{renderMarkers('parking')}</LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Medical Facilities">
                  <LayerGroup>{renderMarkers('healthcare')}</LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Offices">
                  <LayerGroup>{renderMarkers('office')}</LayerGroup>
                </LayersControl.Overlay>
              </LayersControl>

              <MapClickHandler
                onPick={(position) => {
                  setPickedPosition(position)
                  setSelectedLocation(null)
                }}
              />

              {pickedPosition && <Marker icon={markerIcon} position={pickedPosition} />}
              
              {isNavigating && navigationPath && (
                <>
                  <Polyline positions={navigationPath} color="#d92d20" weight={6} opacity={0.92} />
                  <NavigationBounder points={navigationPath} />
                </>
              )}
            </MapContainer>

            {isNavigating && navMetrics && (
              <div className="nav-overlay" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Route Info</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    Distance: {(navMetrics.distance / 1000).toFixed(2)} km | Est. Time: {navMetrics.time} mins
                  </div>
                </div>
                <button onClick={clearNavigation} style={{ marginTop: '5px', background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  Stop Navigation
                </button>
              </div>
            )}
          </div>
        )}

        <aside className="locations-list">
          <div className="search-section" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <h2>Find Locations</h2>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </div>
          <div className="list-content" style={{ overflowY: 'auto', flex: 1 }}>
            {filteredLocations.map((location) => (
              <div key={location.id} className="location-card" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <div onClick={() => handleEdit(location)} style={{ cursor: 'pointer' }}>
                  <strong>{location.name}</strong>
                  <div style={{ fontSize: '0.85em', color: '#666' }}>
                    {location.location_type} {location.contact_phone && `• ${location.contact_phone}`}
                  </div>
                </div>
                <button 
                  onClick={() => handleStartNavigation(location)}
                  style={{ marginTop: '5px', fontSize: '0.8em', background: '#0066cc', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Navigate
                </button>
              </div>
            ))}
          </div>
        </aside>

        <form className="location-editor" onSubmit={handleSubmit}>
          <h2>{selectedLocation ? 'Edit location' : 'Add map location'}</h2>
          <label>
            Name
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>
          <label>
            Type
            <select value={form.location_type} onChange={(event) => updateField('location_type', event.target.value)}>
              <option value="auditorium">Auditorium</option>
              <option value="accommodation">Accommodation</option>
              <option value="healthcare">Healthcare</option>
              <option value="dining">Dining</option>
              <option value="parking">Parking</option>
              <option value="shuttle_stop">Shuttle stop</option>
              <option value="restroom">Restroom</option>
              <option value="emergency">Emergency service</option>
              <option value="office">Office</option>
              <option value="retail">Business</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} required />
          </label>
          <label>
            Address
            <input value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
          </label>
          <div className="auth-form__row">
            <label>
              Phone
              <input value={form.contact_phone} onChange={(event) => updateField('contact_phone', event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} />
            </label>
          </div>
          <div className="auth-form__row">
            <label>
              Business name
              <input value={form.business_name} onChange={(event) => updateField('business_name', event.target.value)} />
            </label>
            <label>
              Website
              <input value={form.business_website} onChange={(event) => updateField('business_website', event.target.value)} />
            </label>
          </div>
          <p className="editor-coordinates">
            {pickedPosition ? `${pickedPosition[0].toFixed(5)}, ${pickedPosition[1].toFixed(5)}` : 'Click the map to choose coordinates.'}
          </p>
          <button className="primary-action" type="submit" disabled={!pickedPosition}>
            {selectedLocation ? 'Save changes' : 'Add location'}
          </button>
        </form>

        {showStartPicker && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="navigation-modal" style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
              <h3>Route to {pendingDestination?.name}</h3>
              <p>Where are you starting from?</p>
              <button
                className="primary-action"
                type="button"
                onClick={finalizeNavigationFromCurrentLocation}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Use current location
              </button>
              <div className="start-selection-list" style={{ maxHeight: '300px', overflowY: 'auto', margin: '15px 0' }}>
                {locations.filter(l => l.id !== pendingDestination?.id).map(l => (
                  <button 
                    key={l.id} 
                    onClick={() => finalizeNavigation(l)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px', marginBottom: '5px', border: '1px solid #eee', borderRadius: '4px', background: 'none', cursor: 'pointer' }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              <button className="cancel-btn" onClick={() => setShowStartPicker(false)} style={{ width: '100%', padding: '10px', border: 'none', background: '#eee', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
