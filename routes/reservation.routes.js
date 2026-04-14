const router = require('express').Router()
const controller = require('../controllers/reservation.controller')
const validator = require('../middlewares/reservation.middleware')
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
  validator.validateCreateReservation,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:reservation_id',
  validator.validateReservationParam,
  validate,
  controller.getById
)

router.put(
  '/:reservation_id',
  validator.validateReservationParam,
  validate,
  controller.update
)

router.delete(
  '/:reservation_id',
  validator.validateReservationParam,
  validate,
  controller.remove
)

module.exports = router