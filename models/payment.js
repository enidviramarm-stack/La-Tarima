const { Schema, model } = require('mongoose')

const PaymentSchema = new Schema({
  payment_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  reservation_id: {
    type: String,
    required: true,
    trim: true
  },
  order_id: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    required: true,
    enum: ['efectivo', 'tarjeta', 'nequi', 'daviplata']
  },
  tip: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['aprobado', 'pendiente'],
    default: 'pendiente'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  split: {
    part: {
      type: Number,
      min: 1
    },
    totalParts: {
      type: Number,
      min: 1
    }
  }
}, {
  timestamps: true
})

module.exports = model('Payment', PaymentSchema)