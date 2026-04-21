const { body, param } = require('express-validator')

/**
 * CREATE CLIENT
 */
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

/**
 * UPDATE CLIENT (PUT / PATCH)
 */
exports.validateUpdateClient = [
  // ❌ No permitir cambiar el identificador
  body('docID')
    .not()
    .exists()
    .withMessage('No se puede modificar el docID'),

  // ✅ Evitar body vacío
  body().custom(body => {
    if (!body || Object.keys(body).length === 0) {
      throw new Error('Debe enviar al menos un campo para actualizar')
    }
    return true
  }),

  // ✅ Campos permitidos y validados
  body('fullname')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('fullname inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('email inválido'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7 }).withMessage('teléfono inválido'),

  body('address')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim()
]

/**
 * PARAM VALIDATION
 */
exports.validateDocParam = [
  param('docID')
    .notEmpty()
    .withMessage('docID es obligatorio en la URL')
]