const { Schema, model } = require('mongoose')

const TableSchema = new Schema({
  table_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tableNumber: {
    type: Number,
    required: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  zone: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

module.exports = model('Table', TableSchema)