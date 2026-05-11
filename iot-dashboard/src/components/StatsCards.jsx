import React from 'react'
import styles from './StatsCards.module.css'

const StatsCards = ({ latest, stats }) => {
  const cards = [
    {
      title: 'Temperatura Actual',
      value: latest?.temperature,
      unit: '°C',
      color: 'temperature',
      icon: '🌡️'
    },
    {
      title: 'Humedad Actual',
      value: latest?.humidity,
      unit: '%',
      color: 'humidity',
      icon: '💧'
    },
    {
      title: 'Promedio Temp',
      value: stats?.avgTemp,
      unit: '°C',
      color: 'average',
      icon: '📊'
    },
    {
      title: 'Total Lecturas',
      value: stats?.count,
      unit: '',
      color: 'count',
      icon: '📈'
    }
  ]

  const formatValue = (value) => {
    if (value === null || value === undefined) return '--'
    return typeof value === 'number' ? value.toFixed(1) : value
  }

  return (
    <div className={styles.container}>
      {cards.map((card, index) => (
        <div key={index} className={`${styles.card} ${styles[card.color]}`}>
          <div className={styles.icon}>{card.icon}</div>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.value}>
            {formatValue(card.value)}
            <span className={styles.unit}>{card.unit}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatsCards