const router = require('express').Router()
const controller = require('../controllers/table.controller')
const validator = require('../middlewares/table.middleware')
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
  validator.validateCreateTable,
  validate,
  controller.create
)

router.get('/', controller.getAll)

router.get(
  '/:table_id',
  validator.validateTableParam,
  validate,
  controller.getById
)


router.patch(
  '/:table_id',
  validator.validateUpdateTable,
  validate,
  controller.update
)


router.put(
  '/:table_id',
  validator.validateUpdateTable,
  validate,
  controller.update
)

router.delete(
  '/:table_id',
  validator.validateTableParam,
  validate,
  controller.remove
)

module.exports = router