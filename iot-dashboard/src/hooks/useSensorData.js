import { useState, useCallback } from 'react'
import api from '../services/api.js'

export const useSensorData = () => {
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadLatest = useCallback(async () => {
    try {
      const response = await api.get('/sensor/latest')
      setLatest(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando datos')
      throw err
    }
  }, [])

  const loadHistory = useCallback(async (hours = 24, limit = 100) => {
    try {
      const response = await api.get(`/sensor/history?hours=${hours}&limit=${limit}`)
      setHistory(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando historial')
      throw err
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/sensor/stats')
      setStats(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Error cargando estadísticas')
      throw err
    }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadLatest(), loadHistory(), loadStats()])
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }, [loadLatest, loadHistory, loadStats])

  const addDataPoint = useCallback((newData) => {
    setLatest(newData)
    setHistory(prev => {
      const updated = [...prev, newData]
      return updated.slice(-100)
    })
  }, [])

  return {
    latest,
    history,
    stats,
    loading,
    error,
    loadLatest,
    loadHistory,
    loadStats,
    loadAll,
    addDataPoint
  }
}