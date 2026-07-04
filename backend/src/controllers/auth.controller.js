const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')

// Arquitectura de producción: frontend en Vercel + API en Railway (dominios
// distintos) → la cookie de sesión debe ir con sameSite='none' y secure=true.
// Para eso, en Railway configura SAME_DOMAIN=false. (SAME_DOMAIN=true solo
// aplica si algún día frontend y API comparten dominio tras un proxy.)
const isProd = process.env.NODE_ENV === 'production'
const sameDomain = process.env.SAME_DOMAIN !== 'false'

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProd ? (sameDomain ? 'lax' : 'none') : 'lax',
  secure: isProd,
  maxAge: 8 * 60 * 60 * 1000,
}

// Hash bcrypt de relleno: se compara cuando el email no existe para que el
// tiempo de respuesta sea el mismo y no se pueda enumerar usuarios.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-no-enumeration', 12)

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    const validPassword = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

    // Misma respuesta si el email no existe, la clave es incorrecta o la cuenta
    // está desactivada — sin enumeración de usuarios
    if (!user || !validPassword || !user.active) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h', issuer: 'ee-stars-api' }
    )

    res.cookie('token', token, COOKIE_OPTIONS)

    return res.json({ success: true, message: 'Sesión iniciada correctamente' })
  } catch (error) { next(error) }
}

const logout = (_req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS)
  return res.json({ success: true, message: 'Sesión cerrada' })
}

const me = (req, res) => {
  const { sub, name, email, role } = req.user
  return res.json({ success: true, user: { id: sub, name, email, role } })
}

module.exports = { login, logout, me }
