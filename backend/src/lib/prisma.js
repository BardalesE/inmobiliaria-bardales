const { PrismaClient } = require('@prisma/client')

// Instancia única de PrismaClient compartida por toda la app.
// El guard en globalThis evita crear clientes nuevos cuando el módulo
// se recarga (hot-reload en dev / reinvocaciones en hosts con autoscaling),
// lo que agotaría el pool de conexiones de MySQL.
const prisma = globalThis.__prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

module.exports = prisma
