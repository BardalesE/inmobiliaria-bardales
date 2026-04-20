const { Router } = require('express')
const { body, param, query } = require('express-validator')
const {
  getProperties,
  getPropertyById,
  getPropertyByRef,
  createProperty,
  updateProperty,
  deleteProperty,
  getStats
} = require('../controllers/property.controller')
const { validate } = require('../middleware/validate.middleware')

const router = Router()

// Validaciones
const propertyValidation = [
  body('ref').notEmpty().withMessage('La referencia es obligatoria'),
  body('title').notEmpty().withMessage('El título es obligatorio'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('area').isFloat({ min: 0 }).withMessage('El área debe ser un número positivo'),
  body('address').notEmpty().withMessage('La dirección es obligatoria'),
  body('district').notEmpty().withMessage('El distrito es obligatorio'),
  body('province').notEmpty().withMessage('La provincia es obligatoria'),
  body('department').notEmpty().withMessage('El departamento es obligatorio'),
]

// ── Rutas ──
router.get('/stats', getStats)
router.get('/ref/:ref', getPropertyByRef)
router.get('/', getProperties)
router.get('/:id', param('id').isInt(), validate, getPropertyById)
router.post('/', propertyValidation, validate, createProperty)
router.put('/:id', param('id').isInt(), validate, updateProperty)
router.delete('/:id', param('id').isInt(), validate, deleteProperty)

module.exports = router
