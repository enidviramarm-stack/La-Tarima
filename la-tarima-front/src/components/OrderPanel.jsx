import { useState } from 'react'
import { CalendarDays, Users, MoreHorizontal, Minus, Plus, Trash2, FileText, ChefHat, Bookmark, CreditCard } from 'lucide-react'

const TAX_RATE = 0.08

export default function OrderPanel({ items, onQtyChange, onRemove, onSend, onSave, onPay }) {
  const [note, setNote] = useState('')
  const [reservation, setReservation] = useState('')
  const [guests, setGuests] = useState(1)

  const fmt = (n) => '$ ' + Number(n).toLocaleString('es-CO')

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxes    = Math.round(subtotal * TAX_RATE)
  const total    = subtotal + taxes

  return (
    <aside className="order-panel">
      {/* Header */}
      <div className="order-panel-header">
        <div className="order-panel-title">Orden actual</div>
        <div className="order-meta">
          <button className="order-meta-chip">
            <CalendarDays size={14} />
            {reservation || 'Reserva'}
          </button>
          <button
            className="order-meta-chip"
            onClick={() => setGuests(g => Math.max(1, g + 1))}
          >
            <Users size={14} />
            {guests}
          </button>
          <button className="order-meta-more">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="order-items">
        {items.length === 0 ? (
          <div className="empty-order">
            <ChefHat size={48} />
            <p>Agrega productos<br />desde el catálogo</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div className="order-item" key={idx}>
              {/* Qty control */}
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => onQtyChange(idx, item.quantity - 1)}
                >−</button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => onQtyChange(idx, item.quantity + 1)}
                >+</button>
              </div>

              <span className="order-item-name">{item.name}</span>
              <span className="order-item-price">
                {fmt(item.quantity * item.unitPrice)}
              </span>
              <button
                className="order-item-delete"
                onClick={() => onRemove(idx)}
                title="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Note */}
      <div className="order-note">
        <FileText size={14} />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Agregar nota a la orden (opcional)"
        />
      </div>

      {/* Totals */}
      <div className="order-totals">
        <div className="order-totals-row">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="order-totals-row">
          <span>Impuestos (8%)</span>
          <span>{fmt(taxes)}</span>
        </div>
        <div className="order-total-final">
          <span className="order-total-label">Total</span>
          <span className="order-total-value">{fmt(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="order-actions">
        <button
          className="btn-primary"
          onClick={() => onSend && onSend({ items, note, guests })}
          disabled={items.length === 0}
          style={{ opacity: items.length === 0 ? 0.5 : 1 }}
        >
          <ChefHat size={17} />
          Enviar a cocina
        </button>
        <div className="order-actions-row">
          <button
            className="btn-secondary"
            onClick={() => onSave && onSave({ items, note, guests })}
          >
            <Bookmark size={15} />
            Guardar
          </button>
          <button
            className="btn-secondary"
            onClick={() => onPay && onPay({ items, note, guests, total })}
            disabled={items.length === 0}
            style={{ opacity: items.length === 0 ? 0.5 : 1 }}
          >
            <CreditCard size={15} />
            Pagar
          </button>
        </div>
      </div>
    </aside>
  )
}
