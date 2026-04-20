# 🏠 Inmobiliaria Bardales — Plataforma Inmobiliaria

E-commerce inmobiliario completo con backend Node.js/Express, frontend Next.js, base de datos PostgreSQL y ORM Prisma.

---

## 📋 Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior |
| PostgreSQL   | 14.x o superior |
| Git         | Cualquier versión |

---

## 🚀 Instalación paso a paso

### 1. Clonar / Descomprimir el proyecto

```bash
cd real-estate-app
```

### 2. Instalar todas las dependencias

```bash
npm run install:all
```

Esto instala dependencias en: raíz + backend + frontend.

### 3. Crear base de datos en PostgreSQL

```sql
-- En psql o pgAdmin:
CREATE DATABASE inmobiliaria_bardales;
CREATE USER bardales_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE inmobiliaria_bardales TO bardales_user;
```

### 4. Configurar variables de entorno

**Backend:**
```bash
cd backend
cp .env.example .env
```
Edita `backend/.env`:
```env
DATABASE_URL="postgresql://bardales_user:tu_password_seguro@localhost:5432/inmobiliaria_bardales"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
WHATSAPP_NUMBER=51999999999
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```
Edita `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WHATSAPP=51999999999
```

### 5. Migrar y poblar la base de datos

```bash
# Desde la raíz del proyecto:
npm run db:migrate
npm run db:seed
```

### 6. ¡Ejecutar el proyecto!

```bash
# Desde la raíz — levanta backend (puerto 4000) + frontend (puerto 3000):
npm run dev
```

Abre tu navegador en: **http://localhost:3000** 🎉

---

## 🌐 URLs del sistema

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |
| Prisma Studio | `npm run db:studio` |

---

## 📡 Endpoints de la API

### Propiedades
```
GET    /api/properties              → Listar con filtros y paginación
GET    /api/properties/stats        → Estadísticas generales
GET    /api/properties/:id          → Detalle por ID
GET    /api/properties/ref/:ref     → Detalle por referencia
POST   /api/properties              → Crear propiedad
PUT    /api/properties/:id          → Actualizar propiedad
DELETE /api/properties/:id          → Eliminar propiedad
```

### Leads / Consultas
```
POST   /api/leads                   → Registrar consulta de cliente
GET    /api/leads                   → Listar leads (admin)
```

### Upload
```
POST   /api/upload                  → Subir imagen (mock en dev, Cloudinary en prod)
```

### Filtros disponibles en GET /api/properties
```
?status=AVAILABLE|RESERVED|SOLD
?minPrice=10000&maxPrice=50000
?minArea=100&maxArea=300
?district=Trujillo
?sector=Sector I
?search=texto libre
?page=1&limit=12
?sortBy=price&order=asc
```

---

## 🗄️ Base de datos

### Modelos Prisma
- **Property** — Propiedades con todos sus atributos
- **Image** — Imágenes vinculadas a propiedades
- **Lead** — Consultas/contactos de clientes

### Comandos útiles
```bash
npm run db:migrate     # Crear tablas
npm run db:seed        # Poblar con datos de prueba
npm run db:studio      # Abrir Prisma Studio (interfaz visual)
npm run db:reset       # Resetear y re-poblar BD
```

---

## 📸 Imágenes (Cloudinary)

Por defecto usa URLs de prueba (Unsplash). Para producción:

1. Crea cuenta en [cloudinary.com](https://cloudinary.com)
2. Agrega en `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```
3. Descomenta el bloque Cloudinary en `backend/src/routes/upload.routes.js`

---

## 🔧 Posibles errores y soluciones

### ❌ `Error: Can't reach database server`
**Solución:** Verifica que PostgreSQL esté corriendo y que `DATABASE_URL` en `.env` sea correcto.
```bash
# Linux/Mac:
sudo service postgresql start
# Windows: Abre pgAdmin o Services → PostgreSQL
```

### ❌ `Port 3000 already in use`
**Solución:**
```bash
# Linux/Mac:
kill -9 $(lsof -ti:3000)
# O cambiar puerto en frontend/package.json:
"dev": "next dev -p 3001"
```

### ❌ `Module not found`
**Solución:**
```bash
npm run install:all
```

### ❌ `Prisma Client not generated`
**Solución:**
```bash
cd backend && npx prisma generate
```

### ❌ `CORS error en frontend`
**Solución:** Verifica que `FRONTEND_URL` en `backend/.env` coincida con la URL del frontend.

---

## 📁 Estructura del proyecto

```
real-estate-app/
├── package.json              ← Scripts raíz (dev, setup, db:*)
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← Modelos de BD
│   │   └── seed.js           ← Datos de prueba
│   ├── src/
│   │   ├── server.js         ← Entry point
│   │   ├── app.js            ← Express setup
│   │   ├── controllers/      ← Lógica de negocio
│   │   ├── routes/           ← Definición de rutas
│   │   └── middleware/       ← Error handling, validación
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx              ← Home (listado)
│   │   │   ├── layout.jsx            ← Root layout
│   │   │   └── properties/[id]/      ← Detalle de propiedad
│   │   ├── components/
│   │   │   ├── layout/Navbar.jsx
│   │   │   └── ui/
│   │   │       ├── PropertyCard.jsx
│   │   │       ├── FilterBar.jsx
│   │   │       ├── LeadForm.jsx
│   │   │       ├── ImageGallery.jsx
│   │   │       └── MapEmbed.jsx
│   │   └── lib/api.js                ← Cliente HTTP
│   └── .env.example
│
└── README.md
```

---

## 🚀 Deploy en producción

### Backend → Railway / Render
1. Crea proyecto en [railway.app](https://railway.app)
2. Agrega PostgreSQL como plugin
3. Configura variables de entorno
4. Deploy automático desde GitHub

### Frontend → Vercel
1. Importa repo en [vercel.com](https://vercel.com)
2. Configura `NEXT_PUBLIC_API_URL` con la URL del backend
3. Deploy automático

---

## 📞 Contacto

**Inmobiliaria Bardales** — Trujillo, La Libertad, Perú  
WhatsApp: +51 999 999 999

---

*Proyecto generado con arquitectura MVC — Node.js + Next.js + PostgreSQL + Prisma*
