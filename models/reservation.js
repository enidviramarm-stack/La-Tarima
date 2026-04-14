const { Schema, model } = require('mongoose')

const ReservationSchema = new Schema({
  reservation_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  table_id: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  peopleCount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_curso', 'cancelada'],
    default: 'pendiente'
  },
  channel: {
    type: String,
    trim: true
  },
  clientRef: {
    fullname: String,
    docID: String
  },
  guest: {
    fullname: String,
    phone: String,
    notes: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

module.exports = model('Reservation', ReservationSchema)
