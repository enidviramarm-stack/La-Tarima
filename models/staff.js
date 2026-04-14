const { Schema, model } = require('mongoose')

const StaffSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  role: {
    type: String,
    required: true,
    enum: ['waiter', 'manager', 'chef']
  },
  cellPhone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /.+@.+\..+/
  }
}, {
  timestamps: true
})

module.exports = model('Staff', StaffSchema)