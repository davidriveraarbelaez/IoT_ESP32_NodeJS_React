import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Login.module.css'

const Login = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(username, password)
        navigate('/', { replace: true })
      } else {
        await register(username, password)
        await login(username, password)
        navigate('/', { replace: true })
      }
    } catch (err) {
      console.error('Error completo:', err)
      setError(
        err.response?.data?.error || 
        err.message || 
        'Error de conexión con el servidor'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>🌡️ IoT Dashboard</h1>
          <p className={styles.subtitle}>ESP32 + DHT11 Monitoring</p>
        </div>

        <h2 className={styles.formTitle}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Usuario</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button 
            className={styles.button} 
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? '⏳ Cargando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
          </button>
        </form>

        <p 
          className={styles.toggle} 
          onClick={() => {
            setIsLogin(!isLogin)
            setError('')
          }}
        >
          {isLogin 
            ? '¿No tienes cuenta? Regístrate' 
            : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </div>
    </div>
  )
}

export default Login