const prisma = require('../lib/prisma')
const { notifyNewLead } = require('../services/notifications')

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
    const { page = 1, limit = 20, search, source, status } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (source) where.source = source
    if (status) where.status = status
    if (search) {
      // MySQL ya es case-insensitive por collation; `mode: 'insensitive'` solo existe en Postgres
      where.OR = [
        { name:  { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { property: { select: { id: true, ref: true, title: true, district: true } } },
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

// ── PATCH /api/leads/:id/status ──
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const VALID = ['NUEVO', 'CONTACTADO', 'CERRADO']
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' })
    }
    const lead = await prisma.lead.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    })
    res.json({ success: true, data: lead })
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

module.exports = { createLead, getLeads, deleteLead, updateLeadStatus }
