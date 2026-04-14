const router = require('express').Router()
const controller = require('../controllers/client.controller')
const validator = require('../middlewares/client.middleware')
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
  validator.validateCreateClient,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:docID',
  validator.validateDocParam,
  validate,
  controller.getByDoc
)

router.put(
  '/:docID',
  validator.validateUpdateClient,
  validate,
  controller.update
)

router.delete(
  '/:docID',
  validator.validateDocParam,
  validate,
  controller.remove
)

module.exports = router