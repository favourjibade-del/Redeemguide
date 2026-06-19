import { apiClient } from './api'

export interface Location {
  id: string
  name: string
  description: string
  location_type: string
  latitude: number
  longitude: number
  address: string
  capacity?: number
  current_occupancy: number
  status: string
  image?: string
  contact_phone?: string
  contact_email?: string
  business_name?: string
  business_website?: string
}

export interface LocationCategory {
  id: string
  name: string
  description: string
  icon?: string
  color_code: string
}

export interface LocationReview {
  id: string
  location: string
  rating: number
  title: string
  review_text: string
  created_at: string
}

export interface Route {
  id: string
  name: string
  start_location: string
  end_location: string
  route_type: string
  distance_km: number
  estimated_time_minutes: number
  difficulty_level: string
  wheelchair_accessible: boolean
  waypoints?: Array<[number, number] | { latitude: number; longitude: number } | { lat: number; lng: number }>
}

class LocationService {
  async getLocations(filters?: any): Promise<Location[]> {
    const response = await apiClient.get<Location[] | { results: Location[] }>('/locations/', { params: filters })
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getLocation(id: string): Promise<Location> {
    const response = await apiClient.get<Location>(`/locations/${id}/`)
    return response.data
  }

  async createLocation(location: Partial<Location>): Promise<Location> {
    const response = await apiClient.post<Location>('/locations/', location)
    return response.data
  }

  async updateLocation(id: string, location: Partial<Location>): Promise<Location> {
    const response = await apiClient.patch<Location>(`/locations/${id}/`, location)
    return response.data
  }

  async getLocationsByType(locationType: string): Promise<Location[]> {
    return this.getLocations({ location_type: locationType })
  }

  async searchLocations(query: string): Promise<Location[]> {
    return this.getLocations({ search: query })
  }

  async getCategories(): Promise<LocationCategory[]> {
    const response = await apiClient.get<{ results: LocationCategory[] }>('/location-categories/')
    return response.data.results
  }

  async getLocationReviews(locationId: string): Promise<LocationReview[]> {
    const response = await apiClient.get<{ results: LocationReview[] }>('/location-reviews/', {
      params: { location: locationId }
    })
    return response.data.results
  }

  async addReview(locationId: string, review: Partial<LocationReview>): Promise<LocationReview> {
    const response = await apiClient.post<LocationReview>('/location-reviews/', {
      location: locationId,
      ...review
    })
    return response.data
  }

  async getRoutes(startLocationId: string, endLocationId: string): Promise<Route[]> {
    const response = await apiClient.get<Route[] | { results: Route[] }>('/routes/', {
      params: {
        start_location: startLocationId,
        end_location: endLocationId
      }
    })
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getAllRoutes(): Promise<Route[]> {
    const response = await apiClient.get<Route[] | { results: Route[] }>('/routes/')
    return Array.isArray(response.data) ? response.data : response.data.results
  }

  async getNearbyLocations(latitude: number, longitude: number, radiusKm: number = 1): Promise<Location[]> {
    return this.getLocations({
      latitude_min: latitude - radiusKm / 111,
      latitude_max: latitude + radiusKm / 111,
      longitude_min: longitude - radiusKm / (111 * Math.cos(latitude * Math.PI / 180)),
      longitude_max: longitude + radiusKm / (111 * Math.cos(latitude * Math.PI / 180))
    })
  }
}

export const locationService = new LocationService()
