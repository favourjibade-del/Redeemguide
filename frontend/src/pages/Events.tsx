import { useState, useEffect } from 'react'
import { eventService } from '../services/events'

export default function Events() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      let data
      if (filter === 'upcoming') {
        data = await eventService.getUpcomingEvents()
      } else if (filter === 'live') {
        data = await eventService.getLiveEvents()
      } else {
        data = await eventService.getEvents()
      }
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page events-page">
      <h1>Events at Redemption City</h1>
      
      <div className="filter-buttons">
        <button 
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'live' ? 'active' : ''}
          onClick={() => setFilter('live')}
        >
          Live
        </button>
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="events-grid">
          {events.length === 0 ? (
            <p>No events found</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-card">
                {event.image && <img src={event.image} alt={event.name} />}
                <h3>{event.name}</h3>
                <p className="event-type">{event.event_type}</p>
                <p className="event-time">
                  {new Date(event.start_time).toLocaleDateString()}
                </p>
                <p className="event-location">{event.location_name || event.location}</p>
                <button>View Details</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
