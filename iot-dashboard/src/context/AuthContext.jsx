import React, { createContext, useState, useContext, useCallback } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password
    })
    const { token, username: name } = response.data
    const userData = { token, username: name }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }, [])

  const register = useCallback(async (username, password) => {
    await api.post('/api/auth/register', { username, password })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }, [])

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}