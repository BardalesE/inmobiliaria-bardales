const { Router } = require('express')
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonial.controller')
const { getCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/company.controller')

const router = Router()

// Testimonios
router.get('/testimonials', getTestimonials)
router.post('/testimonials', createTestimonial)
router.put('/testimonials/:id', updateTestimonial)
router.delete('/testimonials/:id', deleteTestimonial)

// Empresas
router.get('/companies', getCompanies)
router.post('/companies', createCompany)
router.put('/companies/:id', updateCompany)
router.delete('/companies/:id', deleteCompany)

module.exports = router

// Comisiones
const { getCommissions, createCommission, deleteCommission } = require('../controllers/commission.controller')
router.get('/commissions', getCommissions)
router.post('/commissions', createCommission)
router.delete('/commissions/:id', deleteCommission)
