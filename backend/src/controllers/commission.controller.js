const prisma = require('../lib/prisma')

// GET /api/commissions — todas las comisiones con stats
const getCommissions = async (req, res, next) => {
  try {
    const commissions = await prisma.commission.findMany({
      include: { property: { select: { id: true, ref: true, title: true, district: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const total = commissions.reduce((s, c) => s + c.amount, 0)
    const totalSales = commissions.reduce((s, c) => s + c.salePrice, 0)

    // Comisiones por mes (últimos 6 meses)
    const byMonth = {}
    commissions.forEach(c => {
      const key = new Date(c.createdAt).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
      byMonth[key] = (byMonth[key] || 0) + c.amount
    })

    res.json({
      success: true,
      data: commissions,
      stats: {
        totalCommissions: Math.round(total),
        totalSales: Math.round(totalSales),
        count: commissions.length,
        byMonth,
      }
    })
  } catch (e) { next(e) }
}

// POST /api/commissions — registrar nueva comisión (al marcar propiedad como vendida)
const createCommission = async (req, res, next) => {
  try {
    const { propertyId, salePrice, percentage = 3.0, notes } = req.body
    const amount = parseFloat(salePrice) * (parseFloat(percentage) / 100)

    // Marcar propiedad como SOLD automáticamente
    await prisma.property.update({
      where: { id: parseInt(propertyId) },
      data: { status: 'SOLD' },
    })

    const commission = await prisma.commission.create({
      data: {
        propertyId: parseInt(propertyId),
        salePrice: parseFloat(salePrice),
        percentage: parseFloat(percentage),
        amount: Math.round(amount * 100) / 100,
        notes,
      },
      include: { property: { select: { ref: true, title: true } } }
    })

    res.status(201).json({ success: true, data: commission, message: `Comisión registrada: S/ ${commission.amount.toLocaleString()}` })
  } catch (e) { next(e) }
}

// DELETE /api/commissions/:id
const deleteCommission = async (req, res, next) => {
  try {
    await prisma.commission.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Eliminada' })
  } catch (e) { next(e) }
}

module.exports = { getCommissions, createCommission, deleteCommission }
