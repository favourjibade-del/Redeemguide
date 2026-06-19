import { FormEvent, useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { eventService, Event } from '../services/events'
import { Location, locationService } from '../services/locations'

const POLL_INTERVAL_MS = 30000

const emptyEvent = {
  name: '',
  description: '',
  event_type: 'service',
  status: 'upcoming',
  location: '',
  start_time: '',
  end_time: '',
  expected_attendance: '',
  is_free: true
}

function toDateTimeLocal(value: string) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value: string) {
  return value ? new Date(value).toISOString() : ''
}

export default function Events() {
  const user = useAuthStore((state) => state.user)
  const isSuperuser = Boolean(user?.is_superuser)
  const [events, setEvents] = useState<Event[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('upcoming')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState(emptyEvent)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const [eventData, locationData] = await Promise.all([
          loadEventsForFilter(filter),
          locationService.getLocations()
        ])

        if (mounted) {
          setEvents(eventData)
          setLocations(locationData)
          setError(null)
        }
      } catch (error) {
        if (mounted) {
          setError('Unable to load events right now.')
        }
        console.error('Error loading events:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()
    const timer = window.setInterval(load, POLL_INTERVAL_MS)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [filter])

  const loadEventsForFilter = async (currentFilter: string) => {
    if (currentFilter === 'upcoming') return eventService.getUpcomingEvents()
    if (currentFilter === 'live') return eventService.getLiveEvents()
    return eventService.getEvents()
  }

  const reloadEvents = async () => {
    setEvents(await loadEventsForFilter(filter))
  }

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const startEditing = (event: Event) => {
    setEditingEvent(event)
    setForm({
      name: event.name || '',
      description: event.description || '',
      event_type: event.event_type || 'service',
      status: event.status || 'upcoming',
      location: event.location || '',
      start_time: toDateTimeLocal(event.start_time),
      end_time: toDateTimeLocal(event.end_time),
      expected_attendance: event.expected_attendance ? String(event.expected_attendance) : '',
      is_free: event.is_free
    })
  }

  const resetForm = () => {
    setEditingEvent(null)
    setForm(emptyEvent)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      start_time: fromDateTimeLocal(form.start_time),
      end_time: fromDateTimeLocal(form.end_time),
      expected_attendance: form.expected_attendance ? Number(form.expected_attendance) : undefined
    }

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload)
      } else {
        await eventService.createEvent(payload)
      }
      resetForm()
      await reloadEvents()
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Unable to save event.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    setSaving(true)
    setError(null)
    try {
      await eventService.deleteEvent(eventId)
      await reloadEvents()
      if (editingEvent?.id === eventId) resetForm()
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Unable to delete event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page events-page">
      <div className="events-header">
        <div>
          <h1>Events at Redemption City</h1>
          <p>Live event data refreshes automatically.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      
      <div className="filter-buttons">
        <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>
          Upcoming
        </button>
        <button className={filter === 'live' ? 'active' : ''} onClick={() => setFilter('live')}>
          Live
        </button>
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All Events
        </button>
      </div>

      {isSuperuser && (
        <form className="event-editor" onSubmit={handleSubmit}>
          <h2>{editingEvent ? 'Edit event' : 'Add event'}</h2>
          <div className="editor-grid">
            <label>
              Name
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
            <label>
              Location
              <select value={form.location} onChange={(event) => updateField('location', event.target.value)} required>
                <option value="">Choose location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={form.event_type} onChange={(event) => updateField('event_type', event.target.value)}>
                <option value="conference">Conference</option>
                <option value="service">Service</option>
                <option value="workshop">Workshop</option>
                <option value="prayer_meeting">Prayer meeting</option>
                <option value="concert">Concert</option>
                <option value="seminar">Seminar</option>
                <option value="social">Social event</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </label>
            <label>
              Starts
              <input type="datetime-local" value={form.start_time} onChange={(event) => updateField('start_time', event.target.value)} required />
            </label>
            <label>
              Ends
              <input type="datetime-local" value={form.end_time} onChange={(event) => updateField('end_time', event.target.value)} required />
            </label>
            <label>
              Expected attendance
              <input type="number" min="0" value={form.expected_attendance} onChange={(event) => updateField('expected_attendance', event.target.value)} />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.is_free} onChange={(event) => updateField('is_free', event.target.checked)} />
              Free event
            </label>
          </div>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} required />
          </label>
          <div className="editor-actions">
            <button className="primary-action" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingEvent ? 'Save changes' : 'Add event'}
            </button>
            {editingEvent && (
              <button className="secondary-action" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="events-grid">
          {events.length === 0 ? (
            <p>No events found</p>
          ) : (
            events.map((event) => (
              <article key={event.id} className="event-card">
                {event.image && <img src={event.image} alt={event.name} />}
                <h3>{event.name}</h3>
                <p className="event-type">{event.event_type}</p>
                <p className="event-time">
                  {new Date(event.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="event-location">{event.location_name || event.location}</p>
                {isSuperuser ? (
                  <div className="event-admin-actions">
                    <button type="button" onClick={() => startEditing(event)}>Edit</button>
                    <button type="button" className="danger-action" onClick={() => handleDelete(event.id)} disabled={saving}>Remove</button>
                  </div>
                ) : (
                  <button type="button">View Details</button>
                )}
              </article>
            ))
          )}
        </div>
      )}
    </div>
  )
}
