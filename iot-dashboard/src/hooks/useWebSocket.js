import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL } from '../utils/constants.js'

export const useWebSocket = (onMessage) => {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log('✅ WebSocket conectado')
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage?.(message)
      } catch (error) {
        console.error('Error parseando mensaje WS:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket desconectado')
      setConnected(false)
    }

    ws.onerror = (error) => {
      console.error('Error WebSocket:', error)
      setConnected(false)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [onMessage])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { connected, send }
}