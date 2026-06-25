import { apiClient } from './api'

export interface Event {
  id: string
  name: string
  description: string
  event_type: string
  status: string
  location: string | null
  manual_location?: string
  location_name?: string
  start_time: string
  end_time: string
  expected_attendance?: number
  current_attendees?: number
  image?: string
  speaker_names?: string[]
  tags?: string[]
  agenda?: any[]
  registration_url?: string
  is_free: boolean
  ticket_price?: number
  requires_registration?: boolean
  max_capacity?: number
}

export interface EventAttendee {
  id: string
  event: string
  user: string
  registration_status: string
  registration_time: string
  check_in_time?: string
}

export interface EventNotification {
  id: string
  event: string
  title: string
  message: string
  notification_type: string
}

class EventService {
  async getEvents(filters?: any): Promise<Event[]> {
    const response = await apiClient.get<Event[] | { results: Event[] }>('/events/', { params: filters })
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getEvent(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}/`)
    return response.data
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return this.getEvents({ status: 'upcoming' })
  }

  async getLiveEvents(): Promise<Event[]> {
    return this.getEvents({ status: 'live' })
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    const response = await apiClient.post<Event>('/events/', event)
    return response.data
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const response = await apiClient.patch<Event>(`/events/${id}/`, event)
    return response.data
  }

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}/`)
  }

  async searchEvents(query: string): Promise<Event[]> {
    return this.getEvents({ search: query })
  }

  async registerForEvent(eventId: string, numberOfGuests: number = 1): Promise<EventAttendee> {
    const response = await apiClient.post<EventAttendee>('/event-attendees/', {
      event: eventId,
      number_of_guests: numberOfGuests
    })
    return response.data
  }

  async getMyRegistrations(): Promise<EventAttendee[]> {
    const response = await apiClient.get<EventAttendee[] | { results: EventAttendee[] }>('/event-attendees/', {
      params: { status: 'registered' }
    })
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async checkInToEvent(attendeeId: string): Promise<EventAttendee> {
    const response = await apiClient.patch<EventAttendee>(`/event-attendees/${attendeeId}/`, {
      registration_status: 'checked_in'
    })
    return response.data
  }

  async cancelRegistration(attendeeId: string): Promise<void> {
    await apiClient.delete(`/event-attendees/${attendeeId}/`)
  }

  async getEventNotifications(eventId: string): Promise<EventNotification[]> {
    const response = await apiClient.get<{ results: EventNotification[] }>('/event-notifications/', {
      params: { event: eventId }
    })
    return response.data.results
  }
}

export const eventService = new EventService()
