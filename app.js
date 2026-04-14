const express = require('express')

const app = express()

/**
 * ===== SETTINGS =====
 */
app.set('port', process.env.PORT || 3000)

/**
 * ===== MIDDLEWARES =====
 */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * ===== ROUTES =====
 */

// Core entities
app.use('/api/clients', require('./routes/client.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/tables', require('./routes/table.routes'))
app.use('/api/staff', require('./routes/staff.routes'))
app.use('/api/reservations', require('./routes/reservation.routes'))
app.use('/api/orders', require('./routes/order.routes'))
app.use('/api/payments', require('./routes/payment.routes'))

// Business logic / reports
app.use('/api/reports', require('./routes/report.routes'))

/**
 * ===== 404 HANDLER =====
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Recurso no encontrado'
  })
})

module.exports = app