const { body, param } = require('express-validator')

exports.validateCreateReservation = [
  body('reservation_id')
    .trim()
    .notEmpty().withMessage('reservation_id es obligatorio'),

  body('table_id')
    .trim()
    .notEmpty().withMessage('table_id es obligatorio'),

  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Formato de fecha inválido (YYYY-MM-DD)'),

  body('startTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Formato startTime inválido'),

  body('endTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Formato endTime inválido'),

  body('peopleCount')
    .isInt({ min: 1 })
    .withMessage('peopleCount debe ser >= 1')
]

exports.validateReservationParam = [
  param('reservation_id')
    .notEmpty()
    .withMessage('reservation_id es obligatorio en la URL')
]