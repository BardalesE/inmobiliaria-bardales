const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const propertyRoutes = require('./routes/property.routes')
const leadRoutes = require('./routes/lead.routes')
const uploadRoutes = require('./routes/upload.routes')
const sellerRoutes = require('./routes/seller.routes')
const extraRoutes = require('./routes/extra.routes')
const { errorHandler, notFound } = require('./middleware/error.middleware')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => res.json({ status: 'OK', service: 'EE-Stars API v2.1' }))

app.use('/api/properties', propertyRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/sellers', sellerRoutes)
app.use('/api', extraRoutes)   // /api/testimonials, /api/companies

app.use(notFound)
app.use(errorHandler)

module.exports = app
