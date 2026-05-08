import { Plus } from 'lucide-react'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80'

export default function ProductCard({ product, onAdd }) {
  const fmt = (n) =>
    '$ ' + Number(n).toLocaleString('es-CO')

  return (
    <div className="product-card" onClick={() => onAdd(product)}>
      <img
        className="product-card-img"
        src={product.imageUrl || PLACEHOLDER}
        alt={product.name}
        onError={e => { e.target.src = PLACEHOLDER }}
      />
      <div className="product-card-body">
        <div className="product-card-info">
          <div className="product-card-name">{product.name}</div>
          <div className="product-card-price">{fmt(product.basePrice)}</div>
        </div>
        <button
          className="btn-accent"
          onClick={e => { e.stopPropagation(); onAdd(product) }}
          title="Agregar al pedido"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
