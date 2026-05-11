export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  SENSOR_DATA: '/api/sensor/data',
  SENSOR_LATEST: '/api/sensor/latest',
  SENSOR_HISTORY: '/api/sensor/history',
  SENSOR_STATS: '/api/sensor/stats'
}

export const CHART_COLORS = {
  temperature: '#e74c3c',
  humidity: '#3498db',
  grid: '#e0e0e0',
  tooltip: 'rgba(255, 255, 255, 0.95)'
}