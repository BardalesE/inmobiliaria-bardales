const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.company.findMany({ where: { active: true } })
    res.json({ success: true, data: companies })
  } catch (e) { next(e) }
}

const createCompany = async (req, res, next) => {
  try {
    const c = await prisma.company.create({ data: req.body })
    res.status(201).json({ success: true, data: c })
  } catch (e) { next(e) }
}

const updateCompany = async (req, res, next) => {
  try {
    const c = await prisma.company.update({ where: { id: parseInt(req.params.id) }, data: req.body })
    res.json({ success: true, data: c })
  } catch (e) { next(e) }
}

const deleteCompany = async (req, res, next) => {
  try {
    await prisma.company.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Eliminado' })
  } catch (e) { next(e) }
}

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany }
