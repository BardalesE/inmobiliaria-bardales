const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── GET /api/properties ──
const getProperties = async (req, res, next) => {
  try {
    const {
      status,
      type,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      district,
      sector,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query

    const where = {}

    if (status) where.status = status
    if (type) where.type = type
    if (district) where.district = { contains: district, mode: 'insensitive' }
    if (sector) where.sector = { contains: sector, mode: 'insensitive' }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (minArea || maxArea) {
      where.area = {}
      if (minArea) where.area.gte = parseFloat(minArea)
      if (maxArea) where.area.lte = parseFloat(maxArea)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { ref: { contains: search, mode: 'insensitive' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { images: { orderBy: { order: 'asc' } } },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit)
      }),
      prisma.property.count({ where })
    ])

    res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/properties/:id ──
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params

    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: { orderBy: { order: 'asc' } },
        leads: { select: { id: true, createdAt: true } }
      }
    })

    if (!property) {
      return res.status(404).json({ success: false, message: 'Propiedad no encontrada' })
    }

    res.json({ success: true, data: property })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/properties/ref/:ref ──
const getPropertyByRef = async (req, res, next) => {
  try {
    const { ref } = req.params

    const property = await prisma.property.findUnique({
      where: { ref },
      include: { images: { orderBy: { order: 'asc' } } }
    })

    if (!property) {
      return res.status(404).json({ success: false, message: 'Propiedad no encontrada' })
    }

    res.json({ success: true, data: property })
  } catch (error) {
    next(error)
  }
}

// ── POST /api/properties ──
const createProperty = async (req, res, next) => {
  try {
    const {
      ref, title, description, price, area, frontage, depth,
      sector, block, lot, address, district, province, department,
      latitude, longitude, status, type, features, images
    } = req.body

    const property = await prisma.property.create({
      data: {
        ref, title, description,
        price: parseFloat(price),
        area: parseFloat(area),
        frontage: frontage ? parseFloat(frontage) : null,
        depth: depth ? parseFloat(depth) : null,
        sector, block, lot, address, district, province, department,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: status || 'AVAILABLE',
        type: type || 'URBAN_LOT',
        features: features || [],
        images: images ? {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt || title,
            order: i
          }))
        } : undefined
      },
      include: { images: true }
    })

    res.status(201).json({ success: true, data: property, message: 'Propiedad creada exitosamente' })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'El código de referencia ya existe' })
    }
    next(error)
  }
}

// ── PUT /api/properties/:id ──
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = req.body

    if (data.price) data.price = parseFloat(data.price)
    if (data.area) data.area = parseFloat(data.area)
    if (data.latitude) data.latitude = parseFloat(data.latitude)
    if (data.longitude) data.longitude = parseFloat(data.longitude)

    delete data.images // imágenes se manejan por separado

    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data,
      include: { images: { orderBy: { order: 'asc' } } }
    })

    res.json({ success: true, data: property, message: 'Propiedad actualizada' })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/properties/:id ──
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.property.delete({ where: { id: parseInt(id) } })

    res.json({ success: true, message: 'Propiedad eliminada' })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/properties/stats ──
const getStats = async (req, res, next) => {
  try {
    const [total, available, reserved, sold, avgPrice] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'AVAILABLE' } }),
      prisma.property.count({ where: { status: 'RESERVED' } }),
      prisma.property.count({ where: { status: 'SOLD' } }),
      prisma.property.aggregate({ _avg: { price: true } })
    ])

    res.json({
      success: true,
      data: {
        total, available, reserved, sold,
        averagePrice: Math.round(avgPrice._avg.price || 0)
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProperties,
  getPropertyById,
  getPropertyByRef,
  createProperty,
  updateProperty,
  deleteProperty,
  getStats
}
