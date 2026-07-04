const prisma = require('../lib/prisma')

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
const ALLOWED_SORT = new Set(['createdAt', 'price', 'area', 'title', 'updatedAt'])

const getProperties = async (req, res, next) => {
  try {
    const {
      status, type, minPrice, maxPrice, search,
      page = 1, limit = 12,
      sortBy = 'createdAt', order = 'desc',
    } = req.query

    const pageInt  = Math.max(1, parseInt(page)  || 1)
    const limitInt = Math.min(100, parseInt(limit) || 12)
    const skip     = (pageInt - 1) * limitInt
    const safeSortBy = ALLOWED_SORT.has(sortBy) ? sortBy : 'createdAt'
    const safeOrder  = order === 'asc' ? 'asc' : 'desc'

    const where = {}
    if (status)   where.status = status
    if (type)     where.type   = type
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (search) {
      // MySQL ya es case-insensitive por collation; `mode: 'insensitive'` solo existe en Postgres
      where.OR = [
        { title:    { contains: search } },
        { ref:      { contains: search } },
        { address:  { contains: search } },
        { district: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { images: { orderBy: { order: 'asc' } } },
        orderBy: { [safeSortBy]: safeOrder },
        skip,
        take: limitInt,
      }),
      prisma.property.count({ where }),
    ])

    res.json({
      success: true,
      data: data.map(p => ({ ...p, features: parseFeatures(p.features) })),
      pagination: { total, page: pageInt, limit: limitInt, totalPages: Math.ceil(total / limitInt) },
    })
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

const toFloat  = (v) => (v !== undefined && v !== null && v !== '') ? parseFloat(v)  : null
const toInt    = (v) => (v !== undefined && v !== null && v !== '') ? parseInt(v)    : null
const toBool   = (v) => v === true || v === 'true'

// ── POST /api/properties ──
const createProperty = async (req, res, next) => {
  try {
    const {
      ref, title, description, price, area, frontage, depth,
      sector, block, lot, address, district, province, department,
      latitude, longitude, status, type, operation, features, images,
      rooms, bathrooms, parking, floors, yearBuilt, videoUrl, documentUrl, notes,
    } = req.body

    const property = await prisma.property.create({
      data: {
        ref, title, description: description || '',
        price: parseFloat(price), area: parseFloat(area),
        frontage: toFloat(frontage), depth: toFloat(depth),
        sector: sector || '', block: block || '', lot: lot || '',
        address, district, province, department,
        latitude: toFloat(latitude), longitude: toFloat(longitude),
        status: status || 'AVAILABLE', type: type || 'URBAN_LOT',
        operation: operation || 'SALE',
        features: serializeFeatures(features),
        rooms: toInt(rooms), bathrooms: toInt(bathrooms),
        parking: toBool(parking), floors: toInt(floors),
        yearBuilt: toInt(yearBuilt), videoUrl: videoUrl || null,
        documentUrl: documentUrl || null,
        notes: notes || null,
        images: images?.length ? {
          create: images.filter(i => i.url?.trim()).map((img, i) => ({ url: img.url, alt: img.alt || title, order: i }))
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
    const raw = { ...req.body }
    delete raw.images

    const data = {
      ...raw,
      price:     raw.price     ? parseFloat(raw.price)  : undefined,
      area:      raw.area      ? parseFloat(raw.area)   : undefined,
      frontage:  toFloat(raw.frontage),
      depth:     toFloat(raw.depth),
      latitude:  toFloat(raw.latitude),
      longitude: toFloat(raw.longitude),
      rooms:     toInt(raw.rooms),
      bathrooms: toInt(raw.bathrooms),
      floors:    toInt(raw.floors),
      yearBuilt: toInt(raw.yearBuilt),
      parking:   raw.parking !== undefined ? toBool(raw.parking) : undefined,
      features:  raw.features !== undefined ? serializeFeatures(raw.features) : undefined,
      videoUrl:    raw.videoUrl    || null,
      documentUrl: raw.documentUrl !== undefined ? (raw.documentUrl || null) : undefined,
      notes:       raw.notes       || null,
    }

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
const getStats = async (req, res, _next) => {
  const defaults = { total: 0, available: 0, reserved: 0, sold: 0, forSale: 0, forRent: 0, averagePrice: 0 }
  try {
    const all = await prisma.property.findMany({ select: { status: true, price: true } })
    const total = all.length
    const available = all.filter(p => p.status === 'AVAILABLE').length
    const reserved = all.filter(p => p.status === 'RESERVED').length
    const sold = all.filter(p => p.status === 'SOLD').length
    const priceSum = all.reduce((s, p) => s + (Number(p.price) || 0), 0)
    const averagePrice = total ? Math.round(priceSum / total) : 0
    res.json({ success: true, data: { total, available, reserved, sold, forSale: available, forRent: 0, averagePrice } })
  } catch (error) {
    console.error('getStats error:', error.message)
    res.json({ success: true, data: defaults })
  }
}

module.exports = { getProperties, getPropertyById, getPropertyByRef, createProperty, updateProperty, updateImages, deleteProperty, getStats }
