const Order = require('../models/order')
const Payment = require('../models/payment')
const Product = require('../models/product')

/**
 * REPORTE: Ventas por categoría
 */
exports.salesByCategory = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: 'Product_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: {
            $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] }
          },
          totalItems: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } }
    ])

    res.json(report)
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar reporte por categoría',
      error: error.message
    })
  }
}

/**
 * REPORTE: Top clientes por consumo
 */
exports.topClients = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5

    const report = await Payment.aggregate([
      { $match: { status: 'aprobado' } },
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: 'order_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      {
        $group: {
          _id: '$order.clientHint',
          totalPaid: { $sum: '$amount' },
          totalTip: { $sum: '$tip' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { totalPaid: -1 } },
      { $limit: limit }
    ])

    res.json(report)
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar top de clientes',
      error: error.message
    })
  }
}

/**
 * REPORTE: Pagos por rango de fechas (auditoría)
 */
exports.paymentsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const report = await Payment.find({
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ timestamp: 1 })

    res.json(report)
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar reporte de pagos',
      error: error.message
    })
  }
}

/**
 * REPORTE: Consumo por producto
 */
exports.salesByProduct = async (req, res) => {
  try {
    const report = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          totalSold: {
            $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] }
          },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } }
    ])

    res.json(report)
  } catch (error) {
    res.status(500).json({
      message: 'Error al generar reporte por producto',
      error: error.message
    })
  }
}