import { FormEvent, useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Location, locationService } from '../services/locations'
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

export default function Map() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [pickedPosition, setPickedPosition] = useState<[number, number] | null>(null)
  const [form, setForm] = useState(emptyForm)

  const center = useMemo<[number, number]>(() => {
    const firstLocation = locations.find((location) => location.latitude && location.longitude)
    return firstLocation ? [Number(firstLocation.latitude), Number(firstLocation.longitude)] : defaultCenter
  }, [locations])

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const data = await locationService.getLocations()
      setLocations(data)
    } catch (error) {
      console.error('Error loading locations:', error)
    } finally {
      setLoading(false)
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

    if (selectedLocation?.id) {
      await locationService.updateLocation(selectedLocation.id, payload)
    } else {
      await locationService.createLocation(payload)
    }

    resetEditor()
    await loadLocations()
  }

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

      <div className="map-container">
        {loading ? (
          <p className="loading">Loading map...</p>
        ) : (
          <MapContainer center={center} zoom={15} className="leaflet-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onPick={(position) => {
                setPickedPosition(position)
                setSelectedLocation(null)
              }}
            />
            {locations.map((location) => (
              <Marker
                key={location.id}
                icon={markerIcon}
                position={[Number(location.latitude), Number(location.longitude)]}
                eventHandlers={{ click: () => handleEdit(location) }}
              >
                <Popup>
                  <strong>{location.name}</strong>
                  <br />
                  {location.location_type}
                  {location.contact_phone && (
                    <>
                      <br />
                      {location.contact_phone}
                    </>
                  )}
                </Popup>
              </Marker>
            ))}
            {pickedPosition && <Marker icon={markerIcon} position={pickedPosition} />}
          </MapContainer>
        )}

        <aside className="locations-list">
          <h2>Locations ({locations.length})</h2>
          {locations.map((location) => (
            <button key={location.id} className="location-item" onClick={() => handleEdit(location)}>
              <strong>{location.name}</strong>
              <span>{location.location_type}</span>
              <span>{location.business_name || location.contact_phone || location.address}</span>
            </button>
          ))}
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
      </div>
    </div>
  )
}
