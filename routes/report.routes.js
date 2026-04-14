const router = require('express').Router()
const controller = require('../controllers/report.controller')
const validator = require('../middlewares/report.middleware')
const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  next()
}

router.get('/sales-by-category', controller.salesByCategory)

router.get(
  '/top-clients',
  validator.validateTopClients,
  validate,
  controller.topClients
)

router.get(
  '/payments-by-date',
  validator.validateDateRange,
  validate,
  controller.paymentsByDate
)

router.get('/sales-by-product', controller.salesByProduct)

module.exports = router