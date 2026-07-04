/**
 * Crea un nuevo usuario admin/agente en la base de datos.
 * Uso: node scripts/create-user.js
 *
 * Requiere que .env esté configurado y la BD esté disponible.
 */
require('dotenv').config()
const readline = require('readline')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((resolve) => rl.question(q, resolve))

async function main() {
  console.log('\n── Crear usuario EE-Stars ──────────────────')

  const name  = (await ask('Nombre completo: ')).trim()
  const email = (await ask('Email:           ')).trim().toLowerCase()
  const role  = (await ask('Rol [ADMIN/AGENT] (default AGENT): ')).trim().toUpperCase() || 'AGENT'

  if (!['ADMIN', 'AGENT'].includes(role)) {
    console.error('Rol inválido. Usa ADMIN o AGENT.')
    process.exit(1)
  }

  // Lectura de contraseña sin eco (simple workaround para Node sin TTY)
  process.stdout.write('Contraseña: ')
  const password = await new Promise((resolve) => {
    let pw = ''
    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    const onData = (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '') {
        process.stdin.setRawMode?.(false)
        process.stdin.pause()
        process.stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(pw)
      } else if (ch === '') {
        pw = pw.slice(0, -1)
      } else {
        pw += ch
      }
    }
    process.stdin.on('data', onData)
  })

  if (!name || !email || !password) {
    console.error('Nombre, email y contraseña son obligatorios.')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.error(`Ya existe un usuario con el email ${email}.`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, active: true },
  })

  console.log(`\n✅ Usuario creado:`)
  console.log(`   ID:    ${user.id}`)
  console.log(`   Nombre: ${user.name}`)
  console.log(`   Email:  ${user.email}`)
  console.log(`   Rol:    ${user.role}`)
  console.log()
}

main()
  .catch((e) => { console.error(e.message); process.exit(1) })
  .finally(() => { prisma.$disconnect(); rl.close() })
