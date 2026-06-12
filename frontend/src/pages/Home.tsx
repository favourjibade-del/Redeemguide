import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import AuthPanel from '../components/AuthPanel/AuthPanel'
import { apiClient } from '../services/api'

interface Event {
  id: string
  name: string
  description: string
  start_time: string
  end_time: string
  location: { id: string; name: string } | string
  status: string
  event_type: string
}

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(!isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      fetchLiveEvents()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchLiveEvents = async () => {
    try {
      const response = await apiClient.get<Event[] | { results: Event[] }>('/events/?status=live')
      const data = Array.isArray(response.data) ? response.data : response.data.results || []
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Unauthenticated splash screen with auth panel
  if (!isAuthenticated) {
    return (
      <div className="page splash-page">
        <section className="splash-hero">
          <div className="splash-visual" aria-hidden="true">
            <div className="splash-map">
              <span className="pin pin--main" />
              <span className="pin pin--event" />
              <span className="pin pin--business" />
            </div>
          </div>
          <div className="splash-copy">
            <p className="splash-kicker">Redemption City live guide</p>
            <h1>RedeemGuide</h1>
            <p>
              Find events, live streams, services, businesses, and helpful places around camp from one editable map.
            </p>
          </div>
          <AuthPanel />
        </section>
      </div>
    )
  }

  // Authenticated home page with live events and details
  return (
    <div className="page home-page">
      <div className="home-hero">
        <div className="home-hero__content">
          <h1>Welcome to Redemption City</h1>
          <p className="home-hero__tagline">
            Empowering purpose. Enriching lives. Building a better world through faith and technology.
          </p>
          <div className="home-hero__features">
            <a href="https://www.rccg.org/the-redemption-city/" target="_blank" rel="noopener noreferrer" className="feature-link">
              <span>Learn More</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <section className="live-events-section">
        <div className="section-header">
          <h2>Live Events</h2>
          <p>Now happening at Redemption City</p>
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card__badge">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</div>
                <div className="event-card__content">
                  <h3>{event.name}</h3>
                  <p className="event-card__description">{event.description}</p>
                  <div className="event-card__meta">
                    <span className="event-card__location">
                      📍 {typeof event.location === 'object' ? event.location.name : event.location}
                    </span>
                    <span className="event-card__time">
                      🕐 {new Date(event.start_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>No live events at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      <section className="about-section">
        <h2>About Redemption City</h2>
        <div className="about-content">
          <p>
            The Redemption City is a vision to create a smart, technologically-enabled city of faith. It serves as a center 
            for spiritual growth, community development, and technological innovation.
          </p>
          <p>
            Through the Redemption City initiative, we are committed to:
          </p>
          <ul className="about-list">
            <li>Fostering spiritual growth and development</li>
            <li>Providing community services and support</li>
            <li>Promoting technological advancement</li>
            <li>Creating opportunities for business and entrepreneurship</li>
            <li>Building a better world through faith and technology</li>
          </ul>
          <a href="https://www.rccg.org/the-redemption-city/" target="_blank" rel="noopener noreferrer" className="cta-button">
            Visit Official Website
          </a>
        </div>
      </section>
    </div>
  )
}
