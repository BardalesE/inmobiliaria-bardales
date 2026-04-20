const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Limpiar datos existentes
  await prisma.lead.deleteMany()
  await prisma.image.deleteMany()
  await prisma.property.deleteMany()

  // ── PROPIEDAD 1 ──
  const prop1 = await prisma.property.create({
    data: {
      ref: 'IB-2025-081-6C',
      title: 'Lote 6C — Manzana 81, Sector I',
      description: 'Lote urbano completamente habilitado con acceso a todos los servicios básicos. Ideal para construcción de vivienda familiar o inversión. Documentación en regla con título de propiedad saneado.',
      price: 30000,
      area: 180,
      frontage: 10,
      depth: 18,
      sector: 'Sector I',
      block: '81',
      lot: '6C',
      address: 'Mz. 81, Lote 6C, Sector I',
      district: 'Trujillo',
      province: 'Trujillo',
      department: 'La Libertad',
      latitude: -7.972028,
      longitude: -79.046415,
      status: 'AVAILABLE',
      type: 'URBAN_LOT',
      features: ['Luz eléctrica', 'Agua y desagüe', 'Vía asfaltada', 'Título saneado', 'Cerca al parque', 'Listo para construir'],
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Vista satelital del lote', order: 0 },
          { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', alt: 'Vista del terreno', order: 1 },
          { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'Vista de la urbanización', order: 2 },
        ]
      }
    }
  })

  // ── PROPIEDAD 2 ──
  const prop2 = await prisma.property.create({
    data: {
      ref: 'IB-2025-081-5A',
      title: 'Lote 5A — Manzana 81, Sector I',
      description: 'Amplio lote urbano de esquina con dos frentes. Excelente ubicación a pasos del Parque Luz del Sol. Acceso inmediato a servicios básicos completos.',
      price: 35000,
      area: 207,
      frontage: 12,
      depth: 17.25,
      sector: 'Sector I',
      block: '81',
      lot: '5A',
      address: 'Mz. 81, Lote 5A, Sector I',
      district: 'Trujillo',
      province: 'Trujillo',
      department: 'La Libertad',
      latitude: -7.971900,
      longitude: -79.046500,
      status: 'AVAILABLE',
      type: 'URBAN_LOT',
      features: ['Lote de esquina', 'Doble frente', 'Luz eléctrica', 'Agua y desagüe', 'Vía asfaltada', 'Título saneado'],
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', alt: 'Vista del lote 5A', order: 0 },
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Vista aérea', order: 1 },
        ]
      }
    }
  })

  // ── PROPIEDAD 3 ──
  const prop3 = await prisma.property.create({
    data: {
      ref: 'IB-2025-081-1A',
      title: 'Lote 1A — Manzana 81, Sector I',
      description: 'Lote en excelente ubicación con todos los servicios. Zonificación residencial R3. Ideal para inversión a largo plazo.',
      price: 28000,
      area: 160,
      frontage: 10,
      depth: 16,
      sector: 'Sector I',
      block: '81',
      lot: '1A',
      address: 'Mz. 81, Lote 1A, Sector I',
      district: 'Trujillo',
      province: 'Trujillo',
      department: 'La Libertad',
      latitude: -7.972100,
      longitude: -79.046300,
      status: 'RESERVED',
      type: 'URBAN_LOT',
      features: ['Luz eléctrica', 'Agua y desagüe', 'Vía asfaltada', 'Título saneado', 'Zonificación R3'],
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80', alt: 'Vista del lote 1A', order: 0 },
          { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', alt: 'Vista del sector', order: 1 },
        ]
      }
    }
  })

  // ── PROPIEDAD 4 ──
  await prisma.property.create({
    data: {
      ref: 'IB-2025-082-3B',
      title: 'Lote 3B — Manzana 82, Sector II',
      description: 'Terreno urbano bien ubicado en Sector II. Próximo a vías principales y centros comerciales. Documentos al día.',
      price: 45000,
      area: 250,
      frontage: 12.5,
      depth: 20,
      sector: 'Sector II',
      block: '82',
      lot: '3B',
      address: 'Mz. 82, Lote 3B, Sector II',
      district: 'Trujillo',
      province: 'Trujillo',
      department: 'La Libertad',
      latitude: -7.973000,
      longitude: -79.047000,
      status: 'AVAILABLE',
      type: 'URBAN_LOT',
      features: ['250 m² de área', 'Luz eléctrica', 'Agua y desagüe', 'Pistas y veredas', 'Título saneado', 'Zona comercial cercana'],
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800&q=80', alt: 'Vista del lote 3B', order: 0 },
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', alt: 'Vista aérea sector', order: 1 },
        ]
      }
    }
  })

  // ── LEAD DE PRUEBA ──
  await prisma.lead.create({
    data: {
      name: 'Juan García',
      phone: '951234567',
      email: 'juan@example.com',
      message: 'Me interesa el lote 6C',
      source: 'website',
      propertyId: prop1.id
    }
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`   → ${4} propiedades creadas`)
  console.log(`   → ${1} lead de prueba creado`)
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
