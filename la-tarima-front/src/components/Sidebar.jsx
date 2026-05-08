import { NavLink } from 'react-router-dom'
import {
  Home, ShoppingCart, CalendarDays, Users,
  Package, CreditCard, UserCog, BarChart3,
  Settings, LogOut
} from 'lucide-react'

const NAV = [
  { to: '/',             label: 'Inicio',      icon: Home },
  { to: '/orders',       label: 'Órdenes',     icon: ShoppingCart },
  { to: '/reservations', label: 'Reservación', icon: CalendarDays },
  { to: '/clients',      label: 'Clientes',    icon: Users },
  { to: '/products',     label: 'Productos',   icon: Package },
  { to: '/payments',     label: 'Pagos',       icon: CreditCard },
  { to: '/staff',        label: 'Staff',       icon: UserCog },
  { to: '/reports',      label: 'Reportes',    icon: BarChart3 },
  { to: '/settings',     label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid #1E1E1E'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #1E1E1E'
      }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: '#ffffff',
          border: '2px solid #000000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto'
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            color: '#E53E3E',
            letterSpacing: '1px',
            textAlign: 'center',
            lineHeight: 1.2
          }}>LA<br/>TARIMA</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#FFFFFF' : '#888888',
              background: isActive ? '#1E1E1E' : 'transparent',
              transition: 'all 0.15s'
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} color={isActive ? '#E53E3E' : '#666'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Shift */}
      <div style={{
        padding: '14px 14px',
        borderTop: '1px solid #1E1E1E'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 10px',
          borderRadius: 8,
          background: '#1A1A1A',
          marginBottom: 12
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#2A2A2A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserCog size={16} color="#888" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#DDD' }}>Felipe García</div>
            <div style={{ fontSize: 11, color: '#666' }}>Mesero</div>
          </div>
        </div>

        <div style={{
          background: '#1A1A1A',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 10
        }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Turno actual</div>
          <div style={{ fontSize: 12, color: '#888' }}>{dateStr} · {timeStr}</div>
        </div>

        <button style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '9px',
          borderRadius: 8,
          border: '1px solid #2A2A2A',
          background: 'transparent',
          color: '#666',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#1E1E1E'
            e.currentTarget.style.color = '#DDD'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#666'
          }}
        >
          <LogOut size={14} />
          Cerrar turno
        </button>
      </div>
    </aside>
  )
}
