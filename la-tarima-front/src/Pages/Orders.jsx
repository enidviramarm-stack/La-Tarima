import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search, Plus, X, Edit2, Trash2, Eye, ShoppingBag, CalendarDays,
  User, Hash, ChevronUp, ChevronDown, Users, MapPin, Clock,
  CreditCard, ChefHat, Minus, FileText, CheckCircle2, ImageOff,
  Coffee, UtensilsCrossed, Tag
} from 'lucide-react'
import api from '../Api/axios'

const API_BASE_URL = 'http://localhost:3000'

const CATEGORY_CONFIG = {
  comida: { label: 'Comida', color: '#92400E', bg: '#FEF3C7', icon: UtensilsCrossed },
  bebida: { label: 'Bebida', color: '#1E40AF', bg: '#DBEAFE', icon: Coffee },
  otro: { label: 'Otro', color: '#374151', bg: '#F3F4F6', icon: Tag }
}

const ORDER_STATUS = {
  abierto: { label: 'Abierto', color: '#1D4ED8', bg: '#DBEAFE' },
  enviado_cocina: { label: 'Enviado a cocina', color: '#B45309', bg: '#FEF3C7' },
  en_preparacion: { label: 'Preparando', color: '#F59E0B', bg: '#FEF3C7' },
  listo: { label: 'Listo', color: '#065F46', bg: '#D1FAE5' },
  servido: { label: 'Servido', color: '#374151', bg: '#F3F4F6' },
  cancelado: { label: 'Cancelado', color: '#B91C1C', bg: '#FEE2E2' },
}

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7' },
  confirmada: { label: 'Confirmada', color: '#1D4ED8', bg: '#DBEAFE' },
  en_curso: { label: 'En curso', color: '#065F46', bg: '#D1FAE5' },
  completada: { label: 'Completada', color: '#374151', bg: '#F3F4F6' },
  cancelada: { label: 'Cancelada', color: '#B91C1C', bg: '#FEE2E2' },
}

const PROCESS_STATUSES = ['enviado_cocina', 'en_preparacion', 'listo']
const RESERVATION_STATUSES_FOR_ORDERS = ['confirmada', 'en_curso']

const EMPTY_ORDER_FORM = {
  clientHint: '',
  notes: ''
}

const EMPTY_RESERVATION_FORM = {
  table_id: '',
  date: '',
  startTime: '',
  endTime: '',
  peopleCount: 1,
  channel: 'presencial',
  notes: '',
  status: 'pendiente',
  clientType: 'guest',
  clientRef: { fullname: '', docID: '' },
  guest: { fullname: '', phone: '', notes: '' },
  appliedCoupons: []
}

const fmt = (n) => '$ ' + Number(n || 0).toLocaleString('es-CO')

const fmtDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const timeToMinutes = (time) => {
  const [h, m] = String(time).split(':').map(Number)
  return h * 60 + m
}

const getDurationMinutes = (startTime, endTime) => {
  let start = timeToMinutes(startTime)
  let end = timeToMinutes(endTime)

  if (end <= start) {
    end += 24 * 60
  }

  return end - start
}

const customerName = (reservation) =>
  reservation?.clientRef?.fullname || reservation?.guest?.fullname || 'Sin cliente'

const tableLabel = (tableId, tables) => {
  const table = tables.find(t => t.table_id === tableId)
  if (!table) return tableId || '-'
  return `Mesa ${table.tableNumber}${table.zone ? ` - ${table.zone}` : ''}`
}

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return ''

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  if (imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${imageUrl}`
  }

  return imageUrl
}

const parseCollection = (res) => {
  const d = res?.data?.data || res?.data
  return Array.isArray(d) ? d : []
}

const getApiErrorMessage = (err, fallback = 'Error inesperado') => {
  const data = err.response?.data
  const details = data?.errors?.map(e => `${e.field}: ${e.message}`).join('\n')
  return `${data?.message || err.message || fallback}${details ? `\n\n${details}` : ''}`
}

function StatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || { label: status, color: '#666', bg: '#F3F4F6' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${cfg.color}25`, whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </span>
  )
}

function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.otro
  const Icon = cfg.icon

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${cfg.color}25`,
      whiteSpace: 'nowrap'
    }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16,
        width: '100%', maxWidth,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'modalIn 0.18s ease'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px', borderBottom: '1.5px solid var(--border)'
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 0.3 }}>
            {title}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', padding: 4
          }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid var(--border)', borderRadius: 8,
  fontSize: 14, fontFamily: 'var(--font-body)',
  outline: 'none', background: 'var(--bg-panel)',
  color: 'var(--text-primary)', boxSizing: 'border-box'
}

function Field({ label, required, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
        marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        {Icon && <Icon size={11} />}
        {label}{required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: '#FEE2E2', border: '1px solid #FECACA',
      borderRadius: 8, padding: '10px 14px', marginBottom: 16,
      fontSize: 13, color: '#B91C1C', whiteSpace: 'pre-line'
    }}>
      {message}
    </div>
  )
}

function OrderFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ? { ...initial } : EMPTY_ORDER_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.clientHint?.trim()) return setError('La referencia del cliente es obligatoria')

    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setError(getApiErrorMessage(e, 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Editar orden" onClose={onClose}>
      <ErrorBox message={error} />

      <Field label="Referencia del cliente" required icon={User}>
        <input
          style={inputStyle}
          value={form.clientHint || ''}
          onChange={e => set('clientHint', e.target.value)}
          placeholder="Ej: Juan Perez"
        />
      </Field>

      <Field label="Estado" required>
        <select
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
          value={form.status || 'abierto'}
          onChange={e => set('status', e.target.value)}
        >
          <option value="abierto">Abierto</option>
          <option value="enviado_cocina">Enviado a cocina</option>
          <option value="en_preparacion">En preparacion</option>
          <option value="listo">Listo</option>
          <option value="servido">Servido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </Field>

      <Field label="Notas" icon={Hash}>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
          value={form.notes || ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Notas adicionales de la orden..."
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button className="btn-primary" onClick={handleSubmit}
          disabled={saving} style={{ flex: 2, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  )
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null

  return (
    <Modal title={`Orden ${order.order_id}`} onClose={onClose} maxWidth={700}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Reserva</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{order.reservation_id}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Cliente</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{order.clientHint || 'Sin referencia'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Estado</div>
          <StatusBadge status={order.status} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Fecha</div>
          <div style={{ fontSize: 14 }}>{fmtDate(order.createdAt)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Items de la orden</div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {order.items?.map((item, i) => (
            <div key={`${item.product_id}-${i}`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {item.quantity} x {fmt(item.unitPrice)}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(item.quantity * item.unitPrice)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Total</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{fmt(order.totalAmount)}</div>
      </div>

      {order.notes && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Notas</div>
          <div style={{ fontSize: 14, padding: '8px 12px', background: 'var(--bg-main)', borderRadius: 6 }}>
            {order.notes}
          </div>
        </div>
      )}
    </Modal>
  )
}

function ConfirmDeleteModal({ order, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  return (
    <Modal title="Eliminar orden" onClose={onClose} maxWidth={420}>
      <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
        <ShoppingBag size={48} style={{ color: 'var(--text-secondary)', marginBottom: 14 }} />
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
          Eliminar orden <span style={{ color: 'var(--accent)' }}>{order.order_id}</span>?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Esta accion cancela la orden si el backend lo permite.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        <button
          disabled={loading}
          onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
          style={{
            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#EF4444', color: '#fff', border: 'none',
            borderRadius: 8, padding: '13px 20px', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', opacity: loading ? 0.7 : 1
          }}>
          <Trash2 size={15} />
          {loading ? 'Eliminando...' : 'Si, eliminar'}
        </button>
      </div>
    </Modal>
  )
}

function StartOrderModal({ onClose, onCreateReservation, onChooseReservation }) {
  return (
    <Modal title="Crear orden" onClose={onClose} maxWidth={560}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <button
          onClick={onCreateReservation}
          style={{
            border: '1.5px solid var(--border)', background: 'var(--bg-panel)',
            borderRadius: 12, padding: 18, textAlign: 'left', cursor: 'pointer'
          }}
        >
          <Plus size={22} color="#1D4ED8" />
          <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 5 }}>Crear reserva</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.45 }}>
            Registra una reserva nueva y continua con la orden.
          </div>
        </button>

        <button
          onClick={onChooseReservation}
          style={{
            border: '1.5px solid var(--border)', background: 'var(--bg-panel)',
            borderRadius: 12, padding: 18, textAlign: 'left', cursor: 'pointer'
          }}
        >
          <CalendarDays size={22} color="#065F46" />
          <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 5 }}>Elegir reserva</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.45 }}>
            Selecciona una reserva confirmada o en curso.
          </div>
        </button>
      </div>
    </Modal>
  )
}

function ReservationFormModal({ initial, tables, clients, onClose, onSave }) {
  const isEdit = !!initial?.reservation_id

  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        ...initial,
        clientType: initial.clientRef ? 'registered' : 'guest',
        clientRef: initial.clientRef ? { ...initial.clientRef } : { fullname: '', docID: '' },
        guest: initial.guest ? { ...initial.guest } : { fullname: '', phone: '', notes: '' },
        appliedCoupons: initial.appliedCoupons || []
      }
    }
    return {
      ...EMPTY_RESERVATION_FORM,
      clientType: 'guest',
      clientRef: { fullname: '', docID: '' }
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(initial?.clientRef ? { ...initial.clientRef } : null)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setGuest = (k, v) => setForm(f => ({ ...f, guest: { ...f.guest, [k]: v } }))

  const handleClientTypeChange = (type) => {
    setForm(f => ({
      ...f,
      clientType: type,
      ...(type === 'registered'
        ? { clientRef: { fullname: '', docID: '' }, guest: { fullname: '', phone: '', notes: '' } }
        : { guest: { fullname: '', phone: '', notes: '' }, clientRef: { fullname: '', docID: '' } })
    }))
    setSelectedClient(type === 'registered' && initial?.clientRef ? { ...initial.clientRef } : null)
    setClientSearch('')
  }

  const filteredClients = clients.filter(c => {
    const term = clientSearch.toLowerCase()
    return c.fullname?.toLowerCase().includes(term) || c.docID?.toLowerCase().includes(term)
  })

  const selectClient = (client) => {
    setSelectedClient(client)
    setForm(f => ({ ...f, clientRef: { fullname: client.fullname, docID: client.docID } }))
  }

  const handleSearchCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un codigo de cupon')
      return
    }

    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await api.get(`/discounts?code=${couponCode.trim().toUpperCase()}`)
      const coupons = res.data?.data || []

      if (coupons.length === 0) {
        setCouponError('Cupon no encontrado')
        setCouponLoading(false)
        return
      }

      const coupon = coupons[0]
      const now = new Date()
      const validFrom = new Date(coupon.validFrom)
      const validUntil = new Date(coupon.validUntil)

      if (!coupon.active) {
        setCouponError('Este cupon esta inactivo')
        setCouponLoading(false)
        return
      }

      if (now < validFrom) {
        setCouponError('Este cupon aun no esta disponible')
        setCouponLoading(false)
        return
      }

      if (now > validUntil) {
        setCouponError('Este cupon ha expirado')
        setCouponLoading(false)
        return
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        setCouponError('Este cupon ha alcanzado el limite de usos')
        setCouponLoading(false)
        return
      }

      if (form.appliedCoupons?.some(c => c.discount_id === coupon.discount_id)) {
        setCouponError('Este cupon ya esta aplicado')
        setCouponLoading(false)
        return
      }

      const appliedCoupon = {
        discount_id: coupon.discount_id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        stackable: coupon.stackable,
        consumed: false,
        appliedAt: new Date().toISOString()
      }

      setForm(f => ({
        ...f,
        appliedCoupons: [...(f.appliedCoupons || []), appliedCoupon]
      }))

      setCouponCode('')
      setCouponError('')
    } catch {
      setCouponError('Error al buscar el cupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = (discountId) => {
    setForm(f => ({
      ...f,
      appliedCoupons: (f.appliedCoupons || []).filter(c => c.discount_id !== discountId)
    }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.table_id) return setError('Selecciona una mesa')
    if (!form.date) return setError('La fecha es obligatoria')
    if (!form.startTime) return setError('La hora de inicio es obligatoria')
    if (!form.endTime) return setError('La hora de fin es obligatoria')

    const duration = getDurationMinutes(form.startTime, form.endTime)

    if (duration < 30) {
      return setError('La reserva debe tener una duracion minima de 30 minutos')
    }

    if (duration > 480) {
      return setError('La reserva no puede exceder 8 horas')
    }

    if (form.clientType === 'registered') {
      if (!selectedClient?.docID) return setError('Selecciona un cliente registrado')
    } else {
      if (!form.guest?.fullname) return setError('El nombre del cliente invitado es obligatorio')
    }

    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setError(getApiErrorMessage(e, 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  const activeTables = tables.filter(t => t.active !== false)

  return (
    <Modal title={isEdit ? 'Editar reservacion' : 'Nueva reservacion'} onClose={onClose}>
      {error && (
        <div style={{
          background: '#FEE2E2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          fontSize: 13, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <X size={14} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {['registered', 'guest'].map(type => (
          <button key={type}
            type="button"
            onClick={() => handleClientTypeChange(type)}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${form.clientType === type ? '#2563EB' : 'var(--border)'}`,
              background: form.clientType === type ? '#DBEAFE' : '#fff',
              color: form.clientType === type ? '#1D4ED8' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {type === 'registered' ? 'Cliente registrado' : 'Invitado'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Mesa" required>
            <select
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
              value={form.table_id}
              onChange={e => set('table_id', e.target.value)}
            >
              <option value="">Seleccionar mesa...</option>
              {activeTables.map(t => (
                <option key={t.table_id} value={t.table_id}>
                  Mesa {t.tableNumber} - {t.zone} (cap. {t.capacity} personas)
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Fecha" required>
          <input style={inputStyle} type="date" value={form.date}
            onChange={e => set('date', e.target.value)} />
        </Field>

        <Field label="Personas" required>
          <input style={inputStyle} type="number" min={1} max={50} value={form.peopleCount}
            onChange={e => set('peopleCount', Number(e.target.value))} />
        </Field>

        <Field label="Hora inicio" required>
          <input style={inputStyle} type="time" value={form.startTime}
            onChange={e => set('startTime', e.target.value)} />
        </Field>

        <Field label="Hora fin" required>
          <input style={inputStyle} type="time" value={form.endTime}
            onChange={e => set('endTime', e.target.value)} />
        </Field>

        <Field label="Canal">
          <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            value={form.channel} onChange={e => set('channel', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="telefono">Telefono</option>
            <option value="web">Web</option>
            <option value="presencial">Presencial</option>
            <option value="app">App</option>
          </select>
        </Field>

        {isEdit && (
          <Field label="Estado">
            <select style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
              value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16, marginTop: 4, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Datos del cliente
        </div>

        {form.clientType === 'registered' ? (
          <>
            <Field label="Buscar cliente registrado" required>
              <input style={inputStyle} value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Buscar por nombre o documento" />
            </Field>

            {selectedClient ? (
              <div style={{ gridColumn: '1 / -1', background: '#F3F4F6', border: '1.5px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Cliente seleccionado</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedClient.fullname}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedClient.docID}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedClient.phone}</div>
                  </div>
                  <button type="button" onClick={() => { setSelectedClient(null); setForm(f => ({ ...f, clientRef: { fullname: '', docID: '' } })) }}
                    style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', background: 'var(--bg-panel)', cursor: 'pointer' }}>
                    Cambiar cliente
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ gridColumn: '1 / -1' }}>
                {filteredClients.length === 0 ? (
                  <div style={{ padding: 14, color: 'var(--text-secondary)', fontSize: 13 }}>No se encontraron clientes.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                    {filteredClients.map(client => (
                      <button key={client.docID} type="button" onClick={() => selectClient(client)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)',
                          background: 'var(--bg-panel)', cursor: 'pointer', textAlign: 'left'
                        }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{client.fullname}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{client.docID} - {client.phone || 'Sin telefono'}</div>
                        </div>
                        <span style={{ color: '#2563EB', fontWeight: 700 }}>Seleccionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Nombre" required>
              <input style={inputStyle} value={form.guest?.fullname || ''}
                onChange={e => setGuest('fullname', e.target.value)}
                placeholder="Nombre completo" />
            </Field>
            <Field label="Telefono">
              <input style={inputStyle} value={form.guest?.phone || ''}
                onChange={e => setGuest('phone', e.target.value)}
                placeholder="3001234567" />
            </Field>
          </div>
        )}
      </div>

      {form.clientType === 'registered' && selectedClient && (
        <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
          <Field label="Cliente registrado" required>
            <input style={inputStyle} value={selectedClient.fullname} readOnly />
          </Field>
        </div>
      )}

      <Field label="Notas">
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 68 }}
          value={form.notes || ''} onChange={e => set('notes', e.target.value)}
          placeholder="Peticiones especiales, alergias, ocasion especial..." />
      </Field>

      <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: 16, marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          Cupones y descuentos
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <input
              style={inputStyle}
              value={couponCode}
              onChange={e => { setCouponCode(e.target.value); setCouponError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSearchCoupon()}
              placeholder="Ingresa codigo de cupon..."
              disabled={couponLoading}
            />
          </div>
          <button
            type="button"
            onClick={handleSearchCoupon}
            disabled={couponLoading || !couponCode.trim()}
            style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#2563EB', color: '#fff', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: 13,
              opacity: couponLoading || !couponCode.trim() ? 0.5 : 1
            }}
          >
            {couponLoading ? 'Buscando...' : 'Aplicar'}
          </button>
        </div>

        {couponError && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '8px 12px', marginBottom: 12,
            fontSize: 12, color: '#B91C1C'
          }}>
            {couponError}
          </div>
        )}

        {form.appliedCoupons && form.appliedCoupons.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.appliedCoupons.map(coupon => (
              <div key={coupon.discount_id} style={{
                background: '#F0FDF4', border: '1.5px solid #86EFAC',
                borderRadius: 10, padding: 12, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#166534' }}>
                    {coupon.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#4ADE80' }}>
                    Codigo: <strong>{coupon.code}</strong> - 
                    {coupon.type === 'percentage' ? ` ${coupon.value}%` : ` $${Number(coupon.value).toLocaleString('es-CO')}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCoupon(coupon.discount_id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#16A34A', padding: '8px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: 12, textAlign: 'center', color: 'var(--text-secondary)',
            fontSize: 13, background: 'var(--bg-main)', borderRadius: 8
          }}>
            Sin cupones aplicados
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleSubmit}
          disabled={saving}
          style={{ flex: 2, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear reservacion'}
        </button>
      </div>
    </Modal>
  )
}

function ChooseReservationModal({ reservations, tables, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const available = reservations.filter(res => {
    const q = query.toLowerCase()
    const name = customerName(res).toLowerCase()
    return RESERVATION_STATUSES_FOR_ORDERS.includes(res.status) && (
      res.reservation_id?.toLowerCase().includes(q) ||
      name.includes(q) ||
      res.table_id?.toLowerCase().includes(q)
    )
  })

  return (
    <Modal title="Elegir reserva" onClose={onClose} maxWidth={860}>
      <div className="search-bar" style={{ marginBottom: 14 }}>
        <Search size={15} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por cliente, reserva o mesa..." />
      </div>

      <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {available.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay reservas disponibles
          </div>
        ) : available.map(res => (
          <button
            key={res.reservation_id}
            onClick={() => onSelect(res)}
            style={{
              width: '100%', border: 'none', borderBottom: '1px solid var(--border-light)',
              background: 'var(--bg-panel)', padding: '13px 16px', cursor: 'pointer',
              display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 100px',
              gap: 12, alignItems: 'center', textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{customerName(res)}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{res.reservation_id}</div>
            </div>
            <div style={{ fontSize: 13 }}>{tableLabel(res.table_id, tables)}</div>
            <div style={{ fontSize: 13 }}>{res.date} - {res.startTime}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 700 }}>
              <Users size={13} /> {res.peopleCount}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}

function OrderProductCard({ product, onAdd, index }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border-light)',
      borderRadius: 14,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.15s, transform 0.15s',
      animation: `fadeIn 0.2s ease ${index * 0.04}s both`,
      position: 'relative'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <button
        title="Agregar a la orden"
        onClick={() => onAdd(product)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 2,
          width: 34,
          height: 34,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1D4ED8',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.16)'
        }}
      >
        <Plus size={16} />
      </button>

      <div style={{
        width: '100%',
        aspectRatio: '4/3',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {product.imageUrl && !imgErr ? (
          <img
            src={getImageSrc(product.imageUrl)}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <ImageOff size={36} style={{ opacity: 0.25 }} />
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {product.name}
          </div>
          <CategoryBadge category={product.category} />
        </div>

        {product.description && (
          <div style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </div>
        )}

        <div style={{
          marginTop: 'auto',
          paddingTop: 8,
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 1 }}>Precio</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {fmt(product.basePrice)}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>
            {product.product_id}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateOrderModal({ reservation, tables, products, onClose, onCreate }) {
  const [cart, setCart] = useState([])
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredProducts = products.filter(p => {
    const q = query.toLowerCase()
    return p.active !== false && (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q)
    )
  })

  const addProduct = (product) => {
    setCart(prev => {
      const current = prev.find(item => item.product_id === product.product_id)
      if (current) {
        return prev.map(item => item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
        )
      }
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        quantity: 1,
        unitPrice: product.basePrice
      }]
    })
  }

  const updateQty = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product_id !== productId))
      return
    }
    setCart(prev => prev.map(item => item.product_id === productId ? { ...item, quantity } : item))
  }

  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const submit = async () => {
    setError('')
    if (cart.length === 0) return setError('Agrega al menos un producto')

    setSaving(true)
    try {
      await onCreate({
        reservation_id: reservation.reservation_id,
        notes: note.trim(),
        items: cart
      })
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error creando orden'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Crear orden" onClose={onClose} maxWidth={980}>
      <ErrorBox message={error} />

      <div style={{
        background: 'var(--bg-main)', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: 12, marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', gap: 12
      }}>
        <div>
          <div style={{ fontWeight: 700 }}>{customerName(reservation)}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{reservation.reservation_id}</div>
        </div>
        <div style={{ fontWeight: 700 }}>{tableLabel(reservation.table_id, tables)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
        <div>
          <div className="search-bar" style={{ marginBottom: 12 }}>
            <Search size={15} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar productos..." />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 18,
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 4
          }}>
            {filteredProducts.map((product, i) => (
              <OrderProductCard
                key={product.product_id}
                product={product}
                index={i}
                onAdd={addProduct}
              />
            ))}
          </div>
        </div>

        <div style={{
          border: '1.5px solid var(--border)', borderRadius: 12,
          overflow: 'hidden', alignSelf: 'start'
        }}>
          <div style={{ padding: '13px 16px', background: 'var(--bg-main)', borderBottom: '1.5px solid var(--border)', fontWeight: 700 }}>
            Carrito
          </div>

          <div style={{ padding: 14, maxHeight: 310, overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 28 }}>
                Agrega productos
              </div>
            ) : cart.map(item => (
              <div key={item.product_id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 10,
                padding: '10px 0', borderBottom: '1px solid var(--border-light)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmt(item.unitPrice)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} style={smallIconButton}><Minus size={12} /></button>
                    <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} style={smallIconButton}><Plus size={12} /></button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{fmt(item.quantity * item.unitPrice)}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, borderTop: '1.5px solid var(--border)' }}>
            <Field label="Nota opcional" icon={FileText}>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 12 }}>
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
            <button className="btn-primary" onClick={submit} disabled={saving || cart.length === 0} style={{ width: '100%', opacity: saving || cart.length === 0 ? 0.65 : 1 }}>
              {saving ? 'Generando...' : 'Generar orden'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const smallIconButton = {
  width: 26, height: 26, borderRadius: 6,
  border: '1.5px solid var(--border)', background: 'var(--bg-panel)',
}

function ReservationPanel({
  reservation,
  tables,
  orders,
  paymentsByOrder,
  onClose,
  onOpenCreateOrder,
  onSendKitchen,
  onGeneratePayment
}) {
  if (!reservation) return null

  return (
    <section style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14,
      overflow: 'hidden', boxShadow: 'var(--shadow-card)', marginBottom: 24
    }}>
      <div style={{
        padding: '16px 20px', background: 'var(--bg-main)',
        borderBottom: '1.5px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 4 }}>
            Orden para {customerName(reservation)}
          </div>
          <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: 13, flexWrap: 'wrap' }}>
            <span>{reservation.reservation_id}</span>
            <span>{tableLabel(reservation.table_id, tables)}</span>
            <span>{reservation.peopleCount} personas</span>
            <span>{reservation.date} {reservation.startTime}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} onClick={onOpenCreateOrder}>
            <Plus size={16} /> Crear orden
          </button>
          <button className="btn-secondary" style={{ width: 'auto', padding: '10px 14px' }} onClick={onClose}>
            Cerrar panel
          </button>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {orders.length === 0 ? (
          <div style={{ padding: 34, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Aún no se han creado ordenes
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {orders.map(order => {
              const orderPayments = paymentsByOrder[order.order_id] || []
              const hasPayment = orderPayments.length > 0
              const kitchenDisabled = order.status !== 'abierto'

              return (
                <div key={order.order_id} style={{
                  border: '1.5px solid var(--border)', borderRadius: 12,
                  overflow: 'hidden', background: 'var(--bg-card)'
                }}>
                  <div style={{
                    padding: '12px 14px', background: 'var(--bg-main)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10
                  }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{order.order_id}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{fmtDate(order.createdAt)}</div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div style={{ padding: 14 }}>
                    {(order.items || []).map(item => (
                      <div key={`${order.order_id}-${item.product_id}`} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '5px 0', fontSize: 13
                      }}>
                        <span>{item.quantity} x {item.name}</span>
                        <strong>{fmt(item.quantity * item.unitPrice)}</strong>
                      </div>
                    ))}

                    {order.notes && (
                      <div style={{
                        marginTop: 10, padding: 10, borderRadius: 8,
                        background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: 12
                      }}>
                        {order.notes}
                      </div>
                    )}

                    <div style={{
                      borderTop: '1px solid var(--border-light)', marginTop: 12,
                      paddingTop: 12, display: 'flex', justifyContent: 'space-between',
                      fontWeight: 700
                    }}>
                      <span>Total</span>
                      <span>{fmt(order.totalAmount)}</span>
                    </div>

                    {hasPayment && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#065F46', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={13} />
                        Pago generado: {orderPayments[0].payment_id}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button
                        onClick={() => onSendKitchen(order)}
                        disabled={kitchenDisabled}
                        style={{
                          flex: 1, border: 'none', borderRadius: 8,
                          background: kitchenDisabled ? '#E5E7EB' : '#F59E0B',
                          color: kitchenDisabled ? '#6B7280' : '#fff',
                          padding: '10px 12px', fontWeight: 700,
                          cursor: kitchenDisabled ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ChefHat size={15} /> Enviar a cocina
                      </button>
                      <button
                        onClick={() => onGeneratePayment(order)}
                        disabled={hasPayment || order.status === 'cancelado'}
                        style={{
                          flex: 1, border: 'none', borderRadius: 8,
                          background: hasPayment || order.status === 'cancelado' ? '#E5E7EB' : '#065F46',
                          color: hasPayment || order.status === 'cancelado' ? '#6B7280' : '#fff',
                          padding: '10px 12px', fontWeight: 700,
                          cursor: hasPayment || order.status === 'cancelado' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <CreditCard size={15} /> Generar pago
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function FilterPill({ label, active, activeColor, activeBg, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: 13,
      fontWeight: active ? 600 : 400, transition: 'all 0.12s',
      border: active ? `1.5px solid ${activeColor}` : '1.5px solid var(--border)',
      background: active ? activeBg : 'var(--bg-panel)',
      color: active ? activeColor : 'var(--text-secondary)',
    }}>
      {label}
    </button>
  )
}

function ActionBtn({ icon: Icon, onClick, title, hoverColor }) {
  const [h, setH] = useState(false)
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${h ? hoverColor : 'var(--border)'}`,
        background: h ? hoverColor + '15' : 'transparent',
        color: h ? hoverColor : 'var(--text-secondary)',
        transition: 'all 0.12s'
      }}>
      <Icon size={13} />
    </button>
  )
}

function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field
  return (
    <div
      onClick={() => onSort(field)}
      style={{
        fontSize: 11, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
        userSelect: 'none', transition: 'color 0.12s'
      }}>
      {label}
      {active
        ? (sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
        : <ChevronDown size={11} style={{ opacity: 0.3 }} />}
    </div>
  )
}

function OrderRow({ order, onView, onEdit, onDelete, index }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 1.2fr 120px',
      alignItems: 'center', gap: 12,
      padding: '13px 20px', background: 'var(--bg-card)',
      borderBottom: '1.5px solid var(--border-light)',
      animation: `fadeIn 0.2s ease ${index * 0.03}s both`,
      transition: 'background 0.1s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-panel)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <ShoppingBag size={11} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.5px', fontWeight: 600 }}>
          {order.order_id}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Hash size={11} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13 }}>{order.reservation_id}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
        <User size={11} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.clientHint || 'Sin referencia'}
        </span>
      </div>

      <StatusBadge status={order.status} />

      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
        {fmt(order.totalAmount)}
      </div>

      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
        <ActionBtn icon={Eye} onClick={() => onView(order)} title="Ver detalle" hoverColor="#3B82F6" />
        <ActionBtn icon={Edit2} onClick={() => onEdit(order)} title="Editar" hoverColor="#F59E0B" />
        <ActionBtn icon={Trash2} onClick={() => onDelete(order)} title="Eliminar" hoverColor="#EF4444" />
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [sort, setSort] = useState({ field: 'createdAt', dir: 'desc' })
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [showStartModal, setShowStartModal] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showChooseReservation, setShowChooseReservation] = useState(false)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const load = useCallback(async () => {
    setLoading(true)
    const [ordersResult, reservationsResult, tablesResult, clientsResult, productsResult, paymentsResult] = await Promise.allSettled([
      api.get('/orders?limit=100'),
      api.get('/reservations?limit=100'),
      api.get('/tables?showInactive=true'),
      api.get('/clients?limit=100'),
      api.get('/products?showInactive=true&limit=100'),
      api.get('/payments?limit=100')
    ])

    setOrders(ordersResult.status === 'fulfilled' ? parseCollection(ordersResult.value) : [])
    setReservations(reservationsResult.status === 'fulfilled' ? parseCollection(reservationsResult.value) : [])
    setTables(tablesResult.status === 'fulfilled' ? parseCollection(tablesResult.value) : [])
    setClients(clientsResult.status === 'fulfilled' ? parseCollection(clientsResult.value) : [])
    setProducts(productsResult.status === 'fulfilled' ? parseCollection(productsResult.value) : [])
    setPayments(paymentsResult.status === 'fulfilled' ? parseCollection(paymentsResult.value) : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const paymentsByOrder = useMemo(() => payments.reduce((acc, payment) => {
    if (!payment.order_id) return acc
    if (!acc[payment.order_id]) acc[payment.order_id] = []
    acc[payment.order_id].push(payment)
    return acc
  }, {}), [payments])

  const ordersByReservation = useMemo(() => orders.reduce((acc, order) => {
    if (!order.reservation_id) return acc
    if (!acc[order.reservation_id]) acc[order.reservation_id] = []
    acc[order.reservation_id].push(order)
    return acc
  }, {}), [orders])

  const selectedReservation = reservations.find(r => r.reservation_id === selectedReservationId)
  const selectedReservationOrders = selectedReservation ? (ordersByReservation[selectedReservation.reservation_id] || []) : []

  const filtered = orders
    .filter(o => {
      const q = search.toLowerCase()
      const matchSearch =
        o.order_id?.toLowerCase().includes(q) ||
        o.reservation_id?.toLowerCase().includes(q) ||
        (o.clientHint || '').toLowerCase().includes(q)
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'en_proceso' && PROCESS_STATUSES.includes(o.status)) ||
        o.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      let va = a[sort.field] || '', vb = b[sort.field] || ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (field) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' })
    setPage(1)
  }

  const stats = {
    total: orders.length,
    abiertos: orders.filter(o => o.status === 'abierto').length,
    enProceso: orders.filter(o => PROCESS_STATUSES.includes(o.status)).length,
    completados: orders.filter(o => o.status === 'servido').length,
    cancelados: orders.filter(o => o.status === 'cancelado').length,
  }

  const handleEdit = async (form) => {
    const payload = {
      clientHint: form.clientHint?.trim(),
      status: form.status,
      notes: form.notes?.trim()
    }
    await api.patch(`/orders/${form.order_id}`, payload)
    await load()
  }

  const handleDelete = async () => {
    await api.delete(`/orders/${deleteTarget.order_id}`)
    await load()
    setDeleteTarget(null)
  }

  const buildReservationPayload = (form) => {
    const payload = {
      table_id: form.table_id,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      peopleCount: Number(form.peopleCount),
      channel: form.channel,
      ...(form.notes?.trim() && { notes: form.notes.trim() }),
      ...(form.appliedCoupons && form.appliedCoupons.length > 0 && { appliedCoupons: form.appliedCoupons })
    }

    if (form.clientType === 'registered') {
      payload.clientRef = {
        fullname: form.clientRef.fullname,
        docID: form.clientRef.docID
      }
    } else {
      payload.guest = {
        fullname: form.guest.fullname,
        ...(form.guest.phone && { phone: form.guest.phone }),
        ...(form.guest.notes && { notes: form.guest.notes })
      }
    }

    return payload
  }

  const handleCreateReservation = async (form) => {
    const created = await api.post('/reservations', buildReservationPayload(form))
    const reservation = created.data

    let readyReservation = reservation
    if (reservation.status === 'pendiente') {
      const updated = await api.patch(`/reservations/${reservation.reservation_id}`, { status: 'confirmada' })
      readyReservation = updated.data
    }

    setSelectedReservationId(readyReservation.reservation_id)
    await load()
  }

  const handleSelectReservation = (reservation) => {
    setSelectedReservationId(reservation.reservation_id)
    setShowChooseReservation(false)
  }

  const handleCreateOrder = async (payload) => {
    await api.post('/orders', payload)
    await load()
  }

  const handleSendKitchen = async (order) => {
    setActionLoading(true)
    try {
      await api.patch(`/orders/${order.order_id}/status`, { status: 'enviado_cocina' })
      await load()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error enviando orden a cocina'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleGeneratePayment = async (order) => {
    setActionLoading(true)
    try {
      await api.post('/payments', {
        reservation_id: order.reservation_id,
        order_id: order.order_id,
        scope: 'order',
        amount: Number(order.totalAmount || 0),
        method: 'efectivo',
        status: 'pendiente'
      })
      await load()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error generando pago'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: 28 }}>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:none } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) }     to { opacity:1; transform:none } }
        button:disabled { pointer-events: auto; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 0.5, marginBottom: 4 }}>
            Ordenes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Gestiona pedidos, cocina y pagos por reserva
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '11px 20px' }}
          onClick={() => setShowStartModal(true)}
        >
          <Plus size={16} /> Crear orden
        </button>
      </div>

      <ReservationPanel
        reservation={selectedReservation}
        tables={tables}
        orders={selectedReservationOrders}
        paymentsByOrder={paymentsByOrder}
        onClose={() => setSelectedReservationId('')}
        onOpenCreateOrder={() => setShowCreateOrder(true)}
        onSendKitchen={handleSendKitchen}
        onGeneratePayment={handleGeneratePayment}
      />

      {actionLoading && (
        <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
          Procesando accion...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', val: stats.total, color: 'var(--text-primary)', bg: '#fff', border: 'var(--border)' },
          { label: 'Abiertos', val: stats.abiertos, color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE' },
          { label: 'En proceso', val: stats.enProceso, color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
          { label: 'Completados', val: stats.completados, color: '#065F46', bg: '#D1FAE5', border: '#A7F3D0' },
          { label: 'Cancelados', val: stats.cancelados, color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
        ].map(({ label, val, color, bg, border }) => (
          <div key={label} style={{
            background: bg, border: `1.5px solid ${border}`,
            borderRadius: 12, padding: '16px 20px',
            animation: 'fadeIn 0.25s ease both'
          }}>
            <div style={{ fontSize: 30, fontFamily: 'var(--font-display)', color, lineHeight: 1, marginBottom: 4 }}>
              {val}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <Search size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID de orden, reserva o cliente..."
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex'
            }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <FilterPill label="Todos" active={statusFilter === 'todos'} activeColor="#111" activeBg="#F3F4F6" onClick={() => setStatusFilter('todos')} />
          <FilterPill label="Abiertos" active={statusFilter === 'abierto'} activeColor="#1D4ED8" activeBg="#DBEAFE" onClick={() => setStatusFilter('abierto')} />
          <FilterPill label="En proceso" active={statusFilter === 'en_proceso'} activeColor="#F59E0B" activeBg="#FEF3C7" onClick={() => setStatusFilter('en_proceso')} />
          <FilterPill label="Completados" active={statusFilter === 'servido'} activeColor="#065F46" activeBg="#D1FAE5" onClick={() => setStatusFilter('servido')} />
          <FilterPill label="Cancelados" active={statusFilter === 'cancelado'} activeColor="#B91C1C" activeBg="#FEE2E2" onClick={() => setStatusFilter('cancelado')} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)', fontSize: 14 }}>
          Cargando ordenes...
        </div>
      ) : paginated.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)', fontSize: 14 }}>
          <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
          <div>Aún no se han creado ordenes</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            {filtered.length} orden{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 2fr 1fr 1.2fr 120px',
            gap: 12, padding: '12px 20px',
            background: 'var(--bg-main)', borderRadius: '12px 12px 0 0',
            border: '1.5px solid var(--border)', borderBottom: 'none'
          }}>
            <SortHeader label="Orden" field="order_id" sort={sort} onSort={handleSort} />
            <SortHeader label="Reserva" field="reservation_id" sort={sort} onSort={handleSort} />
            <SortHeader label="Cliente" field="clientHint" sort={sort} onSort={handleSort} />
            <SortHeader label="Estado" field="status" sort={sort} onSort={handleSort} />
            <SortHeader label="Total" field="totalAmount" sort={sort} onSort={handleSort} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Acciones
            </div>
          </div>

          <div style={{
            border: '1.5px solid var(--border)',
            borderTop: 'none', borderRadius: '0 0 12px 12px',
            overflow: 'hidden'
          }}>
            {paginated.map((order, i) => (
              <OrderRow
                key={order.order_id}
                order={order}
                index={i}
                onView={o => setViewTarget(o)}
                onEdit={o => { setEditTarget(o); setShowForm(true) }}
                onDelete={o => setDeleteTarget(o)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6,
                  background: page === 1 ? '#F3F4F6' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}>
                Anterior
              </button>
              <span style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6,
                  background: page === totalPages ? '#F3F4F6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {showStartModal && (
        <StartOrderModal
          onClose={() => setShowStartModal(false)}
          onCreateReservation={() => { setShowStartModal(false); setShowReservationForm(true) }}
          onChooseReservation={() => { setShowStartModal(false); setShowChooseReservation(true) }}
        />
      )}

      {showReservationForm && (
        <ReservationFormModal
          tables={tables}
          clients={clients}
          onClose={() => setShowReservationForm(false)}
          onSave={handleCreateReservation}
        />
      )}

      {showChooseReservation && (
        <ChooseReservationModal
          reservations={reservations}
          tables={tables}
          onClose={() => setShowChooseReservation(false)}
          onSelect={handleSelectReservation}
        />
      )}

      {showCreateOrder && selectedReservation && (
        <CreateOrderModal
          reservation={selectedReservation}
          tables={tables}
          products={products}
          onClose={() => setShowCreateOrder(false)}
          onCreate={handleCreateOrder}
        />
      )}

      {showForm && (
        <OrderFormModal
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleEdit}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          order={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {viewTarget && (
        <OrderDetailModal
          order={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  )
}
