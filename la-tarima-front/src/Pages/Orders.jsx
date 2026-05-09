import { useState, useEffect } from 'react'
import { Search, Bell, ChevronDown, CalendarDays, Clock, Users, MapPin, User, Phone, ShoppingBag, CreditCard, CheckCircle2, Circle, XCircle, RefreshCw, Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import OrderPanel from '../components/OrderPanel'
import CategoryFilter from '../components/CategoryFilter'
import api from '../Api/axios'

// ─── CONSTANTES ───────────────────────────────────────────────
const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: '#B45309', bg: '#FEF3C7' },
  confirmada: { label: 'Confirmada', color: '#1D4ED8', bg: '#DBEAFE' },
  en_curso:   { label: 'En curso',   color: '#065F46', bg: '#D1FAE5' },
  completada: { label: 'Completada', color: '#374151', bg: '#F3F4F6' },
  cancelada:  { label: 'Cancelada',  color: '#B91C1C', bg: '#FEE2E2' },
}

const ORDER_STATUS = {
  abierto: { label: 'Abierto', color: '#1D4ED8', bg: '#DBEAFE' },
  enviado_cocina: { label: 'Enviado', color: '#B45309', bg: '#FEF3C7' },
  en_preparacion: { label: 'Preparando', color: '#F59E0B', bg: '#FEF3C7' },
  listo: { label: 'Listo', color: '#065F46', bg: '#D1FAE5' },
  servido: { label: 'Servido', color: '#374151', bg: '#F3F4F6' },
  cancelado: { label: 'Cancelado', color: '#B91C1C', bg: '#FEE2E2' },
}

const PAY_STATUS = {
  pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7' },
  aprobado:  { label: 'Aprobado',  color: '#065F46', bg: '#D1FAE5' },
}

// ─── HELPERS ──────────────────────────────────────────────────
const fmt = (n) => '$ ' + Number(n).toLocaleString('es-CO')
const fmtDate = (d) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const normalizeTimeTo24h = (value) => {
  if (!value) return value

  const cleanValue = String(value).trim()

  // input type="time" normalmente ya entrega HH:mm
  if (/^\d{2}:\d{2}$/.test(cleanValue)) {
    return cleanValue
  }

  // Por si algún navegador entrega 10:06 PM
  const match = cleanValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i)

  if (!match) {
    return cleanValue
  }

  let [, hour, minute, period] = match
  hour = Number(hour)
  period = period.toUpperCase()

  if (period === 'PM' && hour !== 12) {
    hour += 12
  }

  if (period === 'AM' && hour === 12) {
    hour = 0
  }

  return `${String(hour).padStart(2, '0')}:${minute}`
}

const getApiErrorMessage = (err, fallback = 'Error inesperado') => {
  const data = err.response?.data

  const details = data?.errors
    ?.map(e => `${e.field}: ${e.message}`)
    .join('\n')

  return `${data?.message || err.message || fallback}${details ? `\n\nDetalles:\n${details}` : ''}`
}

// ─── MODAL ────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #E5E7EB'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B7280', padding: 4, borderRadius: 6
          }}>
            <XCircle size={20} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────
function Badge({ status, map }) {
  const s = map[status] || { label: status, color: '#666', bg: '#F3F4F6' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
    }}>
      {s.label}
    </span>
  )
}

// ─── FIELD ────────────────────────────────────────────────────
function Field({ label, required, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: 'var(--text-secondary)', marginBottom: 5,
        textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid var(--border)', borderRadius: 8,
  fontSize: 14, fontFamily: 'var(--font-body)',
  outline: 'none', background: '#fff',
  color: 'var(--text-primary)', transition: 'border-color 0.15s',
  boxSizing: 'border-box'
}

const SAMPLE_PRODUCTS = [
  { product_id: 'p1', name: 'Mojito Clásico',      basePrice: 32000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80' },
  { product_id: 'p2', name: 'Piña Colásico',          basePrice: 34000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1571950006418-f9f522c22cfb?w=400&q=80' },
  { product_id: 'p3', name: 'Gin Tonic',            basePrice: 30000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&q=80' },
  { product_id: 'p4', name: 'Whisky Old Fashioned', basePrice: 38000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80' },
  { product_id: 'p5', name: 'Cerveza Corona',       basePrice: 12000, category: 'cerveza', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80' },
  { product_id: 'p6', name: 'Cerveza Heineken',     basePrice: 13000, category: 'cerveza', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80' },
  { product_id: 'p7', name: 'Vino Tinto (Copa)',    basePrice: 22000, category: 'vino',    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80' },
  { product_id: 'p8', name: 'Vino Blanco (Copa)',   basePrice: 22000, category: 'vino',    imageUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&q=80' },
  { product_id: 'p9', name: 'Papas a la Francesa',  basePrice: 16000, category: 'snack',   imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
  { product_id: 'p10', name: 'Alitas BBQ',          basePrice: 24000, category: 'snack',   imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80' },
  { product_id: 'p11', name: 'Nachos Mixtos',       basePrice: 26000, category: 'snack',   imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80' },
  { product_id: 'p12', name: 'Tabla de Quesos',     basePrice: 28000, category: 'especial',imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80' },
]

// ─── RESERVATION MODAL ───────────────────────────────────────
function ReservationModal({ reservations, tables, clients, onSelect, onCreate, onClose, search, onSearchChange, type, onTypeChange }) {
  const [form, setForm] = useState({
    table_id: '', date: '', startTime: '', endTime: '', peopleCount: 1, channel: 'presencial',
    clientType: 'guest', clientRef: { fullname: '', docID: '' }, guest: { fullname: '', phone: '' }
  })
  const [saving, setSaving] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setGuest = (k, v) => setForm(f => ({ ...f, guest: { ...f.guest, [k]: v } }))

  const handleClientTypeChange = (t) => {
    set('clientType', t)
    setForm(f => ({
      ...f,
      clientType: t,
      ...(t === 'registered' ? { clientRef: { fullname: '', docID: '' }, guest: { fullname: '', phone: '', notes: '' } } : { guest: { fullname: '', phone: '', notes: '' }, clientRef: { fullname: '', docID: '' } })
    }))
    setSelectedClient(null)
    setClientSearch('')
  }

  const filteredClients = clients.filter(c => {
    const term = clientSearch.toLowerCase()
    return c.fullname.toLowerCase().includes(term) || c.docID.toLowerCase().includes(term)
  })

  const selectClient = (client) => {
    setSelectedClient(client)
    setForm(f => ({ ...f, clientRef: { fullname: client.fullname, docID: client.docID } }))
  }

  const handleSubmit = async () => {
    if (type === 'create') {
      if (!form.table_id || !form.date || !form.startTime || !form.endTime) {
        alert('Completa todos los campos obligatorios')
        return
      }
      if (form.clientType === 'registered' && !selectedClient?.docID) {
        alert('Selecciona un cliente registrado')
        return
      }
      if (form.clientType === 'guest' && !form.guest.fullname) {
        alert('Ingresa el nombre del invitado')
        return
      }
      setSaving(true)
      try {
        await onCreate(form)
      } catch (e) {
        // Error handled in parent
      } finally {
        setSaving(false)
      }
    }
  }

  const activeTables = tables.filter(t => t.active !== false)

  return (
    <Modal title="Seleccionar o crear reserva" onClose={onClose} maxWidth={700}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {['select', 'create'].map(t => (
          <button key={t}
            onClick={() => onTypeChange(t)}
            style={{
              flex: 1, minWidth: 140, padding: '12px 14px', borderRadius: 10,
              border: `1.5px solid ${type === t ? '#2563EB' : 'var(--border)'}`,
              background: type === t ? '#DBEAFE' : '#fff',
              color: type === t ? '#1D4ED8' : 'var(--text-primary)',
              cursor: 'pointer', fontWeight: 700
            }}
          >
            {t === 'select' ? 'Elegir reserva existente' : 'Crear nueva reserva'}
          </button>
        ))}
      </div>

      {type === 'select' ? (
        <>
          <Field label="Buscar reserva">
            <input style={inputStyle} value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar por ID de reserva..." />
          </Field>

          <div style={{ maxHeight: 300, overflow: 'auto', marginTop: 16 }}>
            {reservations.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--text-secondary)', textAlign: 'center' }}>
                No se encontraron reservas activas
              </div>
            ) : (
              reservations.map(res => {
                const name = res.guest?.fullname || res.clientRef?.fullname || 'Sin nombre'
                const table = tables.find(t => t.table_id === res.table_id)
                return (
                  <button key={res.reservation_id} onClick={() => onSelect(res)}
                    style={{
                      width: '100%', padding: '14px 16px', marginBottom: 8,
                      borderRadius: 10, border: '1.5px solid var(--border)',
                      background: '#fff', cursor: 'pointer', textAlign: 'left'
                    }}>
                    <div style={{ fontWeight: 700 }}>{res.reservation_id}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>
                      {name} • {res.peopleCount} personas
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {fmtDate(res.date)} {res.startTime}-{res.endTime} • Mesa {table?.tableNumber || res.table_id}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Mesa" required>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.table_id}
                onChange={e => set('table_id', e.target.value)}>
                <option value="">Seleccionar mesa...</option>
                {activeTables.map(t => (
                  <option key={t.table_id} value={t.table_id}>
                    Mesa {t.tableNumber} — {t.zone} (cap. {t.capacity})
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
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.channel}
              onChange={e => set('channel', e.target.value)}>
              <option value="telefono">Teléfono</option>
              <option value="web">Web</option>
              <option value="presencial">Presencial</option>
              <option value="app">App</option>
            </select>
          </Field>

          <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {['registered', 'guest'].map(t => (
                <button key={t} onClick={() => handleClientTypeChange(t)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8,
                    border: `1.5px solid ${form.clientType === t ? '#2563EB' : 'var(--border)'}`,
                    background: form.clientType === t ? '#DBEAFE' : '#fff',
                    color: form.clientType === t ? '#1D4ED8' : 'var(--text-primary)',
                    cursor: 'pointer', fontWeight: 600
                  }}>
                  {t === 'registered' ? 'Cliente registrado' : 'Invitado'}
                </button>
              ))}
            </div>

            {form.clientType === 'registered' ? (
              <>
                <Field label="Buscar cliente" required>
                  <input style={inputStyle} value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Nombre o documento" />
                </Field>

                {selectedClient ? (
                  <div style={{ background: '#F3F4F6', borderRadius: 10, padding: 12, marginTop: 12 }}>
                    <div style={{ fontWeight: 700 }}>{selectedClient.fullname}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedClient.docID}</div>
                  </div>
                ) : (
                  <div style={{ maxHeight: 150, overflow: 'auto', marginTop: 12 }}>
                    {filteredClients.map(client => (
                      <button key={client.docID} onClick={() => selectClient(client)}
                        style={{
                          width: '100%', padding: '8px 12px', marginBottom: 4,
                          borderRadius: 8, border: '1px solid var(--border)',
                          background: '#fff', cursor: 'pointer', textAlign: 'left'
                        }}>
                        <div style={{ fontWeight: 600 }}>{client.fullname}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{client.docID}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Field label="Nombre" required>
                  <input style={inputStyle} value={form.guest.fullname}
                    onChange={e => setGuest('fullname', e.target.value)}
                    placeholder="Nombre completo" />
                </Field>
                <Field label="Teléfono">
                  <input style={inputStyle} value={form.guest.phone}
                    onChange={e => setGuest('phone', e.target.value)}
                    placeholder="3001234567" />
                </Field>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancelar
        </button>
        {type === 'create' && (
          <button className="btn-primary" onClick={handleSubmit}
            disabled={saving} style={{ flex: 2, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creando...' : 'Crear reserva'}
          </button>
        )}
      </div>
    </Modal>
  )
}

export default function Orders() {
  const [products, setProducts]   = useState(SAMPLE_PRODUCTS)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('todos')
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  // Estado para reservas y órdenes
  const [reservations, setReservations] = useState([])
  const [tables, setTables]             = useState([])
  const [clients, setClients]           = useState([])
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [reservationSearch, setReservationSearch] = useState('')
  const [reservationType, setReservationType] = useState('select') // 'select' o 'create'
  const [reservationOrders, setReservationOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderModalMode, setOrderModalMode] = useState('create') // 'create' o 'edit'

  // Cargar productos desde la API
  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(res => {
        const data = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
        }
        // Si no hay datos en la API, se mantienen los de ejemplo
      })
      .catch(() => {
        // Si la API no responde, se mantienen los productos de ejemplo
      })
      .finally(() => setLoading(false))
  }, [])

  // Cargar reservas, mesas y clientes
  useEffect(() => {
    const loadData = async () => {
      const [resResult, tablesResult, clientsResult] = await Promise.allSettled([
        api.get('/reservations'),
        api.get('/tables'),
        api.get('/clients')
      ])

      if (resResult.status === 'fulfilled') {
        const d = resResult.value.data?.data || resResult.value.data
        setReservations(Array.isArray(d) && d.length > 0 ? d : [])
      }

      if (tablesResult.status === 'fulfilled') {
        const d = tablesResult.value.data?.data || tablesResult.value.data
        setTables(Array.isArray(d) && d.length > 0 ? d : [])
      }

      if (clientsResult.status === 'fulfilled') {
        const d = clientsResult.value.data?.data || clientsResult.value.data
        setClients(Array.isArray(d) && d.length > 0 ? d : [])
      }
    }
    loadData()
  }, [])

  // Filtrar productos
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'todos' || p.subcategory === category || p.category === category
    return matchSearch && matchCat
  })

  // Agregar producto al pedido
  const handleAddProduct = (product) => {
    setOrderItems(prev => {
      const idx = prev.findIndex(i => i.product_id === product.product_id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 }
        return updated
      }
      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        unitPrice: product.basePrice,
        quantity: 1
      }]
    })
  }

  // Cambiar cantidad
  const handleQtyChange = (idx, qty) => {
    if (qty <= 0) {
      handleRemove(idx)
      return
    }
    setOrderItems(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], quantity: qty }
      return updated
    })
  }

  // Eliminar item
  const handleRemove = (idx) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx))
  }

  // Enviar a cocina → POST /api/orders
  const handleSend = async ({ items, note, guests }) => {
    if (items.length === 0) return
    if (!selectedReservation) {
      alert('❌ Selecciona una reserva primero')
      return
    }
    try {
      const payload = {
        reservation_id: selectedReservation.reservation_id,
        clientHint: `${guests} personas`,
        notes: note,
        items: items.map(i => ({
          product_id: i.product_id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      }
      const res = await api.post('/orders', payload)
      alert(`✅ Pedido ${res.data.order_id} enviado a cocina`)
      setOrderItems([])
      // Recargar reservas para actualizar órdenes
      const resResult = await api.get('/reservations')
      const d = resResult.data?.data || resResult.data
      setReservations(Array.isArray(d) && d.length > 0 ? d : [])
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // Pagar
  const handlePay = ({ total }) => {
    if (!selectedReservation) {
      alert('❌ Selecciona una reserva primero')
      return
    }
    alert(`💳 Total a pagar: $${Number(total).toLocaleString('es-CO')}`)
    // TODO: abrir modal de pago
  }

  // Seleccionar reserva
  const handleSelectReservation = async (reservation) => {
    setSelectedReservation(reservation)
    setShowReservationModal(false)

    // Cargar órdenes de la reserva
    try {
      const response = await api.get(`/orders?reservation_id=${reservation.reservation_id}`)
      const orders = response.data?.data || response.data || []
      setReservationOrders(orders)
    } catch (error) {
      console.error('Error cargando órdenes:', error)
      setReservationOrders([])
    }
  }

  const openReservationModal = () => {
    setReservationType('select')
    setShowReservationModal(true)
  }

  // Crear nueva orden
  const handleCreateOrder = () => {
    setSelectedOrder(null)
    setOrderItems([])
    setOrderModalMode('create')
    setShowOrderModal(true)
  }

  // Editar orden existente
  const handleEditOrder = (order) => {
    setSelectedOrder(order)
    setOrderItems(order.items || [])
    setOrderModalMode('edit')
    setShowOrderModal(true)
  }

  // Guardar orden
  const handleSaveOrder = async () => {
    if (!selectedReservation) {
      alert('❌ Selecciona una reserva primero')
      return
    }

    if (orderItems.length === 0) {
      alert('❌ Agrega al menos un producto a la orden')
      return
    }

    try {
      const payload = {
        reservation_id: selectedReservation.reservation_id,
        items: orderItems
      }

      if (orderModalMode === 'create') {
        await api.post('/orders', payload)
      } else {
        await api.put(`/orders/${selectedOrder.order_id}`, payload)
      }

      // Recargar órdenes
      const response = await api.get(`/orders?reservation_id=${selectedReservation.reservation_id}`)
      const orders = response.data?.data || response.data || []
      setReservationOrders(orders)

      setShowOrderModal(false)
      setOrderItems([])
      setSelectedOrder(null)
    } catch (error) {
      alert(`❌ Error ${orderModalMode === 'create' ? 'creando' : 'actualizando'} orden: ${error.response?.data?.message || error.message}`)
    }
  }

  // Crear nueva reserva
  const handleCreateReservation = async (form) => {
    try {
      const payload = {
        table_id: form.table_id,
        date: form.date,
        startTime: normalizeTimeTo24h(form.startTime),
        endTime: normalizeTimeTo24h(form.endTime),
        peopleCount: Number(form.peopleCount),
        channel: String(form.channel || 'presencial').toLowerCase(),
        ...(form.clientType === 'registered'
          ? {
              clientRef: {
                fullname: form.clientRef.fullname,
                docID: form.clientRef.docID
              }
            }
          : {
              guest: {
                fullname: form.guest.fullname,
                ...(form.guest.phone && { phone: form.guest.phone })
              }
            })
      }

      const res = await api.post('/reservations', payload)

      setSelectedReservation(res.data)
      setReservationOrders([])
      setShowReservationModal(false)

      const resResult = await api.get('/reservations')
      const d = resResult.data?.data || resResult.data
      setReservations(Array.isArray(d) && d.length > 0 ? d : [])
    } catch (err) {
      alert(`❌ Error creando reserva: ${getApiErrorMessage(err, 'Error creando reserva')}`)
    }
  }

  // Filtrar reservas activas
  const activeReservations = reservations.filter(r =>
    ['confirmada', 'en_curso'].includes(r.status) &&
    r.reservation_id.toLowerCase().includes(reservationSearch.toLowerCase())
  )

  // Obtener nombre de la reserva
  const getReservationLabel = () => {
    if (!selectedReservation) return 'Seleccionar reserva'
    const name = selectedReservation.guest?.fullname || selectedReservation.clientRef?.fullname || 'Sin nombre'
    return `${selectedReservation.reservation_id} - ${name}`
  }

  return (
    <div className="page-wrapper">
      {/* Contenido principal */}
      <div className="page-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="search-bar">
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
            />
          </div>

          <div className="topbar-right">
            <button className="notif-btn">
              <Bell size={18} />
            </button>
            <div className="user-chip">
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#E8E6E1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: '#666'
              }}>JP</div>
              <div className="user-chip-info">
                <div className="user-chip-name">Juan Pérez</div>
                <div className="user-chip-role">Mesero</div>
              </div>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <CategoryFilter active={category} onChange={setCategory} />

        {/* Grid de productos */}
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
            Cargando productos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
            No se encontraron productos
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAdd={handleAddProduct}
              />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 20 }}>
          ⓘ Los precios incluyen impuestos.
        </div>
      </div>

      {/* Panel de orden */}
      <OrderPanel
        items={orderItems}
        reservation={selectedReservation}
        reservationOrders={reservationOrders}
        tables={tables}
        onQtyChange={handleQtyChange}
        onRemove={handleRemove}
        onSend={handleSend}
        onPay={handlePay}
        onReservationClick={openReservationModal}
        onCreateOrder={handleCreateOrder}
        onEditOrder={handleEditOrder}
        onSaveOrder={handleSaveOrder}
      />

      {/* Modal de reserva */}
      {showReservationModal && (
        <ReservationModal
          reservations={activeReservations}
          tables={tables}
          clients={clients}
          onSelect={handleSelectReservation}
          onCreate={handleCreateReservation}
          onClose={() => setShowReservationModal(false)}
          search={reservationSearch}
          onSearchChange={setReservationSearch}
          type={reservationType}
          onTypeChange={setReservationType}
        />
      )}

      {/* Modal de orden */}
      {showOrderModal && (
        <Modal title={`${orderModalMode === 'create' ? 'Crear' : 'Editar'} orden`} onClose={() => setShowOrderModal(false)} maxWidth={800}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Catálogo de productos */}
            <div>
              <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Seleccionar productos</h3>

              {/* Filtros */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', minWidth: 150 }}
                >
                  <option value="todos">Todas las categorías</option>
                  <option value="coctel">Cócteles</option>
                  <option value="cerveza">Cervezas</option>
                  <option value="licor">Licores</option>
                  <option value="vino">Vinos</option>
                  <option value="snack">Snacks</option>
                  <option value="entradas">Entradas</option>
                  <option value="platos_fuertes">Platos fuertes</option>
                  <option value="especialidades">Especialidades</option>
                  <option value="otro">Otros</option>
                </select>
              </div>

              {/* Grid de productos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
                {filtered.map(product => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAdd={handleAddProduct}
                  />
                ))}
              </div>
            </div>

            {/* Orden actual */}
            {orderItems.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600 }}>Orden actual</h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 16 }}>
                  {orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < orderItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => handleQtyChange(idx, item.quantity - 1)}
                            style={{ padding: '4px 8px', border: '1px solid #D1D5DB', background: 'white', borderRadius: 4, cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: 30, textAlign: 'center' }}>{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(idx, item.quantity + 1)}
                            style={{ padding: '4px 8px', border: '1px solid #D1D5DB', background: 'white', borderRadius: 4, cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ fontWeight: 500, minWidth: 80, textAlign: 'right' }}>
                          {fmt(item.quantity * item.unitPrice)}
                        </span>
                        <button
                          onClick={() => handleRemove(idx)}
                          style={{ padding: '4px', border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Totales */}
                  <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 16, paddingTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                      <span>Subtotal</span>
                      <span>{fmt(orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                      <span>Impuestos (8%)</span>
                      <span>{fmt(Math.round(orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 0.08))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 16, marginTop: 8 }}>
                      <span>Total</span>
                      <span>{fmt(Math.round(orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 1.08))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{ padding: '10px 20px', border: '1px solid #D1D5DB', background: 'white', borderRadius: 6, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={orderItems.length === 0}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: orderItems.length === 0 ? '#D1D5DB' : '#2563EB',
                  color: 'white',
                  borderRadius: 6,
                  cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {orderModalMode === 'create' ? 'Crear orden' : 'Actualizar orden'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
