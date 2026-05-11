import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'
import { CHART_COLORS } from '../utils/constants.js'

const SensorChart = ({ data }) => {
  const formatData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    temperatura: Number(item.temperature?.toFixed(1)),
    humedad: Number(item.humidity?.toFixed(1))
  }))

  if (formatData.length === 0) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#7f8c8d'
      }}>
        📊 No hay datos disponibles
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#2c3e50' }}>
            ⏰ {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0',
              color: entry.color,
              fontWeight: '500'
            }}>
              {entry.name === 'temperatura' ? '🌡️' : '💧'} {entry.name}: {entry.value}
              {entry.name === 'temperatura' ? '°C' : '%'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.temperature} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={CHART_COLORS.temperature} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.humidity} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={CHART_COLORS.humidity} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
            tickLine={false}
          />
          
          <YAxis 
            yAxisId="left" 
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
            tickLine={false}
            axisLine={false}
            label={{ value: '°C', position: 'insideLeft', style: { fill: CHART_COLORS.temperature } }}
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
            tickLine={false}
            axisLine={false}
            label={{ value: '%', position: 'insideRight', style: { fill: CHART_COLORS.humidity } }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: '#4a5568', fontWeight: 500 }}>
                {value === 'temperatura' ? '🌡️ Temperatura' : '💧 Humedad'}
              </span>
            )}
          />
          
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temperatura"
            stroke={CHART_COLORS.temperature}
            strokeWidth={3}
            fill="url(#tempGradient)"
            name="temperatura"
            dot={{ fill: CHART_COLORS.temperature, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="humedad"
            stroke={CHART_COLORS.humidity}
            strokeWidth={3}
            fill="url(#humGradient)"
            name="humedad"
            dot={{ fill: CHART_COLORS.humidity, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SensorChart