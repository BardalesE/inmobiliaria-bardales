# 🏠 Auditoría Técnica — EE-Stars Final

**Proyecto:** Plataforma inmobiliaria para Inmobiliaria Bardales (Chepén, La Libertad, Perú)
**Objetivo de negocio:** Vitrina digital para vender lotes/casas y captar contactos por WhatsApp.
**Objetivo técnico:** Terminar, optimizar y desplegar en Vercel — sin rehacer el proyecto.
**Fecha de auditoría:** 3 de julio de 2026
**Alcance:** Análisis de solo lectura. No se modificó ningún archivo de código. Este documento es el diagnóstico previo a la implementación por fases.

> **Nota de método:** Se revisó el 100% del código fuente (49 archivos versionados en git): backend Express completo (rutas, controladores, middleware, servicios), esquema y migraciones de Prisma, seed, y el frontend Next.js (App Router, páginas, componentes, configuración, SEO). Cada observación cita el archivo concreto.

---

## 📌 Progreso de implementación

- ✅ **Fase 0** (2026-07-03): Decisiones tomadas — frontend en Vercel + backend Express en Railway; MySQL gestionado en Railway.
- ✅ **Fase 1** (2026-07-03): C-2 lock/migraciones MySQL, C-3 búsqueda, C-4 auth en endpoints sensibles, C-5 Prisma singleton, C-6 metadata Chepén/Bardales + Open Graph por propiedad. Pendiente: ejecutar `npx prisma migrate dev --name init` contra la BD real.
- ✅ **Fase 2** (2026-07-03): Carpetas basura eliminadas; auth real con tabla User (login por email + bcrypt, JWT con rol ADMIN/AGENT); monolito `page.jsx` extraído a `components/home/*` (1111 → 70 líneas); WhatsApp centralizado en `lib/site.js` (51982946582); ESLint + Prettier configurados (0 errores).
- ✅ **Fase 3** (2026-07-03): `/properties` y `/properties/[id]` con render en servidor (ISR 60s, datos en el HTML inicial — verificado); `next/image` activo con `remotePatterns` (quitado `unoptimized`); 7 índices en schema (Property: status/type/featured/price/createdAt; Lead: status/createdAt) incluidos en la migración `init` aplicada al MySQL local; `loading/error/not-found` por segmento. Nota: `features` perdió su `@default("[]")` (MySQL no admite defaults en TEXT; el controlador lo asigna siempre).
- ✅ **Fase 4** (2026-07-03): `sitemap.xml` dinámico (páginas fijas + todas las propiedades, revalidate 1h) y `robots.txt` (bloquea /admin); canonical en home/catálogo/detalle; favicon `icon.svg`; imagen OG por defecto generada con `next/og` (runtime edge — el runtime nodejs falla en Windows); JSON-LD `RealEstateListing` con precio PEN, dirección y geo en cada propiedad. Extra: eliminada la dependencia sin uso `react-leaflet` (el conflicto de peers con React 18 desapareció; `npm install` ya no necesita `--legacy-peer-deps`).
- ✅ **Fase 5** (2026-07-03): roles aplicados con `requireRole` (ADMIN: borrados, comisiones, testimonios/empresas/hero-videos; AGENT: propiedades, uploads, leads, sellers) — matriz verificada con smoke test (9/9); CSP `img-src` restringida a self+Cloudinary+seed+tiles de mapas; HTML de emails escapado (`esc()` en notifications.js); cookies documentadas para Vercel+Railway (`SAME_DOMAIN=false` en Railway → sameSite=none+secure), CORS ya usaba credentials+FRONTEND_URL; límite de subida 200MB documentado (válido en Railway).
- ✅ **Fase 6** (2026-07-03): QA — tests de integración de API con `node:test` (8/8: auth con cookie httpOnly, CRUD de propiedades con búsqueda, leads público/protegido) en `backend/tests/api.test.js` (`npm test`); smoke E2E HTTP de páginas públicas (8/8: SSR con datos, OG, JSON-LD, 404, sitemap, robots, OG image) en `frontend/tests/smoke.test.mjs` (`npm run test:smoke`); Lighthouse local: SEO 100/100/100, Best Practices 96, Perf 79/87/82 (home/catálogo/detalle — TBT 0, CLS 0; LCP limitado por red local, re-medir en producción). Pendiente: preview real de WhatsApp requiere URL pública (Fase 7).
- ⬜ Fases 7-8 pendientes.

---

## 1. Resumen Ejecutivo

EE-Stars Final es un **monorepo con dos aplicaciones separadas**: un backend **Express + Prisma + MySQL** (`/backend`) y un frontend **Next.js 14 (App Router) + Tailwind** (`/frontend`), con **Cloudinary** para medios. La base está **mejor construida de lo habitual en un MVP**: hay separación limpia de capas, validación con Zod y express-validator, seguridad básica de login correcta (bcrypt, JWT en cookie httpOnly, rate-limit, sin enumeración de usuarios) y un diseño visual pulido y coherente.

Sin embargo, **el proyecto NO está listo para producción ni se puede desplegar en Vercel en su estado actual**. Existe una contradicción estructural de fondo: **el backend está diseñado para un VPS** (el propio `DEPLOY.md` documenta Ubuntu + Nginx + PM2 + MySQL local), mientras que el objetivo declarado es **Vercel**, una plataforma serverless que no ejecuta un servidor Express persistente. A esto se suman errores que impiden el arranque en producción (proveedor de base de datos inconsistente, búsqueda rota) y **fallos de seguridad graves**: varios endpoints con datos personales de clientes y datos financieros quedaron **sin autenticación**.

Igual de importante para el negocio: **las páginas de propiedades se renderizan solo en el cliente y no tienen metadatos por propiedad**, de modo que **compartir un lote por WhatsApp o Facebook no muestra foto, título ni precio** — precisamente el canal de distribución principal del proyecto. Y el SEO base apunta a la ciudad equivocada ("Trujillo / Luz del Sol" en lugar de Chepén / Bardales).

**Veredicto:** Producto con buenos cimientos pero con 6 problemas críticos que hay que resolver antes de cualquier lanzamiento. Es totalmente viable llegar a producción sin rehacerlo, siguiendo el roadmap por fases de la sección 9. **Calificación global: 4.3 / 10** (detalle en sección 10).

---

## 2. Arquitectura

### Cómo está organizado

```
ee-stars-final/
├── backend/                    # API REST — Express 4 + Prisma 5
│   ├── src/
│   │   ├── app.js              # Configuración de Express (middlewares, rutas)
│   │   ├── server.js           # app.listen() — servidor persistente
│   │   ├── routes/             # auth, property, lead, seller, upload, extra
│   │   ├── controllers/        # Lógica de cada recurso
│   │   ├── middleware/         # auth (JWT), validate, error
│   │   └── services/           # notifications.js (email vía nodemailer/Gmail)
│   ├── prisma/                 # schema.prisma, migraciones, seed.js, dev.db (SQLite)
│   └── scripts/create-user.js  # CLI para crear usuarios (código muerto, ver §4)
├── frontend/                   # Next.js 14 App Router + Tailwind
│   └── src/
│       ├── app/                # Rutas: /, /properties, /properties/[id], /publicar, /admin/*
│       ├── components/         # layout, ui, admin (wizard de publicación)
│       └── lib/                # api.js (axios), propertySchema.js (zod), useAdminAuth.js
├── DEPLOY.md                   # Guía de despliegue… en VPS Ubuntu (NO Vercel)
└── package.json                # Orquestador con concurrently
```

### Tecnologías

| Capa | Stack |
|------|-------|
| Frontend | Next.js 14.2 (App Router), React 18, Tailwind 3.4, react-hook-form, Zod 4, axios, Leaflet (mapas), dnd-kit (orden de imágenes) |
| Backend | Node/Express 4, Prisma 5, JWT, bcryptjs, helmet, cors, express-rate-limit, multer, nodemailer |
| Base de datos | MySQL (declarado) / SQLite (real en migraciones) — **inconsistente** |
| Medios | Cloudinary (imágenes, video, PDF) |
| Auth | JWT en cookie httpOnly; usuario único por variables de entorno |

### Flujo de la aplicación

1. El visitante entra al frontend (Next.js). Las páginas son **client components** que llaman por axios (`lib/api.js`) a la API Express.
2. La API consulta MySQL vía Prisma y responde JSON.
3. El comprador rellena un formulario (`LeadForm`) → `POST /api/leads` → se guarda el lead y se dispara un **email de notificación** al dueño (nodemailer/Gmail).
4. El botón de WhatsApp abre `wa.me` con un mensaje pre-armado (canal de conversión principal).
5. El admin entra a `/admin`, inicia sesión (JWT), y gestiona propiedades, leads y videos del hero.

### Fortalezas de la arquitectura

- **Separación de responsabilidades limpia** en el backend (routes → controllers → middleware → services). Fácil de mantener y extender.
- **Cloudinary como almacenamiento de medios** es la decisión correcta para un despliegue serverless (evita depender del disco local, que en Vercel es efímero).
- Esquema Prisma bien modelado, con relaciones y `onDelete` explícitos.

### Debilidades de la arquitectura

- 🔴 **Topología incompatible con Vercel.** El backend es un servidor Express persistente (`server.js` hace `app.listen`) pensado para VPS + Nginx + PM2 (ver `DEPLOY.md`). Vercel es serverless: no mantiene un proceso vivo. **Esta es la decisión arquitectónica que hay que resolver primero** (opciones en §4, punto C-1).
- 🔴 **Dos modelos de autenticación en conflicto** (ver §4, C-4): el login real usa variables de entorno (usuario único), pero existe un modelo `User`, un `seed` y un script `create-user.js` que sugieren usuarios en base de datos. Nunca se usan.
- 🟠 Acoplamiento del frontend a la API por URL absoluta (`NEXT_PUBLIC_API_URL`), sin capa de revalidación/caché de Next. Todo el contenido llega por fetch en cliente → SEO y rendimiento penalizados (§6, §7).

---

## 3. Estado General del Código

**Calidad global: 6 / 10 — "Buen MVP, con deuda técnica localizada".**

Lo que está bien: nombres claros, funciones cortas en el backend, validación centralizada, uso de `Promise.all` para consultas paralelas, whitelist de campos de ordenamiento (`ALLOWED_SORT` en `property.controller.js`), clamping de paginación (`Math.min(100, ...)`), y sanitización del nombre de archivo en subidas de PDF. Son señales de un desarrollador cuidadoso.

Lo que arrastra la nota:

- **Componentes monolíticos en el frontend.** `app/page.jsx` tiene **1110 líneas** y `app/admin/dashboard/page.jsx` **1190 líneas**. Mezclan datos, estado, y mucho JSX inline con estilos. Difíciles de mantener y de testear.
- **Código muerto** (ver §4-C4 y §5): modelo `User`, `scripts/create-user.js`, `notifyNewSeller` parcialmente huérfano, y **carpetas basura** creadas por una expansión de llaves de shell fallida (`backend/src/{controllers,routes,middleware,services}`, `frontend/src/app/{admin`, etc.).
- **7 instancias de `new PrismaClient()`** repartidas por los controladores (`grep` confirma 7). Debería haber **una sola** (patrón singleton). En serverless esto agota el pool de conexiones (§4-C5).
- Estilos inline extensos mezclados con clases Tailwind (Navbar, page) → inconsistencia de enfoque.
- **Sin ESLint/Prettier configurados, sin tests, sin CI.** No hay red de seguridad automática.

---

## 4. Problemas Críticos (bloquean producción)

> Ordenados por prioridad. Estos **impiden desplegar, arrancar o exponen datos**.

### 🔴 C-1 — El backend Express no funciona en Vercel tal cual
`backend/src/server.js` levanta un servidor persistente y `DEPLOY.md` documenta un despliegue en VPS (Nginx/PM2/MySQL local). Vercel no ejecuta procesos persistentes.
**Impacto:** Sin resolver esto, no hay despliegue en Vercel.
**Opciones (comparadas):**
- **(A) Recomendada a corto plazo — Backend separado:** desplegar el frontend Next.js en Vercel y el backend Express en un host de servidores (Railway o Render, ambos con plan gratuito y MySQL/Postgres gestionado). Cambio mínimo de código, se conserva la arquitectura. Se configura `NEXT_PUBLIC_API_URL` al dominio del backend y `FRONTEND_URL`/CORS al dominio de Vercel.
- **(B) Recomendada a largo plazo — Unificar en Next:** migrar los controladores Express a **Route Handlers de Next** (`app/api/**/route.js`) y desplegar todo como una sola app en Vercel. Elimina CORS, cookies cross-site y un servicio extra; mejor DX. Mayor esfuerzo inicial.
- **(C) No recomendada:** forzar Express en una serverless function con `serverless-http`. Funciona pero arrastra los límites de Vercel (payload 4.5 MB, cold starts) y complica las subidas grandes.
**Recomendación:** (A) para salir a producción ya; planificar (B) como evolución.

### 🔴 C-2 — Proveedor de base de datos inconsistente (no compila la migración)
`schema.prisma` declara `provider = "mysql"`, pero `prisma/migrations/migration_lock.toml` dice `provider = "sqlite"` y existe un `prisma/dev.db` (SQLite). Las migraciones se generaron para SQLite.
**Impacto:** `prisma migrate deploy` **falla** contra MySQL; el arranque en producción se rompe.
**Solución:** Decidir un motor definitivo y regenerar migraciones. Recomendado **Postgres gestionado** (Neon o Vercel Postgres — integración nativa con Vercel) o **MySQL en Railway**. Fijar el mismo `provider` en schema y lock, borrar migraciones SQLite y regenerar con `prisma migrate dev` contra el motor real.

### 🔴 C-3 — La búsqueda está rota (`mode: 'insensitive'`)
En `property.controller.js` (líneas 43-46) y `lead.controller.js` (62-64) se usa `{ contains: search, mode: 'insensitive' }`. Ese `mode` **solo existe en el conector de PostgreSQL/MongoDB de Prisma**; con MySQL o SQLite lanza error de validación.
**Impacto:** Cualquier búsqueda de propiedades o de leads devuelve **500**. Una función central de la UX no funciona.
**Solución:** Si se migra a Postgres, funciona tal cual. Si se queda en MySQL, quitar `mode` (MySQL ya es case-insensitive por collation por defecto).

### 🔴 C-4 — Endpoints sensibles SIN autenticación (fuga de datos y abuso)
Revisión de rutas: varios endpoints con datos personales y financieros están **abiertos al público**:

| Endpoint | Archivo | Riesgo |
|----------|---------|--------|
| `GET /api/leads` | `lead.routes.js` | **Cualquiera lee todos los contactos** (nombre, teléfono, email) de tus clientes |
| `PATCH/DELETE /api/leads/:id` | `lead.routes.js` | Cualquiera cambia estado o **borra leads** |
| `GET /api/sellers` | `seller.routes.js` | Datos de vendedores expuestos |
| `POST/PUT/DELETE /api/testimonials` y `/companies` | `extra.routes.js` | **Escritura pública**: cualquiera crea/borra testimonios y empresas |
| `GET/POST/DELETE /api/commissions` | `extra.routes.js` | **Datos financieros (comisiones) públicos** de lectura y escritura |
| `POST /api/upload` y `/api/upload/media` | `upload.routes.js` | **Subida abierta a tu Cloudinary** → abuso, coste, contenido malicioso |

**Impacto:** Violación de privacidad de clientes reales, manipulación de contenido, y coste/abuso de almacenamiento. En Perú, exponer datos personales sin control tiene además implicancias legales (Ley N.º 29733 de Protección de Datos Personales).
**Solución:** Aplicar `authMiddleware` a **toda** operación de lectura de leads/sellers/commissions y a toda escritura de testimonials/companies/commissions/uploads. Solo deben quedar públicos: `GET /properties*`, `GET /hero-videos`, `GET /testimonials`, `GET /companies`, `POST /leads` y `POST /sellers` (formularios del sitio).

### 🔴 C-5 — Múltiples instancias de PrismaClient (agotan conexiones)
Hay **7** `new PrismaClient()` en los controladores. En serverless (Vercel/Railway con autoscaling) cada invocación abre nuevas conexiones → se agota el pool de la base de datos y aparecen errores intermitentes `too many connections`.
**Solución:** Un único cliente compartido (`lib/prisma.js` con patrón singleton y guard `globalThis`) importado por todos los controladores.

### 🔴 C-6 — SEO base incorrecto y páginas de propiedad sin metadatos (rompe el compartir por WhatsApp)
Dos problemas que golpean directamente el objetivo comercial:
1. `app/layout.jsx` tiene `title: 'Inmobiliaria Bardales — Lotes en Trujillo'`, descripción de **Trujillo** y keyword **"Luz del Sol"** — el negocio es **Chepén** e Inmobiliaria Bardales. Es metadata heredada de otro proyecto.
2. `app/properties/[id]/page.jsx` es `'use client'`: **no genera metadatos por propiedad** (no hay `generateMetadata`). Al pegar el enlace de un lote en WhatsApp/Facebook **no aparece foto, título ni precio** — solo un enlace pelado. Como WhatsApp es tu canal principal, esto sabotea la conversión.
**Solución:** Corregir metadata global a Chepén/Bardales y convertir la página de detalle (y el listado) a **Server Component con `generateMetadata`** que emita Open Graph con imagen, título y precio por propiedad. (Ligado a la estrategia de renderizado de §7.)

---

## 5. Problemas Importantes (corregir antes del lanzamiento)

- 🟠 **Imágenes sin optimizar.** `next.config.js` fuerza `images: { unoptimized: true }` y todo el frontend usa `<img>` en vez de `next/image`. Sin lazy-loading real, sin `srcset`/responsive, sin AVIF/WebP. Penaliza LCP y Core Web Vitals (§7).
- 🟠 **Falta infraestructura SEO:** no hay `sitemap.xml`, `robots.txt`, `metadataBase`, canonical, favicon, imagen OG por defecto, ni datos estructurados JSON-LD (`RealEstateListing`/`Product`). Para una inmobiliaria que quiere aparecer en Google, esto es esencial.
- 🟠 **Código muerto / carpetas basura.** Directorios creados por una expansión de llaves fallida en shell: `backend/src/{controllers,routes,middleware,services}`, `frontend/src/app/{admin`, `frontend/src/app/{admin/{dashboard,leads,properties},properties,publicar}`, etc. No afectan al build pero ensucian el repo y confunden. **Recomendación:** verificar que estén vacíos y eliminarlos (no borran nada útil).
- 🟠 **Botón "Compartir" ausente.** Las instrucciones del proyecto piden un botón de compartir en cada propiedad; la página de detalle solo tiene WhatsApp y llamar. Falta `navigator.share` / copiar enlace.
- 🟠 **Número de WhatsApp inconsistente por defecto.** `next.config.js` usa `51999999999`, `Navbar.jsx` y `page.jsx` usan `51982946582`, y la página de detalle `51999999999`. Debe centralizarse en una sola variable de entorno y un único fallback correcto.
- 🟠 **Roles ADMIN/AGENT no se aplican.** El schema define `role`, pero `authMiddleware` solo valida que el token sea válido; no hay verificación de rol en ninguna ruta. Cualquier usuario autenticado puede todo.
- 🟠 **CSP demasiado permisiva.** `next.config.js` fija `img-src 'self' * data: blob:` — permite imágenes desde cualquier origen. Conviene restringir a `'self'`, Cloudinary y los dominios necesarios.
- 🟠 **Subidas de hasta 200 MB vs límite de Vercel.** `upload.routes.js` y `hero-video.controller.js` aceptan archivos de 200 MB. Si el backend termina en una función serverless, el límite de payload de Vercel es **4.5 MB** → las subidas grandes fallarán. (Con backend en Railway/Render no hay problema; documentarlo según la opción elegida en C-1). Ideal: subida directa del navegador a Cloudinary con firma (signed upload) para no pasar el archivo por el servidor.

---

## 6. Mejoras Recomendadas (elevan calidad significativamente)

- **Prisma singleton** (`lib/prisma.js`) reutilizado en todos los controladores (resuelve C-5 y es base de todo lo demás).
- **Índices de base de datos.** Añadir índices a los campos por los que se filtra/ordena: `Property.status`, `type`, `featured`, `price`, `createdAt`, y `Lead.status`, `createdAt`. Hoy no hay ninguno más allá de los `@unique`. Con inventario creciente, las consultas se degradan.
- **Modelar `features` como relación o JSON nativo.** Hoy se guarda como string JSON en una columna `Text` (`Property.features`), lo que impide filtrar "propiedades con "Título saneado"". Postgres permite `Json` nativo; o una tabla `Feature` N:M.
- **Renderizado server-side/SSG del catálogo** (ver §7) para SEO y velocidad.
- **Estados de carga y error del App Router:** añadir `loading.jsx`, `error.jsx` y `not-found.jsx` por segmento.
- **Extraer secciones del monolito** `page.jsx` (Hero, Destacadas, Testimonios, Empresas, CTA) a componentes independientes.
- **Sanitizar entradas en emails.** `notifications.js` inyecta `name`, `message`, etc. directamente en HTML del correo. Escapar para evitar inyección de HTML en la bandeja del dueño.
- **Observabilidad:** integrar un logger estructurado y monitoreo de errores (Sentry) en lugar de `console.log`.
- **Tests mínimos (QA):** pruebas de integración de la API (auth, CRUD de propiedades, creación de leads) y smoke E2E de las páginas públicas antes de cada deploy.
- **Accesibilidad:** alt descriptivos ya presentes en varios `<img>`; falta revisar foco de teclado en el menú móvil, contraste del texto `sand-muted` sobre `bark`, y `aria-*` en el carrusel/galería.

---

## 7. Rendimiento (carga, imágenes, Core Web Vitals)

**Estado actual: 4 / 10.** Los tres cuellos de botella:

1. **Todo se renderiza en el cliente.** Las páginas públicas clave (`/`, `/properties`, `/properties/[id]`) son `'use client'` y cargan datos por axios tras la hidratación. Consecuencia: HTML inicial casi vacío, LCP tardío, doble trabajo (servidor manda JS, el cliente vuelve a pedir datos), y sin contenido para el bot de Google/WhatsApp.
   **Solución:** convertir el catálogo y el detalle a **Server Components** con fetch en servidor (SSR o SSG con `revalidate`). Es el cambio de mayor impacto en rendimiento **y** SEO a la vez.
2. **Imágenes sin optimizar** (`unoptimized: true` + `<img>`). Sin `next/image` no hay `srcset`, formatos modernos ni lazy-loading gestionado. Las fotos de propiedades son el peso principal de la página.
   **Solución:** usar `next/image` con dominios de Cloudinary permitidos y quitar `unoptimized`. Cloudinary ya soporta `f_auto,q_auto`; conviene aprovecharlo en las URLs.
3. **Homepage muy pesada** (1110 líneas, múltiples secciones que hacen fetch en cliente). Sin code-splitting por sección ni caché.
   **Solución:** SSR de la data crítica + `dynamic import` de lo no crítico (mapa Leaflet, galería) y skeletons (ya existen, buen punto de partida).

**Positivo:** ya hay skeleton loaders, `timeout` en axios, transformaciones `q_auto` en algunas URLs de Cloudinary, y el bundle de dependencias es razonable (sin librerías pesadas innecesarias).

---

## 8. Diseño y UX

**Estado: 7 / 10 — el punto más fuerte del proyecto.**

- **Identidad visual sólida y coherente:** paleta cálida "terra/bark/sand" bien definida en `tailwind.config.js`, tipografías display/body, animaciones sutiles (`fade-up`, `pulse-dot`) — alineado con el estándar Airbnb/Properati que se busca.
- **Navbar responsive** con menú móvil, CTA de WhatsApp siempre visible y botón "Publicar propiedad". Buena jerarquía.
- **PropertyCard** atractiva: badge de estado, área, precio destacado, hover elegante. Comunica confianza.
- **Enfoque a conversión por WhatsApp** presente en toda la app (múltiples `wa.me` con mensajes pre-armados) — correcto para el objetivo comercial.
- **Formularios cuidados:** wizard multipaso para publicar (`PropertyFormWizard` + steps), validación Zod con navegación al paso del error.

**A mejorar (UX):**
- Falta el **botón compartir** en el detalle (requisito del proyecto).
- La **búsqueda no funciona** (C-3) → frustración directa del usuario.
- Sin **estados de error visibles** cuando la API falla (solo `console.error`); el usuario ve tarjetas vacías sin explicación.
- Consistencia: mezcla de estilos inline y clases Tailwind; conviene unificar.
- Revisar **contraste** de textos tenues sobre fondo oscuro para accesibilidad/lectura en móvil a plena luz (relevante para clientes viendo el sitio en la calle).

---

## 9. Roadmap por Fases

> Cada fase es autocontenida y deja el proyecto en un estado mejor y desplegable. Sugerido implementar con Claude Code, revisando y probando al final de cada fase.

### Fase 0 — Decisiones de infraestructura (antes de tocar código)
- Elegir topología de despliegue: **(A) backend en Railway/Render + frontend en Vercel** (recomendado para salir rápido) o **(B) unificar en Next**.
- Elegir motor de base de datos definitivo (recomendado **Postgres**: Neon o Vercel Postgres).
- Crear cuentas y provisionar DB + Cloudinary de producción.

### Fase 1 — Corrección de errores críticos (bloqueantes)
Resolver C-2 (proveedor DB + migraciones), C-3 (búsqueda), C-4 (auth en endpoints sensibles), C-5 (Prisma singleton), C-6 (metadata + OG por propiedad). Objetivo: que **arranque, sea seguro y compile** contra la DB real.

### Fase 2 — Limpieza y optimización de código
Prisma singleton aplicado en todo; eliminar carpetas basura y código muerto (User/create-user si se confirma el modelo de auth único, o —mejor— **implementar auth real con la tabla User** y roles); extraer secciones del monolito `page.jsx`/`dashboard`; añadir ESLint/Prettier.

### Fase 3 — Rendimiento y renderizado
Migrar catálogo y detalle a Server Components (SSR/SSG con `revalidate`); activar `next/image` y quitar `unoptimized`; índices de base de datos; `loading/error/not-found` por segmento.

### Fase 4 — SEO técnico
`generateMetadata` por propiedad con Open Graph; corregir metadata global (Chepén/Bardales); `sitemap.xml` dinámico, `robots.txt`, `metadataBase`, canonical, favicon, imagen OG; JSON-LD `RealEstateListing`.

### Fase 5 — Seguridad y endurecimiento
Roles ADMIN/AGENT aplicados; CSP restrictiva; sanitización de emails; subida firmada a Cloudinary (o límites acordes al host); revisión de cookies (`sameSite`/`secure`) según dominio final; verificar que ningún `.env` llegue al repo (hoy: correcto, nada sensible versionado).

### Fase 6 — Pruebas (QA)
Tests de integración de la API (auth, propiedades, leads); smoke E2E de páginas públicas; auditoría Lighthouse (meta: >90 en Performance/SEO/Best Practices); prueba real de compartir un enlace de propiedad por WhatsApp.

### Fase 7 — Despliegue en Vercel
Configurar variables de entorno en Vercel y en el host del backend; `prisma migrate deploy` en el pipeline; verificar CORS/cookies entre dominios; smoke test en el dominio de producción.

### Fase 8 — Preparación para producción y crecimiento
Monitoreo (Sentry), analítica (para medir conversión de WhatsApp), backups de la DB, y documentación de "cómo agregar una propiedad" para el equipo de Bardales.

---

## 10. Calificación Final

| Dimensión | Nota /10 | Comentario |
|-----------|:--------:|------------|
| Arquitectura | 5.0 | Capas limpias, pero topología pensada para VPS, no Vercel |
| Escalabilidad | 4.0 | Sin singleton Prisma ni índices; auth de un solo usuario |
| Rendimiento | 4.0 | Todo client-side; imágenes sin optimizar |
| Diseño | 7.0 | Sólido, coherente, orientado a conversión |
| SEO | 2.0 | Metadata errónea, sin SSR, sin sitemap/schema/OG |
| Seguridad | 3.0 | Buen login, pero endpoints sensibles abiertos |
| Calidad de código | 6.0 | Prolijo en general; monolitos y código muerto |
| Experiencia de usuario | 7.0 | Fluida y WhatsApp-first; falta compartir y búsqueda rota |
| Preparación para producción | 3.0 | No compila/despliega en Vercel tal cual |

### 🎯 Calificación global: **4.3 / 10**

**Interpretación:** No es un proyecto "malo" — es un **buen MVP con cimientos aprovechables** que está a **una ronda de trabajo enfocado** (Fases 1-4) de ser una plataforma profesional lista para producción. El diseño y la UX ya juegan a favor del objetivo comercial; lo que falta es **desatascar la base técnica** (DB, seguridad, despliegue) y **hacer que las propiedades sean indexables y compartibles**, que es donde se gana o se pierde la venta.

---

## Anexo — Fortalezas a conservar (no tocar)

- Estructura de carpetas y separación routes/controllers/middleware/services del backend.
- Seguridad del **login**: bcrypt(12), JWT httpOnly, rate-limit en `/auth/login`, sin enumeración de usuarios, mensajes de error uniformes.
- Uso de **Cloudinary** para medios.
- **Validación** con Zod (frontend) y express-validator (backend), whitelist de ordenamiento y clamping de paginación.
- **Sistema de diseño** Tailwind (paleta, tipografías, animaciones) y componentes de UI pulidos.
- **Higiene de git**: no hay `node_modules` ni `.env` versionados (49 archivos limpios).

---

## Próximo paso recomendado

Revisar juntos este documento y **confirmar dos decisiones de la Fase 0**: (1) topología de despliegue —backend separado en Railway/Render, o unificación en Next— y (2) motor de base de datos —Postgres recomendado—. Con eso definido, arrancamos la **Fase 1** en Claude Code, corrigiendo los 6 problemas críticos y validando que el proyecto arranque, sea seguro y compile contra la base de datos de producción.
