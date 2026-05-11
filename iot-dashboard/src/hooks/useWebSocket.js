import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (onMessage) => {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    // ✅ Usar URL completa o proxy
    const wsUrl = 'ws://localhost:3001'  // Conexión directa
    
    console.log('🔌 Intentando conectar WebSocket a:', wsUrl)
    
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket conectado')
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('📡 Mensaje WS recibido:', message)
        onMessage?.(message)
      } catch (error) {
        console.error('Error parseando mensaje WS:', error)
      }
    }

    ws.onclose = (event) => {
      console.log('🔴 WebSocket desconectado', event.code, event.reason)
      setConnected(false)
    }

    ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error)
      setConnected(false)
    }

    wsRef.current = ws

    return () => {
      console.log('🧹 Limpiando WebSocket')
      ws.close()
    }
  }, [onMessage])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.warn('⚠️ WebSocket no está conectado')
    }
  }, [])

  return { connected, send }
}