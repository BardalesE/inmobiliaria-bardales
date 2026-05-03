const { Router } = require('express')
const { body } = require('express-validator')
const { createSeller, getSellers } = require('../controllers/seller.controller')
const { validate } = require('../middleware/validate.middleware')

const router = Router()

const sellerValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
]

router.post('/', sellerValidation, validate, createSeller)
router.get('/', getSellers)

module.exports = router
