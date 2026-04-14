const { body, param } = require('express-validator')

exports.validateCreateTable = [
  body('table_id')
    .trim()
    .notEmpty().withMessage('table_id es obligatorio'),

  body('tableNumber')
    .isInt({ min: 1 })
    .withMessage('tableNumber debe ser un entero >= 1'),

  body('capacity')
    .isInt({ min: 1 })
    .withMessage('capacity debe ser >= 1'),

  body('zone')
    .trim()
    .notEmpty().withMessage('zone es obligatoria')
]

exports.validateUpdateTable = [
  body('table_id')
    .not()
    .exists()
    .withMessage('No se puede modificar el table_id'),

  body('capacity')
    .optional()
    .isInt({ min: 1 }),

  body('tableNumber')
    .optional()
    .isInt({ min: 1 })
]

exports.validateTableParam = [
  param('table_id')
    .notEmpty()
    .withMessage('table_id es obligatorio en la URL')
]