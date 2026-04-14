const { Schema, model } = require('mongoose')

const ClientSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  docID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /.+@.+\..+/
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

module.exports = model('Client', ClientSchema)