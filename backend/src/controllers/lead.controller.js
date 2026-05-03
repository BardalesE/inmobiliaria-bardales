const { PrismaClient } = require('@prisma/client')
const { notifyNewLead } = require('../services/notifications')

const prisma = new PrismaClient()

// ── POST /api/leads ──
const createLead = async (req, res, next) => {
  try {
    const { name, phone, email, message, source, propertyId } = req.body

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nombre y teléfono son obligatorios' })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        message,
        source: source || 'website',
        propertyId: propertyId ? parseInt(propertyId) : null,
      },
      include: {
        property: { select: { id: true, ref: true, title: true } },
      },
    })

    // ── Notificación real al correo ──
    notifyNewLead({
      name,
      phone,
      email,
      message,
      propertyRef: lead.property?.ref,
      propertyTitle: lead.property?.title,
    }).catch(() => {}) // No bloqueamos la respuesta si el email falla

    console.log(`📥 Nuevo lead: ${name} — ${phone} | Propiedad: ${lead.property?.ref || 'General'}`)

    res.status(201).json({
      success: true,
      data: lead,
      message: '¡Gracias! Nos comunicaremos contigo pronto.',
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/leads ──
const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { property: { select: { id: true, ref: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.lead.count({ where }),
    ])

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/leads/:id ──
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.lead.delete({ where: { id: parseInt(id) } })
    res.json({ success: true, message: 'Consulta eliminada' })
  } catch (error) {
    next(error)
  }
}

module.exports = { createLead, getLeads, deleteLead }
