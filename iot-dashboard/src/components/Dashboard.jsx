import React, { useEffect, useCallback } from 'react'
import Navbar from './Navbar.jsx'
import StatsCards from './StatsCards.jsx'
import SensorChart from './SensorChart.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSensorData } from '../hooks/useSensorData.js'
import { useWebSocket } from '../hooks/useWebSocket.js'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { logout } = useAuth()
  const { 
    latest, 
    history, 
    stats, 
    loading, 
    error, 
    loadAll, 
    addDataPoint 
  } = useSensorData()

  // Manejar mensajes del WebSocket
  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'new_data') {
      addDataPoint(message.data)
    }
  }, [addDataPoint])

  const { connected: wsConnected } = useWebSocket(handleWebSocketMessage)

  // Cargar datos iniciales
  useEffect(() => {
    loadAll()
    
    // Fallback: actualizar cada 30 segundos
    const interval = setInterval(loadAll, 30000)
    return () => clearInterval(interval)
  }, [loadAll])

  const formatDate = (timestamp) => {
    if (!timestamp) return '--'
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className={styles.container}>
      <Navbar wsConnected={wsConnected} />

      {loading && history.length === 0 && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando datos...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
          <button onClick={loadAll} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      )}

      <StatsCards latest={latest} stats={stats} />

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📈 Historial de las últimas 24 horas</h2>
          <span className={styles.dataCount}>
            {history.length} puntos de datos
          </span>
        </div>
        <div className={styles.chartCard}>
          <SensorChart data={history} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📋 Últimas lecturas</h2>
        <div className={styles.tableCard}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Temperatura</th>
                  <th>Humedad</th>
                  <th>Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().slice(0, 10).map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? styles.even : styles.odd}>
                    <td className={styles.timeCell}>
                      {formatDate(item.timestamp)}
                    </td>
                    <td>
                      <span className={styles.tempBadge}>
                        {item.temperature?.toFixed(1)}°C
                      </span>
                    </td>
                    <td>
                      <span className={styles.humBadge}>
                        {item.humidity?.toFixed(1)}%
                      </span>
                    </td>
                    <td className={styles.deviceCell}>
                      {item.deviceId || 'Desconocido'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className={styles.emptyState}>
              📭 No hay lecturas disponibles
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>IoT Dashboard © 2026 | ESP32 + DHT11 + MongoDB + React</p>
      </footer>
    </div>
  )
}

export default Dashboard