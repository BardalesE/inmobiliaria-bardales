# Prompt para Claude Code (modelo Fable 5) — EE-Stars Final

> Cómo usarlo: pega primero el **PROMPT MAESTRO** al iniciar la sesión. Luego pega **una fase a la vez** (Fase 1, después Fase 2, etc.), revisando y probando antes de avanzar. No pegues todas las fases juntas.

---

## 🧠 PROMPT MAESTRO (pegar al inicio de la sesión)

```
Eres un Staff Software Engineer trabajando en el proyecto EE-Stars Final, una
plataforma inmobiliaria (Next.js 14 App Router + Express + Prisma) para
Inmobiliaria Bardales en Chepén, Perú. El proyecto se comparte con compradores
reales por WhatsApp y se desplegará en producción.

CONTEXTO OBLIGATORIO:
- En la raíz del proyecto existe el archivo `AUDITORIA_EE_STARS.md`. LÉELO
  COMPLETO antes de hacer nada. Es el diagnóstico técnico oficial y la fuente de
  verdad de qué hay que arreglar y por qué.
- NO quiero rehacer el proyecto. Quiero completarlo, corregirlo y estabilizarlo.

DECISIONES DE INFRAESTRUCTURA YA TOMADAS (no las cambies):
1. Despliegue: FRONTEND Next.js en Vercel + BACKEND Express en Railway (servicios
   separados, dominios distintos). Conservar la arquitectura Express actual.
2. Base de datos: MySQL gestionado en Railway.

TU FORMA DE TRABAJAR (estricta):
1. Analiza la estructura y los archivos afectados ANTES de modificar.
2. Explícame qué vas a cambiar y por qué (breve).
3. Implementa cambios pequeños y revisables.
4. Al terminar cada tarea: resume qué cambiaste y en qué archivos.
5. Nunca hagas cambios "a ciegas" ni borres datos o archivos útiles sin avisar.
6. Trabajaremos POR FASES. No avances a la siguiente fase hasta que yo lo diga.
7. Al final de cada fase: verifica que compile (`npm run build` en frontend,
   arranque del backend) y que no haya imports rotos.

REGLAS DE CÓDIGO:
- Limpio, moderno, reutilizable, comentado solo cuando aporta.
- No introduzcas dependencias nuevas salvo que lo justifiques y me lo consultes.
- No toques la lógica de negocio que ya funciona bien (login, Cloudinary, diseño).

Confirma que leíste `AUDITORIA_EE_STARS.md` y hazme un resumen de 5 líneas de los
6 problemas críticos antes de empezar la Fase 1.
```

---

## 🔴 FASE 1 — Errores críticos (bloqueantes)

```
FASE 1 — Corrección de errores críticos (según AUDITORIA_EE_STARS.md, sección 4).
Objetivo: que el proyecto arranque, sea seguro y compile contra MySQL de Railway.
Trabaja tarea por tarea, explicando antes de cada cambio.

C-2  Base de datos consistente (MySQL Railway):
     - Confirma `provider = "mysql"` en `backend/prisma/schema.prisma`.
     - Corrige `backend/prisma/migrations/migration_lock.toml` (hoy dice "sqlite"
       → debe decir "mysql").
     - Elimina las migraciones generadas para SQLite y `backend/prisma/dev.db`,
       y prepara migraciones nuevas para MySQL (deja el comando listo:
       `npx prisma migrate dev --name init`). No ejecutes contra la BD real sin
       mi confirmación.

C-3  Arreglar la búsqueda rota:
     - Quita `mode: 'insensitive'` de las consultas en
       `backend/src/controllers/property.controller.js` (líneas ~43-46) y
       `backend/src/controllers/lead.controller.js` (~62-64). MySQL ya es
       case-insensitive por collation.

C-5  Prisma singleton:
     - Crea `backend/src/lib/prisma.js` con una única instancia de PrismaClient
       (patrón singleton con guard en globalThis).
     - Reemplaza los 7 `new PrismaClient()` de los controladores por el import
       del singleton.

C-4  Autenticación en endpoints sensibles (aplica `authMiddleware`):
     - `GET/PATCH/DELETE /api/leads` (lead.routes.js)
     - `GET /api/sellers` (seller.routes.js)
     - `POST/PUT/DELETE /api/testimonials` y `/api/companies` (extra.routes.js)
     - `GET/POST/DELETE /api/commissions` (extra.routes.js)
     - `POST /api/upload` y `POST /api/upload/media` (upload.routes.js)
     - DEBEN quedar públicos: GET de properties, hero-videos, testimonials y
       companies; POST /api/leads y POST /api/sellers (formularios del sitio).

C-6  SEO base + compartir por WhatsApp:
     - Corrige la metadata en `frontend/src/app/layout.jsx`: hoy dice
       "Trujillo / Luz del Sol" → debe ser Inmobiliaria Bardales, Chepén, La
       Libertad. Añade `metadataBase`.
     - Convierte `frontend/src/app/properties/[id]/page.jsx` para que genere
       metadatos por propiedad con `generateMetadata` (Open Graph con imagen,
       título y precio del lote), de modo que al compartir el enlace en WhatsApp
       se vea la foto y el precio. Si hace falta separar la parte interactiva en
       un componente cliente, hazlo conservando el diseño actual.

Al terminar: resume cambios por archivo y verifica build del frontend y arranque
del backend. No avances a la Fase 2 hasta que yo lo apruebe.
```

---

## 🧹 FASE 2 — Limpieza y optimización de código

```
FASE 2 — Limpieza (AUDITORIA sección 5 y 6). Explica antes de borrar cualquier cosa.

- Elimina las CARPETAS BASURA creadas por una expansión de llaves de shell fallida
  (verifica primero que estén vacías): p.ej. `backend/src/{controllers,routes,...}`,
  `frontend/src/app/{admin`, etc. Muéstrame la lista antes de borrar.
- Código muerto: modelo `User`, `backend/scripts/create-user.js` y usuarios del
  seed NO se usan (el login usa variables de entorno). PROPÓN una de dos:
  (a) eliminarlos, o (b) —preferible— implementar auth real con la tabla User y
  roles ADMIN/AGENT. Recomiéndame la mejor opción antes de tocar nada.
- Extrae secciones del monolito `frontend/src/app/page.jsx` (1110 líneas) a
  componentes: Hero, PropiedadesDestacadas, Testimonios, Empresas, CTAFinal.
- Centraliza el número de WhatsApp en UNA variable de entorno con un único
  fallback correcto (hoy hay 51999999999 y 51982946582 mezclados).
- Añade configuración de ESLint + Prettier.

Verifica build al terminar. No avances hasta mi OK.
```

---

## ⚡ FASE 3 — Rendimiento y renderizado

```
FASE 3 — Rendimiento (AUDITORIA sección 7).

- Migra el catálogo (`/properties`) y el detalle (`/properties/[id]`) a Server
  Components con fetch en servidor (SSR o SSG con `revalidate`), conservando la
  interactividad necesaria en componentes cliente hijos.
- Activa `next/image`: quita `images.unoptimized: true` de `next.config.js`,
  reemplaza los `<img>` por `next/image` y añade el dominio de Cloudinary a
  `images.remotePatterns`.
- Añade índices en `schema.prisma`: Property.status, type, featured, price,
  createdAt; Lead.status, createdAt. Genera la migración correspondiente.
- Añade `loading.jsx`, `error.jsx` y `not-found.jsx` por segmento.

Verifica build y que las páginas rendericen datos en el HTML inicial.
```

---

## 🔍 FASE 4 — SEO técnico

```
FASE 4 — SEO (AUDITORIA sección 5 y 6).

- `sitemap.xml` dinámico (incluye todas las propiedades) y `robots.txt`.
- Canonical, favicon e imagen Open Graph por defecto.
- Datos estructurados JSON-LD `RealEstateListing` en la página de cada propiedad.
- Verifica los Open Graph por propiedad de la Fase 1 con una herramienta de
  previsualización.
```

---

## 🔒 FASE 5 — Seguridad y endurecimiento

```
FASE 5 — Seguridad (AUDITORIA sección 5).

- Aplica roles ADMIN/AGENT en las rutas (si se implementó auth con User en Fase 2).
- Restringe la CSP en `next.config.js` (hoy `img-src *`) a 'self' + Cloudinary.
- Escapa las variables inyectadas en el HTML de los emails
  (`backend/src/services/notifications.js`).
- Ajusta cookies para dominios distintos (Vercel + Railway): sameSite:'none',
  secure:true en producción. Revisa CORS con credentials.
- Como el backend va en Railway (no serverless), las subidas de 200MB están ok;
  documenta el límite. Opcional: subida firmada directa a Cloudinary.
```

---

## ✅ FASE 6 a 8 — Pruebas, Deploy y Producción

```
FASE 6 — QA: tests de integración de la API (auth, propiedades, leads), smoke
E2E de páginas públicas, y auditoría Lighthouse (meta >90 en Performance/SEO).
Prueba real: compartir un enlace de propiedad por WhatsApp y verificar el preview.

FASE 7 — Deploy: configura variables de entorno en Vercel (frontend) y Railway
(backend + MySQL). Ejecuta `prisma migrate deploy` en Railway. Verifica CORS y
cookies entre dominios. Smoke test en producción.

FASE 8 — Producción: monitoreo de errores (Sentry), analítica para medir
conversión de WhatsApp, backups de la BD, y una guía corta de "cómo agregar una
propiedad" para el equipo de Bardales.
```

---

### Notas
- Pega el **Prompt Maestro** una sola vez por sesión; da contexto a todo lo demás.
- Si Claude Code propone algo que contradice `AUDITORIA_EE_STARS.md` o las dos
  decisiones de infraestructura, recuérdaselo.
- Marca tu progreso en `AUDITORIA_EE_STARS.md` a medida que completes fases.
```
