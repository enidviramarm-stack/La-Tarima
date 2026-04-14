const { body, param } = require('express-validator')

exports.validateCreateProduct = [
  body('Product_id')
    .trim()
    .notEmpty().withMessage('Product_id es obligatorio'),

  body('name')
    .trim()
    .notEmpty().withMessage('name es obligatorio')
    .isLength({ min: 2 }).withMessage('name muy corto'),

  body('category')
    .isIn(['comida', 'bebida'])
    .withMessage('category inválida'),

  body('basePrice')
    .isFloat({ min: 0 }).withMessage('basePrice inválido'),

  body('description')
    .optional()
    .trim()
]

exports.validateUpdateProduct = [
  body('Product_id')
    .not()
    .exists()
    .withMessage('No se puede modificar el Product_id'),

  body('category')
    .optional()
    .isIn(['comida', 'bebida'])
]

exports.validateProductParam = [
  param('Product_id')
    .notEmpty()
    .withMessage('Product_id es obligatorio en la URL')
]
