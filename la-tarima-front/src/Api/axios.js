import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

/**
 * Interceptor para manejar errores globales
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Acceso no autorizado. Por favor inicia sesión.')
    }
    if (error.response?.status === 403) {
      console.warn('No tienes permisos para acceder a este recurso.')
    }
    return Promise.reject(error)
  }
)

export default api
