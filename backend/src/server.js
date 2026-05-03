require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🏠  EE-Stars API — v2.0            ║
  ║   Puerto: ${PORT}                       ║
  ║   http://localhost:${PORT}/api/health   ║
  ╚══════════════════════════════════════╝
  `)
})
