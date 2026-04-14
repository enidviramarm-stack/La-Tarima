const router = require('express').Router()
const controller = require('../controllers/order.controller')
const validator = require('../middlewares/order.middleware')
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
  validator.validateCreateOrder,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:order_id',
  validator.validateOrderParam,
  validate,
  controller.getById
)

router.patch(
  '/:order_id/status',
  validator.validateUpdateStatus,
  validate,
  controller.updateStatus
)

router.delete(
  '/:order_id',
  validator.validateOrderParam,
  validate,
  controller.remove
)

module.exports = router