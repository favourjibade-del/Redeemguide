import { useEffect, useState } from 'react'
import { eventService, Event } from '../../services/events'

export default function LiveDataBar() {
  const [liveEvents, setLiveEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true

    const loadLiveData = async () => {
      try {
        const [live, upcoming] = await Promise.all([
          eventService.getLiveEvents(),
          eventService.getUpcomingEvents()
        ])

        if (mounted) {
          setLiveEvents(live)
          setUpcomingEvents(upcoming.slice(0, 3))
          setLastUpdated(new Date())
        }
      } catch (error) {
        console.error('Error loading live data:', error)
      }
    }

    loadLiveData()
    const timer = window.setInterval(loadLiveData, 30000)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  const nextEvent = upcomingEvents[0]

  return (
    <aside className="live-data-bar" aria-label="Live RedeemGuide updates">
      <div className="live-data-bar__inner">
        <span className="live-pill">{liveEvents.length} live</span>
        <span>
          {nextEvent
            ? `Next: ${nextEvent.name} at ${new Date(nextEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'No upcoming events posted'}
        </span>
        <span className="live-data-bar__muted">
          Updated {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
        </span>
      </div>
    </aside>
  )
}
