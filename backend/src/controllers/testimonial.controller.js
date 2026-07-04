const prisma = require('../lib/prisma')

const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: testimonials })
  } catch (e) { next(e) }
}

const createTestimonial = async (req, res, next) => {
  try {
    const t = await prisma.testimonial.create({ data: req.body })
    res.status(201).json({ success: true, data: t })
  } catch (e) { next(e) }
}

const updateTestimonial = async (req, res, next) => {
  try {
    const t = await prisma.testimonial.update({ where: { id: parseInt(req.params.id) }, data: req.body })
    res.json({ success: true, data: t })
  } catch (e) { next(e) }
}

const deleteTestimonial = async (req, res, next) => {
  try {
    await prisma.testimonial.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Eliminado' })
  } catch (e) { next(e) }
}

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial }
