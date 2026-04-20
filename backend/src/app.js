const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const propertyRoutes = require('./routes/property.routes')
const leadRoutes = require('./routes/lead.routes')
const uploadRoutes = require('./routes/upload.routes')
const { errorHandler, notFound } = require('./middleware/error.middleware')

const app = express()

// ── Middlewares ──
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Inmobiliaria Bardales API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// ── Routes ──
app.use('/api/properties', propertyRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/upload', uploadRoutes)

// ── Error handlers ──
app.use(notFound)
app.use(errorHandler)

module.exports = app
