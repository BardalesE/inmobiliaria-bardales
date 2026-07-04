/**
 * Tests de integración de la API (auth, propiedades, leads).
 * Usa el runner nativo de Node (node:test) — sin dependencias nuevas.
 * Requiere la BD local migrada (MySQL Laragon). Ejecutar: npm test
 */
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
// Evita que los tests envíen emails reales (sendEmail se salta si faltan)
process.env.NOTIFY_EMAIL_TO = ''
process.env.NOTIFY_EMAIL_FROM = ''

const bcrypt = require('bcryptjs')
const prisma = require('../src/lib/prisma')
const app = require('../src/app')

const QA_EMAIL = 'qa-test@ee-stars.test'
const QA_PASS = 'qa-secret-123'
const QA_REF = `QA-${Date.now()}`

let server
let base
let adminCookie

const api = (p, opts = {}) =>
  fetch(`${base}${p}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
      ...opts.headers,
    },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

before(async () => {
  server = app.listen(0)
  base = `http://127.0.0.1:${server.address().port}/api`
  // Usuario ADMIN exclusivo de la suite (se elimina al final)
  await prisma.user.upsert({
    where: { email: QA_EMAIL },
    update: { passwordHash: await bcrypt.hash(QA_PASS, 4), role: 'ADMIN', active: true },
    create: {
      name: 'QA Test',
      email: QA_EMAIL,
      passwordHash: await bcrypt.hash(QA_PASS, 4),
      role: 'ADMIN',
      active: true,
    },
  })
})

after(async () => {
  await prisma.lead.deleteMany({ where: { name: 'QA Lead' } })
  await prisma.property.deleteMany({ where: { ref: QA_REF } })
  await prisma.user.deleteMany({ where: { email: QA_EMAIL } })
  await prisma.$disconnect()
  server.close()
})

// ── AUTH ─────────────────────────────────────────────────────────────────────

test('login con credenciales inválidas responde 401 sin distinguir causa', async () => {
  const res = await api('/auth/login', {
    method: 'POST',
    body: { email: QA_EMAIL, password: 'incorrecta' },
  })
  assert.equal(res.status, 401)
  const json = await res.json()
  assert.equal(json.message, 'Credenciales inválidas')
})

test('login correcto devuelve cookie httpOnly y /auth/me identifica al usuario', async () => {
  const res = await api('/auth/login', {
    method: 'POST',
    body: { email: QA_EMAIL, password: QA_PASS },
  })
  assert.equal(res.status, 200)
  const setCookie = res.headers.get('set-cookie')
  assert.ok(setCookie.includes('token='), 'debe setear cookie token')
  assert.ok(/httponly/i.test(setCookie), 'la cookie debe ser httpOnly')
  adminCookie = setCookie.split(';')[0]

  const me = await api('/auth/me', { cookie: adminCookie })
  assert.equal(me.status, 200)
  const json = await me.json()
  assert.equal(json.user.email, QA_EMAIL)
  assert.equal(json.user.role, 'ADMIN')
})

// ── PROPIEDADES ──────────────────────────────────────────────────────────────

let propertyId

test('GET /properties es público y pagina', async () => {
  const res = await api('/properties?limit=2')
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.equal(json.success, true)
  assert.ok(Array.isArray(json.data))
  assert.ok(json.pagination.total >= 0)
  assert.ok(json.pagination.totalPages >= 0)
})

test('POST /properties sin sesión responde 401', async () => {
  const res = await api('/properties', { method: 'POST', body: { title: 'x' } })
  assert.equal(res.status, 401)
})

test('ADMIN crea, busca, actualiza y elimina una propiedad', async () => {
  const create = await api('/properties', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      ref: QA_REF,
      title: 'Lote QA de prueba',
      price: 12345,
      area: 100,
      address: 'Calle Test 123',
      district: 'Chepén',
      province: 'Chepén',
      department: 'La Libertad',
      features: ['QA'],
    },
  })
  assert.equal(create.status, 201)
  const created = (await create.json()).data
  propertyId = created.id
  assert.equal(created.ref, QA_REF)

  // Búsqueda por referencia (verifica el fix de mode:'insensitive' en MySQL)
  const search = await api(`/properties?search=${QA_REF.toLowerCase()}`)
  const found = (await search.json()).data
  assert.equal(found.length, 1)
  assert.equal(found[0].ref, QA_REF)

  const update = await api(`/properties/${propertyId}`, {
    method: 'PUT',
    cookie: adminCookie,
    body: { price: 99999 },
  })
  assert.equal(update.status, 200)
  assert.equal((await update.json()).data.price, 99999)

  const del = await api(`/properties/${propertyId}`, { method: 'DELETE', cookie: adminCookie })
  assert.equal(del.status, 200)

  const gone = await api(`/properties/${propertyId}`)
  assert.equal(gone.status, 404)
})

// ── LEADS ────────────────────────────────────────────────────────────────────

let leadId

test('POST /leads es público (formulario del sitio)', async () => {
  const res = await api('/leads', {
    method: 'POST',
    body: { name: 'QA Lead', phone: '999888777', message: 'Consulta de prueba' },
  })
  assert.equal(res.status, 201)
  const json = await res.json()
  leadId = json.data.id
  assert.equal(json.data.status, 'NUEVO')
})

test('GET /leads exige sesión y el ADMIN ve el lead creado', async () => {
  const noAuth = await api('/leads')
  assert.equal(noAuth.status, 401)

  const res = await api('/leads?search=QA Lead', { cookie: adminCookie })
  assert.equal(res.status, 200)
  const json = await res.json()
  assert.ok(json.data.some((l) => l.id === leadId))
})

test('ADMIN actualiza estado y elimina el lead', async () => {
  const bad = await api(`/leads/${leadId}/status`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: { status: 'INVENTADO' },
  })
  assert.equal(bad.status, 400)

  const patch = await api(`/leads/${leadId}/status`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: { status: 'CONTACTADO' },
  })
  assert.equal(patch.status, 200)
  assert.equal((await patch.json()).data.status, 'CONTACTADO')

  const del = await api(`/leads/${leadId}`, { method: 'DELETE', cookie: adminCookie })
  assert.equal(del.status, 200)
})
