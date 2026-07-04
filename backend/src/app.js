const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const propertyRoutes = require('./routes/property.routes')
const leadRoutes = require('./routes/lead.routes')
const uploadRoutes = require('./routes/upload.routes')
const sellerRoutes = require('./routes/seller.routes')
const extraRoutes = require('./routes/extra.routes')
const authRoutes = require('./routes/auth.routes')
const { errorHandler, notFound } = require('./middleware/error.middleware')

const isProd = process.env.NODE_ENV === 'production'

const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(morgan(isProd ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 10 intentos de login por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Intenta en 15 minutos.' },
})

app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'EE-Stars API v2.1' }))

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/sellers', sellerRoutes)
app.use('/api', extraRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
