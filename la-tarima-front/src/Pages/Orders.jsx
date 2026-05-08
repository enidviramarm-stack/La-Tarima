import { useState, useEffect } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import OrderPanel from '../components/OrderPanel'
import CategoryFilter from '../components/CategoryFilter'
import api from '../Api/axios'

// Productos de ejemplo mientras se conecta la API
const SAMPLE_PRODUCTS = [
  { product_id: 'p1', name: 'Mojito Clásico',      basePrice: 32000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80' },
  { product_id: 'p2', name: 'Piña Colada',          basePrice: 34000, category: 'coctel',  imageUrl: 'https://images.unsplash.com/photo-1571950006418-f9f522c22cfb?w=400&q=80' },
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

export default function Orders() {
  const [products, setProducts]   = useState(SAMPLE_PRODUCTS)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('todos')
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

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

  // Filtrar productos
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = category === 'todos' || p.category === category
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
    try {
      const payload = {
        reservation_id: 'RES_0001', // TODO: conectar con selector de reserva
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
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || err.message}`)
    }
  }

  // Pagar
  const handlePay = ({ total }) => {
    alert(`💳 Total a pagar: $${Number(total).toLocaleString('es-CO')}`)
    // TODO: abrir modal de pago
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
        onQtyChange={handleQtyChange}
        onRemove={handleRemove}
        onSend={handleSend}
        onPay={handlePay}
      />
    </div>
  )
}
