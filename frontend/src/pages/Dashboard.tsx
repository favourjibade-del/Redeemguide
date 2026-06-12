import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { crowdIntelligenceService } from '../services/crowd'
import { eventService } from '../services/events'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [crowdData, setCrowdData] = useState<any[]>([])
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const crowd = await crowdIntelligenceService.getAllCrowdDensity()
      const events = await eventService.getMyRegistrations()
      setCrowdData(crowd.slice(0, 5))
      setMyEvents(events.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      
      <div className="dashboard-header">
        <h2>Welcome, {user?.first_name || user?.username}!</h2>
        <p>User Type: {user?.user_type}</p>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="dashboard-grid">
          <section className="dashboard-section">
            <h3>Real-time Crowd Status</h3>
            {crowdData.length === 0 ? (
              <p>No crowd data available</p>
            ) : (
              <div className="crowd-status">
                {crowdData.map((item) => (
                  <div key={item.id} className="crowd-item">
                    <p>{item.density_level.toUpperCase()}</p>
                    <p>{item.percentage_capacity.toFixed(1)}% capacity</p>
                    <p>{item.estimated_people_count} people</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h3>My Event Registrations</h3>
            {myEvents.length === 0 ? (
              <p>No registered events</p>
            ) : (
              <div className="my-events">
                {myEvents.map((registration) => (
                  <div key={registration.id} className="event-registration">
                    <p>Event: {registration.event}</p>
                    <p>Status: {registration.registration_status}</p>
                    <p>{registration.number_of_guests} guests</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button>Report Emergency</button>
              <button>Start Navigation</button>
              <button>Browse Events</button>
              <button>View Crowd Alerts</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
