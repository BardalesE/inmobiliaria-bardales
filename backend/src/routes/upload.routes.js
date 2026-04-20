const { Router } = require('express')
const multer = require('multer')

const router = Router()

// Configuración multer (memoria para Cloudinary)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'), false)
  }
})

// Mock upload — en producción conectar a Cloudinary
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió imagen' })
    }

    // ── CLOUDINARY REAL (descomentar cuando tengas API key) ──
    // const cloudinary = require('cloudinary').v2
    // const result = await new Promise((resolve, reject) => {
    //   const stream = cloudinary.uploader.upload_stream(
    //     { folder: 'inmobiliaria-bardales' },
    //     (error, result) => { if (error) reject(error); else resolve(result) }
    //   )
    //   stream.end(req.file.buffer)
    // })
    // return res.json({ success: true, url: result.secure_url, publicId: result.public_id })

    // ── MOCK (para desarrollo sin Cloudinary) ──
    const mockUrl = `https://picsum.photos/seed/${Date.now()}/800/600`
    res.json({
      success: true,
      url: mockUrl,
      publicId: `mock_${Date.now()}`,
      message: 'Mock upload — configura Cloudinary en producción'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
