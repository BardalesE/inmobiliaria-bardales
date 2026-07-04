/**
 * Smoke E2E de páginas públicas a nivel HTTP.
 * Requiere el frontend corriendo (next start) y el backend con datos.
 * Ejecutar: BASE_URL=http://localhost:3100 npm run test:smoke
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

const BASE = process.env.BASE_URL || 'http://localhost:3100'

const get = (p) => fetch(`${BASE}${p}`, { redirect: 'manual' })

test('home responde 200 y trae la marca y el hero', async () => {
  const res = await get('/')
  assert.equal(res.status, 200)
  const html = await res.text()
  assert.ok(html.includes('Inmobiliaria Bardales'), 'title/marca presente')
  assert.ok(html.includes('ENCUENTRA TU'), 'hero presente')
})

test('catálogo /properties renderiza propiedades en el HTML inicial (SSR)', async () => {
  const res = await get('/properties')
  assert.equal(res.status, 200)
  const html = await res.text()
  assert.ok(html.includes('Todos los Lotes'))
  assert.ok(/EE-\d{4}-\d{3}/.test(html), 'al menos una referencia de propiedad en el HTML')
})

test('detalle de propiedad trae OG, JSON-LD y contenido en el HTML', async () => {
  const res = await get('/properties/1')
  assert.equal(res.status, 200)
  const html = await res.text()
  assert.ok(html.includes('property="og:title"'), 'og:title presente')
  assert.ok(html.includes('property="og:image"'), 'og:image presente')
  assert.ok(html.includes('"@type":"RealEstateListing"'), 'JSON-LD presente')
  assert.ok(html.includes('rel="canonical"'), 'canonical presente')
})

test('propiedad inexistente muestra el 404 personalizado', async () => {
  const res = await get('/properties/999999')
  const html = await res.text()
  assert.ok(html.includes('Propiedad no encontrada'))
})

test('sitemap.xml incluye propiedades', async () => {
  const res = await get('/sitemap.xml')
  assert.equal(res.status, 200)
  const xml = await res.text()
  assert.ok(xml.includes('<urlset'))
  assert.ok(xml.includes('/properties/'), 'URLs de propiedades en el sitemap')
})

test('robots.txt bloquea /admin y referencia el sitemap', async () => {
  const res = await get('/robots.txt')
  assert.equal(res.status, 200)
  const txt = await res.text()
  assert.ok(txt.includes('Disallow: /admin'))
  assert.ok(txt.includes('sitemap.xml'))
})

test('página /publicar responde 200', async () => {
  const res = await get('/publicar')
  assert.equal(res.status, 200)
})

test('imagen OG por defecto se genera como PNG', async () => {
  const res = await get('/opengraph-image')
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type'), /image\/png/)
})
