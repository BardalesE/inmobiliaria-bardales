const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── POST /api/leads ──
const createLead = async (req, res, next) => {
  try {
    const { name, phone, email, message, source, propertyId } = req.body

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        message,
        source: source || 'website',
        propertyId: propertyId ? parseInt(propertyId) : null
      },
      include: {
        property: { select: { id: true, ref: true, title: true } }
      }
    })

    // Aquí podrías enviar notificación por WhatsApp/email en producción
    console.log(`📥 Nuevo lead: ${name} - ${phone} | Propiedad: ${lead.property?.ref || 'General'}`)

    res.status(201).json({
      success: true,
      data: lead,
      message: '¡Gracias! Nos comunicaremos contigo pronto.'
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/leads ──
const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        include: { property: { select: { id: true, ref: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.lead.count()
    ])

    res.json({
      success: true,
      data: leads,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { createLead, getLeads }
