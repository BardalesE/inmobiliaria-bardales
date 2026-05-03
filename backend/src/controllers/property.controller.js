const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const parseFeatures = (f) => {
  if (!f) return []
  if (Array.isArray(f)) return f
  try { return JSON.parse(f) } catch { return [] }
}

const serializeFeatures = (f) => {
  if (!f) return '[]'
  if (typeof f === 'string') { try { JSON.parse(f); return f } catch {} return '[]' }
  return JSON.stringify(f)
}

// ── GET /api/properties ──
const getProperties = async (req, res, next) => {
  try {
    const { status, type, minPrice, maxPrice, search, page = 1, limit = 12, sortBy = 'createdAt', order = 'desc' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    let all = await prisma.property.findMany({
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { [sortBy]: order },
    })

    if (status) all = all.filter(p => p.status === status)
    if (type) all = all.filter(p => p.type === type)
    if (minPrice) all = all.filter(p => p.price >= parseFloat(minPrice))
    if (maxPrice) all = all.filter(p => p.price <= parseFloat(maxPrice))
    if (search) {
      const q = search.toLowerCase()
      all = all.filter(p =>
        p.title?.toLowerCase().includes(q) || p.ref?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q)
      )
    }

    const total = all.length
    const data = all.slice(skip, skip + parseInt(limit)).map(p => ({ ...p, features: parseFeatures(p.features) }))

    res.json({ success: true, data, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) { next(error) }
}

// ── GET /api/properties/:id ──
const getPropertyById = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: { orderBy: { order: 'asc' } }, leads: { select: { id: true, createdAt: true } } }
    })
    if (!property) return res.status(404).json({ success: false, message: 'Propiedad no encontrada' })
    res.json({ success: true, data: { ...property, features: parseFeatures(property.features) } })
  } catch (error) { next(error) }
}

// ── GET /api/properties/ref/:ref ──
const getPropertyByRef = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { ref: req.params.ref },
      include: { images: { orderBy: { order: 'asc' } } }
    })
    if (!property) return res.status(404).json({ success: false, message: 'Propiedad no encontrada' })
    res.json({ success: true, data: { ...property, features: parseFeatures(property.features) } })
  } catch (error) { next(error) }
}

// ── POST /api/properties ──
const createProperty = async (req, res, next) => {
  try {
    const { ref, title, description, price, area, frontage, depth, sector, block, lot,
      address, district, province, department, latitude, longitude, status, type, features, images } = req.body

    const property = await prisma.property.create({
      data: {
        ref, title, description,
        price: parseFloat(price), area: parseFloat(area),
        frontage: frontage ? parseFloat(frontage) : null,
        depth: depth ? parseFloat(depth) : null,
        sector, block, lot, address, district, province, department,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: status || 'AVAILABLE', type: type || 'URBAN_LOT',
        features: serializeFeatures(features),
        images: images?.length ? {
          create: images.map((img, i) => ({ url: img.url, alt: img.alt || title, order: i }))
        } : undefined
      },
      include: { images: true }
    })

    res.status(201).json({ success: true, data: { ...property, features: parseFeatures(property.features) }, message: 'Propiedad creada' })
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'La referencia ya existe' })
    next(error)
  }
}

// ── PUT /api/properties/:id ──
const updateProperty = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data.images
    if (data.price) data.price = parseFloat(data.price)
    if (data.area) data.area = parseFloat(data.area)
    if (data.frontage) data.frontage = parseFloat(data.frontage)
    if (data.depth) data.depth = parseFloat(data.depth)
    if (data.latitude) data.latitude = parseFloat(data.latitude)
    if (data.longitude) data.longitude = parseFloat(data.longitude)
    if (data.features !== undefined) data.features = serializeFeatures(data.features)

    const property = await prisma.property.update({
      where: { id: parseInt(req.params.id) }, data,
      include: { images: { orderBy: { order: 'asc' } } }
    })
    res.json({ success: true, data: { ...property, features: parseFeatures(property.features) }, message: 'Propiedad actualizada' })
  } catch (error) { next(error) }
}

// ── PUT /api/properties/:id/images ──
const updateImages = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const { images } = req.body

    // Eliminar imágenes viejas y crear nuevas
    await prisma.image.deleteMany({ where: { propertyId: id } })

    if (images?.length) {
      await prisma.image.createMany({
        data: images.map((img, i) => ({ url: img.url, alt: img.alt || '', order: i, propertyId: id }))
      })
    }

    res.json({ success: true, message: 'Imágenes actualizadas' })
  } catch (error) { next(error) }
}

// ── DELETE /api/properties/:id ──
const deleteProperty = async (req, res, next) => {
  try {
    await prisma.property.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Propiedad eliminada' })
  } catch (error) { next(error) }
}

// ── GET /api/properties/stats ──
const getStats = async (req, res, next) => {
  try {
    const all = await prisma.property.findMany({ select: { status: true, price: true } })
    const total = all.length
    const available = all.filter(p => p.status === 'AVAILABLE').length
    const reserved = all.filter(p => p.status === 'RESERVED').length
    const sold = all.filter(p => p.status === 'SOLD').length
    const avgPrice = total ? Math.round(all.reduce((s, p) => s + p.price, 0) / total) : 0
    res.json({ success: true, data: { total, available, reserved, sold, averagePrice: avgPrice } })
  } catch (error) { next(error) }
}

module.exports = { getProperties, getPropertyById, getPropertyByRef, createProperty, updateProperty, updateImages, deleteProperty, getStats }
