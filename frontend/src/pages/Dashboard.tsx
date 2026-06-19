import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { crowdIntelligenceService } from '../services/crowd'
import { eventService, Event } from '../services/events'

const POLL_INTERVAL_MS = 30000

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [crowdData, setCrowdData] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true

    const loadDashboardData = async () => {
      try {
        const [crowd, events] = await Promise.all([
          crowdIntelligenceService.getAllCrowdDensity(),
          eventService.getUpcomingEvents()
        ])

        if (mounted) {
          setCrowdData(crowd.slice(0, 5))
          setUpcomingEvents(events.slice(0, 6))
          setLastUpdated(new Date())
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()
    const timer = window.setInterval(loadDashboardData, POLL_INTERVAL_MS)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <h2>Welcome, {user?.first_name || user?.username}.</h2>
          <p>Convention updates, upcoming events, and live campus status.</p>
        </div>
        <span className="live-status">
          Updated {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
        </span>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="dashboard-grid">
          <section className="dashboard-section dashboard-section--wide">
            <div className="section-heading">
              <h3>Upcoming Events</h3>
              <Link to="/events">View all</Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p>No upcoming events posted yet.</p>
            ) : (
              <div className="dashboard-events">
                {upcomingEvents.map((event) => (
                  <article key={event.id} className="dashboard-event">
                    <span>{new Date(event.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <div>
                      <h4>{event.name}</h4>
                      <p>
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.location_name ? ` at ${event.location_name}` : ''}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section convention-calendar">
            <h3>Convention Calendar</h3>
            <div className="calendar-placeholder">
              <strong>Calendar placeholder</strong>
              <p>Convention sessions, services, and special meetings will appear here.</p>
            </div>
          </section>

          <section className="dashboard-section">
            <h3>Live Crowd Status</h3>
            {crowdData.length === 0 ? (
              <p>No crowd data available.</p>
            ) : (
              <div className="crowd-status">
                {crowdData.map((item) => (
                  <div key={item.id} className="crowd-item">
                    <p>{item.density_level?.toUpperCase()}</p>
                    <p>{Number(item.percentage_capacity || 0).toFixed(1)}% capacity</p>
                    <p>{item.estimated_people_count || 0} people</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/map">Start Navigation</Link>
              <Link to="/events">Browse Events</Link>
              <button type="button">Report Emergency</button>
              <button type="button">View Crowd Alerts</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
