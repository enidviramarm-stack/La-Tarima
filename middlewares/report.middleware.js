const { query } = require('express-validator')

exports.validateDateRange = [
  query('startDate')
    .notEmpty()
    .withMessage('startDate es obligatorio')
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida'),

  query('endDate')
    .notEmpty()
    .withMessage('endDate es obligatorio')
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida')
]

exports.validateTopClients = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit inválido')
]