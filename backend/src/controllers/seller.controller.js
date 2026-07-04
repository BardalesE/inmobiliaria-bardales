const prisma = require('../lib/prisma')
const { notifyNewSeller } = require('../services/notifications')

// ── POST /api/sellers ──
// Alguien quiere publicar su propiedad → guardamos sus datos y notificamos a Elian
const createSeller = async (req, res, next) => {
  try {
    const { name, phone, email, city, propertyType, description } = req.body

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nombre y teléfono son obligatorios' })
    }

    // Guardamos al vendedor como un lead con source = 'seller'
    const seller = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: `Ciudad: ${city || 'No indicó'} | Tipo: ${propertyType || 'No indicó'} | ${description || ''}`.trim(),
        source: 'seller', // diferencia a compradores de vendedores
      },
    })

    // ── Notificación instantánea a Elian ──
    notifyNewSeller({ name, phone, email, city, propertyType, description }).catch(() => {})

    console.log(`🏡 Nuevo vendedor: ${name} — ${phone} — ${city}`)

    res.status(201).json({
      success: true,
      data: { id: seller.id },
      message: '¡Recibimos tu solicitud! Te contactaremos en menos de 24 horas para publicar tu propiedad.',
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/sellers ── (para el panel admin — solo vendedores)
const getSellers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [sellers, total] = await Promise.all([
      prisma.lead.findMany({
        where: { source: 'seller' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.lead.count({ where: { source: 'seller' } }),
    ])

    res.json({
      success: true,
      data: sellers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { createSeller, getSellers }
