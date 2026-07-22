const prisma = require('../lib/prisma')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Límite de 100 MB: tope real de video del plan gratuito de Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo archivos de video o imagen'))
  },
})

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })

// ── GET /api/hero-videos ── public
const getHeroVideos = async (req, res, next) => {
  try {
    const where = req.query.all === 'true' ? {} : { active: true }
    const videos = await prisma.heroVideo.findMany({ where, orderBy: { order: 'asc' } })
    res.json({ success: true, data: videos })
  } catch (e) { next(e) }
}

// ── POST /api/hero-videos ── protected
const createHeroVideo = async (req, res, next) => {
  try {
    const { title, videoUrl, thumbnail, active, autoplay, loop, muted, order } = req.body
    const video = await prisma.heroVideo.create({
      data: {
        title,
        videoUrl,
        thumbnail: thumbnail || null,
        active:   active   !== false && active   !== 'false',
        autoplay: autoplay !== false && autoplay !== 'false',
        loop:     loop     !== false && loop     !== 'false',
        muted:    muted    !== false && muted    !== 'false',
        order: parseInt(order) || 0,
      },
    })
    res.status(201).json({ success: true, data: video })
  } catch (e) { next(e) }
}

// ── PUT /api/hero-videos/:id ── protected
const updateHeroVideo = async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.order !== undefined) data.order = parseInt(data.order)
    const video = await prisma.heroVideo.update({
      where: { id: parseInt(req.params.id) },
      data,
    })
    res.json({ success: true, data: video })
  } catch (e) { next(e) }
}

// ── DELETE /api/hero-videos/:id ── protected
const deleteHeroVideo = async (req, res, next) => {
  try {
    await prisma.heroVideo.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true, message: 'Video eliminado' })
  } catch (e) { next(e) }
}

// ── POST /api/hero-videos/upload ── protected + multer + Cloudinary
const uploadHeroVideoFile = [
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (!err) return next()
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Archivo demasiado grande. Máximo 100 MB (límite del plan gratuito de Cloudinary).' })
      }
      return res.status(400).json({ success: false, message: err.message || 'Error al procesar el archivo' })
    })
  },
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No se proporcionó archivo' })

      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(503).json({
          success: false,
          message: 'Cloudinary no configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET al .env',
        })
      }

      const isVideo = req.file.mimetype.startsWith('video/')

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'ee-stars/hero-videos',
        transformation: isVideo ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
      })

      // Generate thumbnail URL from Cloudinary video
      const thumbnail = isVideo
        ? result.secure_url
            .replace('/upload/', '/upload/so_0,w_1280,h_720,c_fill,q_auto/')
            .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
        : result.secure_url

      res.json({
        success: true,
        data: { videoUrl: result.secure_url, thumbnail, publicId: result.public_id },
      })
    } catch (e) { next(e) }
  },
]

module.exports = { getHeroVideos, createHeroVideo, updateHeroVideo, deleteHeroVideo, uploadHeroVideoFile }
