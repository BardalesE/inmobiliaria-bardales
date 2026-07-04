const { Router } = require('express')
const { body, param } = require('express-validator')
const { createLead, getLeads, deleteLead, updateLeadStatus } = require('../controllers/lead.controller')
const { validate } = require('../middleware/validate.middleware')
const { authMiddleware, requireRole } = require('../middleware/auth.middleware')

const router = Router()

const leadValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
]

// POST público: formulario de contacto del sitio. El resto requiere sesión admin.
router.get('/', authMiddleware, getLeads)
router.post('/', leadValidation, validate, createLead)
router.patch('/:id/status', authMiddleware, param('id').isInt(), validate, updateLeadStatus)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), param('id').isInt(), validate, deleteLead)

module.exports = router
