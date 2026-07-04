const { Router } = require('express')
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonial.controller')
const { getCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/company.controller')
const { getCommissions, createCommission, deleteCommission } = require('../controllers/commission.controller')
const { getHeroVideos, createHeroVideo, updateHeroVideo, deleteHeroVideo, uploadHeroVideoFile } = require('../controllers/hero-video.controller')
const { authMiddleware, requireRole } = require('../middleware/auth.middleware')

// Contenido del sitio y datos financieros: solo ADMIN
const adminOnly = [authMiddleware, requireRole('ADMIN')]

const router = Router()

// Testimonios (lectura pública, escritura solo ADMIN)
router.get('/testimonials', getTestimonials)
router.post('/testimonials', ...adminOnly, createTestimonial)
router.put('/testimonials/:id', ...adminOnly, updateTestimonial)
router.delete('/testimonials/:id', ...adminOnly, deleteTestimonial)

// Empresas (lectura pública, escritura solo ADMIN)
router.get('/companies', getCompanies)
router.post('/companies', ...adminOnly, createCompany)
router.put('/companies/:id', ...adminOnly, updateCompany)
router.delete('/companies/:id', ...adminOnly, deleteCompany)

// Comisiones (datos financieros: solo ADMIN)
router.get('/commissions', ...adminOnly, getCommissions)
router.post('/commissions', ...adminOnly, createCommission)
router.delete('/commissions/:id', ...adminOnly, deleteCommission)

// Hero Videos (lectura pública, gestión solo ADMIN)
router.get('/hero-videos', getHeroVideos)
router.post('/hero-videos/upload', ...adminOnly, ...uploadHeroVideoFile)
router.post('/hero-videos', ...adminOnly, createHeroVideo)
router.put('/hero-videos/:id', ...adminOnly, updateHeroVideo)
router.delete('/hero-videos/:id', ...adminOnly, deleteHeroVideo)

module.exports = router
