const Order = require('../models/order')

/**
 * ADD ITEM TO ORDER (PATCH)
 * Añade uno o varios productos al arreglo items
 */
exports.addItem = async (req, res) => {
  try {
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Debe enviar un arreglo de items'
      })
    }

    const order = await Order.findOneAndUpdate(
      { order_id: req.params.order_id },
      {
        $push: {
          items: { $each: items }
        }
      },
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
      message: 'Error al agregar items al pedido',
      error: error.message
    })
  }
}

/**
 * REMOVE ITEM FROM ORDER (PATCH)
 * Elimina uno o varios items del arreglo items
 */
exports.removeItem = async (req, res) => {
  try {
    const { product_ids } = req.body

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        message: 'Debe enviar un array de product_ids'
      })
    }

    const order = await Order.findOneAndUpdate(
      { order_id: req.params.order_id },
      {
        $pull: {
          items: { product_id: { $in: product_ids } }
        }
      },
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
      message: 'Error al eliminar items del pedido',
      error: error.message
    })
  }
}


/**
 * UPDATE ORDER (PATCH) - modificar items u otros campos
 */
exports.update = async (req, res) => {
  try {
    // No permitir cambiar el order_id
    if (req.body.order_id) {
      return res.status(400).json({
        message: 'No se puede modificar el order_id'
      })
    }

    const order = await Order.findOneAndUpdate(
      { order_id: req.params.order_id },
      req.body,
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
      message: 'Error al actualizar pedido',
      error: error.message
    })
  }
}


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