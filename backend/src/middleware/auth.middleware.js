const jwt = require('jsonwebtoken')

const TOKEN_MESSAGES = {
  TokenExpiredError: 'Sesión expirada, vuelve a iniciar sesión',
  JsonWebTokenError: 'Token inválido',
  NotBeforeError: 'Token aún no válido',
}

const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

const authMiddleware = (req, res, next) => {
  const token = extractToken(req)

  if (!token) {
    return res.status(401).json({ success: false, message: 'No autenticado' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'ee-stars-api',
    })
    next()
  } catch (err) {
    const message = TOKEN_MESSAGES[err.name] ?? 'Token inválido'
    return res.status(401).json({ success: false, message })
  }
}

// Autorización por rol. Usar SIEMPRE después de authMiddleware.
// Ej.: router.delete('/:id', authMiddleware, requireRole('ADMIN'), handler)
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' })
  }
  next()
}

module.exports = { authMiddleware, requireRole }
