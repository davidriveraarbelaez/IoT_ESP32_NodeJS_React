import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Navbar.module.css'

const Navbar = ({ wsConnected }) => {
  const { user, logout } = useAuth()

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.icon}>🌡️</span>
        <div>
          <h1 className={styles.title}>IoT Dashboard</h1>
          <span className={styles.subtitle}>ESP32 Monitor</span>
        </div>
      </div>

      <div className={styles.actions}>
        <span className={styles.user}>
          👤 {user?.username}
        </span>
        
        <span className={`${styles.status} ${wsConnected ? styles.online : styles.offline}`}>
          {wsConnected ? '🟢 En vivo' : '🔴 Desconectado'}
        </span>

        <button className={styles.logoutBtn} onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar