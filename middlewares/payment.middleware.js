const { body, param } = require('express-validator')

exports.validateCreatePayment = [
  body('payment_id')
    .trim()
    .notEmpty().withMessage('payment_id es obligatorio'),

  body('reservation_id')
    .trim()
    .notEmpty().withMessage('reservation_id es obligatorio'),

  body('order_id')
    .trim()
    .notEmpty().withMessage('order_id es obligatorio'),

  body('amount')
    .isFloat({ min: 0 }).withMessage('amount inválido'),

  body('method')
    .isIn(['efectivo', 'tarjeta', 'nequi', 'daviplata'])
    .withMessage('method inválido'),

  body('tip')
    .optional()
    .isFloat({ min: 0 }).withMessage('tip inválido'),

  body('split.part')
    .optional()
    .isInt({ min: 1 }),

  body('split.totalParts')
    .optional()
    .isInt({ min: 1 })
]

exports.validatePaymentParam = [
  param('payment_id')
    .notEmpty()
    .withMessage('payment_id es obligatorio en la URL')
]

exports.validateUpdateStatus = [
  body('status')
    .isIn(['aprobado', 'pendiente'])
    .withMessage('Estado inválido')
]