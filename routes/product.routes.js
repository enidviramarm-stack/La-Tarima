const router = require('express').Router()
const controller = require('../controllers/product.controller')
const validator = require('../middlewares/product.middleware')
const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  next()
}

router.post(
  '/',
  validator.validateCreateProduct,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:Product_id',
  validator.validateProductParam,
  validate,
  controller.getById
)

router.put(
  '/:Product_id',
  validator.validateUpdateProduct,
  validate,
  controller.update
)

router.delete(
  '/:Product_id',
  validator.validateProductParam,
  validate,
  controller.remove
)

module.exports = router