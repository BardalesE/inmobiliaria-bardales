const { Router } = require('express')
const { body } = require('express-validator')
const { login, logout, me } = require('../controllers/auth.controller')
const { validate } = require('../middleware/validate.middleware')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = Router()

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  validate,
  login
)

router.post('/logout', logout)

router.get('/me', authMiddleware, me)

module.exports = router
