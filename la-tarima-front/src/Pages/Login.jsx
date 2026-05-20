import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../Api/axios'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      onLogin(response.data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-main)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 24, background: 'var(--bg-card)', boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em' }}>Iniciar sesión</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Solo los usuarios con rol de gerente pueden ingresar.</p>
        </div>

        {error && (
          <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Email del gerente
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="ejemplo@tarima.com"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', marginBottom: 16, background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
          />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="admin123"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', marginBottom: 24, background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
          />

          <button type="submit" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }} disabled={loading || !email.trim() || !password.trim()}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--text-secondary)' }}>
          Usa el email de un empleado con rol <strong>gerente</strong> registrado en staff.
        </div>
      </div>
    </div>
  )
}
