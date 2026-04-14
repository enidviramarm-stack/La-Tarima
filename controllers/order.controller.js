const Order = require('../models/order')

/**
 * CREATE (abrir pedido)
 */
exports.create = async (req, res) => {
  try {
    const { order_id, reservation_id, items } = req.body

    if (!order_id || !reservation_id || !items || items.length === 0) {
      return res.status(400).json({
        message: 'order_id, reservation_id e items son obligatorios'
      })
    }

    const exists = await Order.findOne({ order_id })
    if (exists) {
      return res.status(409).json({
        message: 'Ya existe un pedido con ese order_id'
      })
    }

    const order = new Order(req.body)
    await order.save()

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el pedido',
      error: error.message
    })
  }
}

/**
 * READ ALL
 */
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener pedidos',
      error: error.message
    })
  }
}

/**
 * READ ONE
 */
exports.getById = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.order_id })

    if (!order) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar pedido',
      error: error.message
    })
  }
}

/**
 * UPDATE STATUS (regla de negocio)
 * Solo permitir cambio de estado válido
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['abierto', 'servido'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido'
      })
    }

    const order = await Order.findOneAndUpdate(
      { order_id: req.params.order_id },
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar estado',
      error: error.message
    })
  }
}

/**
 * DELETE
 */
exports.remove = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      order_id: req.params.order_id
    })

    if (!order) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      })
    }

    res.json({
      message: 'Pedido eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar pedido',
      error: error.message
    })
  }
}