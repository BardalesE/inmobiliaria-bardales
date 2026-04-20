require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🏠 Inmobiliaria Bardales API       ║
  ║   Corriendo en puerto ${PORT}           ║
  ║   http://localhost:${PORT}/api          ║
  ╚══════════════════════════════════════╝
  `)
})
