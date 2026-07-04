const { Router } = require('express')
const { body } = require('express-validator')
const { createSeller, getSellers } = require('../controllers/seller.controller')
const { validate } = require('../middleware/validate.middleware')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = Router()

const sellerValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
]

// POST público: formulario "Publicar propiedad" del sitio. La lectura requiere sesión admin.
router.post('/', sellerValidation, validate, createSeller)
router.get('/', authMiddleware, getSellers)

module.exports = router
