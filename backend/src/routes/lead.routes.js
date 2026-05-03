const { Router } = require('express')
const { body, param } = require('express-validator')
const { createLead, getLeads, deleteLead } = require('../controllers/lead.controller')
const { validate } = require('../middleware/validate.middleware')

const router = Router()

const leadValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('phone').notEmpty().withMessage('El teléfono es obligatorio'),
]

router.get('/', getLeads)
router.post('/', leadValidation, validate, createLead)
router.delete('/:id', param('id').isInt(), validate, deleteLead)

module.exports = router
