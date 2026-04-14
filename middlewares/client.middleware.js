const { body, param } = require('express-validator')

exports.validateCreateClient = [
  body('fullname')
    .trim()
    .notEmpty().withMessage('fullname es obligatorio')
    .isLength({ min: 3 }).withMessage('fullname debe tener mínimo 3 caracteres'),

  body('docID')
    .trim()
    .notEmpty().withMessage('docID es obligatorio'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('email inválido'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7 }).withMessage('teléfono inválido')
]

exports.validateUpdateClient = [
  body('docID')
    .not()
    .exists()
    .withMessage('No se puede modificar el docID'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('email inválido')
]

exports.validateDocParam = [
  param('docID')
    .notEmpty()
    .withMessage('docID es obligatorio en la URL')
]