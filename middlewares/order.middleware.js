const { body, param } = require('express-validator')

exports.validateCreateOrder = [
  body('order_id')
    .trim()
    .notEmpty().withMessage('order_id es obligatorio'),

  body('reservation_id')
    .trim()
    .notEmpty().withMessage('reservation_id es obligatorio'),

  body('items')
    .isArray({ min: 1 }).withMessage('items debe ser un arreglo no vacío'),

  body('items.*.product_id')
    .notEmpty().withMessage('product_id es obligatorio'),

  body('items.*.name')
    .trim()
    .notEmpty().withMessage('nombre del producto obligatorio'),

  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('quantity debe ser >= 1'),

  body('items.*.unitPrice')
    .isFloat({ min: 0 }).withMessage('unitPrice inválido')
]

exports.validateUpdateStatus = [
  body('status')
    .isIn(['abierto', 'servido'])
    .withMessage('Estado inválido')
]

exports.validateOrderParam = [
  param('order_id')
    .notEmpty()
    .withMessage('order_id es obligatorio en la URL')
]