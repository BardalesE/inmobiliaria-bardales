const { Router } = require('express')
const { body } = require('express-validator')
const { createLead, getLeads } = require('../controllers/lead.controller')
const { validate } = require('../middleware/validate.middleware')

const router = Router()

const leadValidation = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('phone').notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^[0-9+\s\-()]{7,15}$/).withMessage('Teléfono inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
]

router.post('/', leadValidation, validate, createLead)
router.get('/', getLeads)

module.exports = router
