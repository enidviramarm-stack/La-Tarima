const router = require('express').Router()
const controller = require('../controllers/payment.controller')
const validator = require('../middlewares/payment.middleware')
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
  validator.validateCreatePayment,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:payment_id',
  validator.validatePaymentParam,
  validate,
  controller.getById
)

router.patch(
  '/:payment_id/status',
  validator.validateUpdateStatus,
  validate,
  controller.updateStatus
)

router.delete(
  '/:payment_id',
  validator.validatePaymentParam,
  validate,
  controller.remove
)

module.exports = router