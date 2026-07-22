const { Router } = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')
const { authMiddleware } = require('../middleware/auth.middleware')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = Router()

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })

// ── POST /api/upload — images only ───────────────────────────────────────────
const imageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'), false)
  },
})

router.post('/', authMiddleware, imageMulter.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió imagen' })
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'ee-stars/properties',
      resource_type: 'image',
    })
    res.json({ success: true, url: result.secure_url, publicId: result.public_id })
  } catch (error) {
    next(error)
  }
})

/* Inserts fl_attachment into a Cloudinary URL so the browser downloads the file
   with the original filename instead of the public_id */
function buildPdfDownloadUrl(url, originalName) {
  if (!url) return url
  const safeName = (originalName || 'documento')
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/\.pdf$/i, '') + '.pdf'
  return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`)
}

// ── POST /api/upload/media — video + PDF ─────────────────────────────────────
// Límite de 100 MB: es el tope real de video que acepta el plan gratuito de
// Cloudinary (no 200MB). Además el backend corre en Render free tier (512MB
// RAM) con multer en memoria, así que un límite más bajo también evita que
// el proceso se quede sin memoria al bufferear archivos grandes.
const mediaMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Solo se permiten videos (MP4, MOV, WEBM) y PDFs'), false)
  },
})

router.post('/media', authMiddleware, (req, res, next) => {
  mediaMulter.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(413).json({ success: false, message: 'Archivo demasiado grande (máx 100 MB — límite del plan gratuito de Cloudinary)' })
      return res.status(400).json({ success: false, message: err.message || 'Error al procesar archivo' })
    }
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No se recibió archivo' })

      const isVideo = req.file.mimetype.startsWith('video/')
      const isPdf   = req.file.mimetype === 'application/pdf'
      const resourceType = isVideo ? 'video' : 'raw'

      const uploadOptions = isVideo
        ? {
            folder: 'ee-stars/properties/media',
            resource_type: 'video',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          }
        : {
            // PDFs: resource_type 'raw' no agrega la extensión .pdf solo — hay
            // que forzarla con `format`. Sin esto, la URL final queda sin
            // extensión (ej: /file_aoedfy) y el navegador la descarga como
            // archivo genérico en vez de abrirla inline.
            folder: 'ee-stars/documents',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: true,
            format: 'pdf',
          }

      const result = await uploadToCloudinary(req.file.buffer, uploadOptions)

      // Auto-generate thumbnail URL for videos (first frame)
      const thumbnail = isVideo
        ? result.secure_url
            .replace('/upload/', '/upload/so_0,w_640,h_360,c_fill,q_auto/')
            .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
        : null

      // For PDFs, build a forced-download URL with a clean filename
      const downloadUrl = isPdf
        ? buildPdfDownloadUrl(result.secure_url, req.file.originalname)
        : null

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType,
        thumbnail,
        downloadUrl,
        originalName: req.file.originalname,
        size: req.file.size,
      })
    } catch (error) {
      next(error)
    }
  })
})

module.exports = router
