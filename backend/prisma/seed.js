const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Cargando datos de ejemplo para EE-Stars...')

  // Limpiar todo
  await prisma.review.deleteMany()
  await prisma.company.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.image.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  // ── USUARIO ADMIN INICIAL ──
  // Si ADMIN_PASSWORD_HASH está en .env se usa ese hash; si no, clave de desarrollo.
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash('bardales2025', 12)

  await prisma.user.upsert({
    where: { email: 'admin@ee-stars.pe' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ee-stars.pe',
      passwordHash,
      role: 'ADMIN',
      active: true,
    },
  })
  console.log('✅ Usuario admin: admin@ee-stars.pe' + (process.env.ADMIN_PASSWORD_HASH ? ' (clave del .env)' : ' / bardales2025'))

  // ── PROPIEDADES ──
  const properties = [
    {
      ref: 'EE-2025-001', title: 'Casa en Chepén — Sector Centro',
      description: 'Casa de 2 pisos en zona céntrica de Chepén. Títulos saneados, agua y luz instalados. Ideal para familia o inversión.',
      price: 85000, area: 120, frontage: 8, depth: 15,
      sector: 'Centro', block: '12', lot: '4A',
      address: 'Jr. Independencia 345, Sector Centro',
      district: 'Chepén', province: 'Chepén', department: 'La Libertad',
      latitude: -7.2281, longitude: -79.4328,
      status: 'AVAILABLE', type: 'HOUSE', featured: true,
      features: '["Títulos saneados","Agua y desagüe","Luz eléctrica","2 pisos","Garaje"]',
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80', alt: 'Casa Chepén', order: 0 },
        { url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80', alt: 'Interior', order: 1 },
      ]}
    },
    {
      ref: 'EE-2025-002', title: 'Terreno Urbano — Urb. El Milagro',
      description: 'Terreno plano en urbanización consolidada. Excelente ubicación cerca al mercado central.',
      price: 45000, area: 200, frontage: 10, depth: 20,
      sector: 'El Milagro', block: '5', lot: '3B',
      address: 'Urb. El Milagro, Mz. 5, Lt. 3B',
      district: 'Chepén', province: 'Chepén', department: 'La Libertad',
      latitude: -7.2295, longitude: -79.4350,
      status: 'AVAILABLE', type: 'URBAN_LOT', featured: true,
      features: '["Título saneado","Habilitación urbana","Esquinero","Vía asfaltada"]',
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Terreno', order: 0 },
      ]}
    },
    {
      ref: 'EE-2025-003', title: 'Lote Residencial — San Carlos',
      description: 'Lote ideal para construir tu casa. Zona residencial tranquila con todos los servicios.',
      price: 32000, area: 160, frontage: 8, depth: 20,
      sector: 'San Carlos', block: '8', lot: '7',
      address: 'Urb. San Carlos, Mz. 8, Lt. 7',
      district: 'Chepén', province: 'Chepén', department: 'La Libertad',
      latitude: -7.2270, longitude: -79.4310,
      status: 'AVAILABLE', type: 'URBAN_LOT', featured: false,
      features: '["Agua potable","Luz eléctrica","Zona residencial"]',
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Lote', order: 0 },
      ]}
    },
    {
      ref: 'EE-2025-004', title: 'Casa Independiente — La Victoria',
      description: 'Casa independiente de 1 piso con amplio patio trasero. Lista para habitar.',
      price: 65000, area: 180, frontage: 9, depth: 20,
      sector: 'La Victoria', block: '3', lot: '12',
      address: 'Urb. La Victoria Mz. 3, Lt. 12',
      district: 'Chepén', province: 'Chepén', department: 'La Libertad',
      latitude: -7.2260, longitude: -79.4340,
      status: 'RESERVED', type: 'HOUSE', featured: false,
      features: '["Títulos saneados","1 piso","Patio amplio","Cocina equipada"]',
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', alt: 'Casa', order: 0 },
      ]}
    },
    {
      ref: 'EE-2025-005', title: 'Terreno Agrícola — Salida a Guadalupe',
      description: 'Terreno agrícola con acceso por carretera. A 5 minutos del centro de Chepén.',
      price: 28000, area: 500,
      address: 'Carretera Chepén-Guadalupe Km 2',
      district: 'Chepén', province: 'Chepén', department: 'La Libertad',
      latitude: -7.2340, longitude: -79.4280,
      status: 'AVAILABLE', type: 'RURAL_LOT', featured: false,
      features: '["Acceso por carretera","Riego disponible","Escritura pública"]',
      images: { create: [
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', alt: 'Terreno agrícola', order: 0 },
      ]}
    },
  ]

  for (const p of properties) {
    await prisma.property.create({ data: p })
  }
  console.log(`✅ ${properties.length} propiedades`)

  // ── TESTIMONIOS ──
  await prisma.testimonial.createMany({ data: [
    {
      name: 'Carlos Quispe',
      role: 'Comprador — Primera vivienda',
      city: 'Chepén',
      comment: 'Gracias a EE-Stars encontré mi casa en menos de una semana. Antes estuve meses buscando a pie y sin resultados. El sistema es muy fácil de usar.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=11',
      active: true, order: 1
    },
    {
      name: 'María Lozano',
      role: 'Vendedora — Terreno en Chepén',
      city: 'Chepén',
      comment: 'Publiqué mi terreno y en 10 días ya tenía compradores interesados. El equipo de EE-Stars me ayudó en todo el proceso.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=5',
      active: true, order: 2
    },
    {
      name: 'Roberto Flores',
      role: 'Inversionista — 2 propiedades',
      city: 'Trujillo',
      comment: 'Lo que más me gustó fue poder ver las coordenadas exactas en el mapa. Compré dos terrenos sin tener que ir a verlos primero. Excelente plataforma.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=15',
      active: true, order: 3
    },
  ]})
  console.log('✅ 3 testimonios')

  // ── EMPRESAS ALIADAS ──
  await prisma.company.createMany({ data: [
    { name: 'Notaría García', logo: 'https://ui-avatars.com/api/?name=NG&background=C4622D&color=fff&size=80', comment: 'Aliados estratégicos en trámites legales', type: 'notaría', active: true },
    { name: 'Banco de la Nación', logo: 'https://ui-avatars.com/api/?name=BN&background=1a237e&color=fff&size=80', comment: 'Financiamiento hipotecario disponible', type: 'banco', active: true },
    { name: 'Constructora Norte', logo: 'https://ui-avatars.com/api/?name=CN&background=2e7d32&color=fff&size=80', comment: 'Construcción y habilitación de terrenos', type: 'constructora', active: true },
    { name: 'Mudanzas Chepén', logo: 'https://ui-avatars.com/api/?name=MC&background=6a1b9a&color=fff&size=80', comment: 'Servicio de mudanzas a todo el norte', type: 'servicio', active: true },
  ]})
  console.log('✅ 4 empresas aliadas')

  console.log('\n🚀 EE-Stars listo en http://localhost:3000')
  console.log('🔐 Admin: http://localhost:3000/admin → bardales2025')
}

main().catch(console.error).finally(() => prisma.$disconnect())
