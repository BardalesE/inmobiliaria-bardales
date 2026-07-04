const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// Express identifica el middleware de errores por tener 4 parámetros
const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  console.error(`❌ Error [${statusCode}]:`, err.message)

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = { notFound, errorHandler }
