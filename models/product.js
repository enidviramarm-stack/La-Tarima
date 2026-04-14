const { Schema, model } = require('mongoose')

const ProductSchema = new Schema({
  Product_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  category: {
    type: String,
    required: true,
    enum: ['comida', 'bebida']
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

module.exports = model('Product', ProductSchema)