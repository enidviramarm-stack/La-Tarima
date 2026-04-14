const { body, param } = require('express-validator')

exports.validateCreateStaff = [
  body('user_id')
    .trim()
    .notEmpty().withMessage('user_id es obligatorio'),

  body('fullName')
    .trim()
    .notEmpty().withMessage('fullName es obligatorio')
    .isLength({ min: 3 }).withMessage('fullName muy corto'),

  body('role')
    .isIn(['waiter', 'manager', 'chef'])
    .withMessage('role inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('email inválido'),

  body('cellPhone')
    .optional()
    .trim()
    .isLength({ min: 7 })
]

exports.validateUpdateStaff = [
  body('user_id')
    .not()
    .exists()
    .withMessage('No se puede modificar el user_id'),

  body('role')
    .optional()
    .isIn(['waiter', 'manager', 'chef'])
]

exports.validateStaffParam = [
  param('user_id')
    .notEmpty()
    .withMessage('user_id es obligatorio en la URL')
]