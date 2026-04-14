const Payment = require('../models/payment')

/**
 * CREATE PAYMENT
 */
exports.create = async (req, res) => {
  try {
    const { payment_id, reservation_id, order_id, amount, method } = req.body

    if (!payment_id || !reservation_id || !order_id || amount == null || !method) {
      return res.status(400).json({
        message: 'payment_id, reservation_id, order_id, amount y method son obligatorios'
      })
    }

    const exists = await Payment.findOne({ payment_id })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe un pago con ese payment_id'
      })
    }

    // Validación regla de negocio: split coherente
    if (req.body.split) {
      const { part, totalParts } = req.body.split
      if (!part || !totalParts || part > totalParts) {
        return res.status(400).json({
          message: 'split inválido'
        })
      }
    }

    const payment = new Payment(req.body)
    await payment.save()

    res.status(201).json(payment)
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar el pago',
      error: error.message
    })
  }
}

/**
 * READ ALL PAYMENTS
 */
exports.getAll = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ timestamp: -1 })
    res.json(payments)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener pagos',
      error: error.message
    })
  }
}

/**
 * READ ONE PAYMENT
 */
exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      payment_id: req.params.payment_id
    })

    if (!payment) {
      return res.status(404).json({
        message: 'Pago no encontrado'
      })
    }

    res.json(payment)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar pago',
      error: error.message
    })
  }
}

/**
 * UPDATE STATUS
 * Regla: solo permitir estado válido
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['aprobado', 'pendiente'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido'
      })
    }

    const payment = await Payment.findOneAndUpdate(
      { payment_id: req.params.payment_id },
      { status },
      { new: true }
    )

    if (!payment) {
      return res.status(404).json({
        message: 'Pago no encontrado'
      })
    }

    res.json(payment)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar estado del pago',
      error: error.message
    })
  }
}

/**
 * DELETE PAYMENT
 */
exports.remove = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({
      payment_id: req.params.payment_id
    })

    if (!payment) {
      return res.status(404).json({
        message: 'Pago no encontrado'
      })
    }

    res.json({
      message: 'Pago eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar pago',
      error: error.message
    })
  }
}