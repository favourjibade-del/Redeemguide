import { apiClient } from './api'

export interface CrowdDensity {
  id: string
  location: string
  density_level: string
  estimated_people_count: number
  percentage_capacity: number
  recorded_at: string
}

export interface CrowdAlert {
  id: string
  location: string
  alert_type: string
  severity: string
  status: string
  title: string
  description: string
  latitude?: number
  longitude?: number
}

export interface CrowdFlow {
  id: string
  start_location: string
  end_location: string
  direction: string
  speed: string
  estimated_flow_rate: number
  congestion_level: number
}

export interface PredictedCongestion {
  id: string
  location: string
  predicted_time: string
  predicted_crowd_percentage: number
  confidence_level: number
}

class CrowdIntelligenceService {
  async getCrowdDensity(locationId: string): Promise<CrowdDensity | null> {
    try {
      const response = await apiClient.get<{ results: CrowdDensity[] }>('/crowd-density/', {
        params: { location: locationId, ordering: '-recorded_at', limit: 1 }
      })
      return response.data.results[0] || null
    } catch (error) {
      return null
    }
  }

  async getAllCrowdDensity(): Promise<CrowdDensity[]> {
    const response = await apiClient.get<{ results: CrowdDensity[] }>('/crowd-density/', {
      params: { ordering: '-recorded_at' }
    })
    return response.data.results
  }

  async getCrowdAlerts(filters?: any): Promise<CrowdAlert[]> {
    const response = await apiClient.get<{ results: CrowdAlert[] }>('/crowd-alerts/', {
      params: { status: 'active', ...filters }
    })
    return response.data.results
  }

  async getCrowdAlert(id: string): Promise<CrowdAlert> {
    const response = await apiClient.get<CrowdAlert>(`/crowd-alerts/${id}/`)
    return response.data
  }

  async reportCrowdIssue(data: Partial<CrowdAlert>): Promise<CrowdAlert> {
    const response = await apiClient.post<CrowdAlert>('/crowd-alerts/', data)
    return response.data
  }

  async getCrowdFlow(startLocationId?: string, endLocationId?: string): Promise<CrowdFlow[]> {
    const params: any = {}
    if (startLocationId) params.start_location = startLocationId
    if (endLocationId) params.end_location = endLocationId
    
    const response = await apiClient.get<{ results: CrowdFlow[] }>('/crowd-flow/', { params })
    return response.data.results
  }

  async getPredictedCongestion(locationId: string): Promise<PredictedCongestion | null> {
    try {
      const response = await apiClient.get<{ results: PredictedCongestion[] }>('/predicted-congestion/', {
        params: { location: locationId, ordering: 'predicted_time', limit: 1 }
      })
      return response.data.results[0] || null
    } catch (error) {
      return null
    }
  }

  async getCrowdTrends(locationId: string, days: number = 7): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/crowd-density/`, {
        params: {
          location: locationId,
          days,
          ordering: '-recorded_at'
        }
      })
      return response.data.results
    } catch (error) {
      return []
    }
  }

  getDensityColor(level: string): string {
    const colors: { [key: string]: string } = {
      'empty': '#00AA00',
      'low': '#00FF00',
      'moderate': '#FFFF00',
      'high': '#FF9900',
      'very_high': '#FF3300',
      'critical': '#CC0000'
    }
    return colors[level] || '#808080'
  }

  getDensityPercentage(level: string): number {
    const percentages: { [key: string]: number } = {
      'empty': 10,
      'low': 25,
      'moderate': 50,
      'high': 75,
      'very_high': 90,
      'critical': 100
    }
    return percentages[level] || 0
  }
}

export const crowdIntelligenceService = new CrowdIntelligenceService()
