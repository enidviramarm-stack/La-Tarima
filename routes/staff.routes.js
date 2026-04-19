  const router = require('express').Router()
  const controller = require('../controllers/staff.controller')
  const validator = require('../middlewares/staff.middleware')
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
    validator.validateCreateStaff,
    validate,
    controller.create
  )

  router.get('/', controller.getAll)

  router.get(
    '/:user_id',
    validator.validateStaffParam,
    validate,
    controller.getById
  )


  router.patch(
    '/:user_id',
    validator.validateUpdateStaff,
    validate,
    controller.update
  )

  router.put(
    '/:user_id',
    validator.validateUpdateStaff,
    validate,
    controller.update
  )

  router.delete(
    '/:user_id',
    validator.validateStaffParam,
    validate,
    controller.remove
  )

  module.exports = router