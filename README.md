# 🏠 EE-Stars — Inmobiliaria Digital Peruana

## INICIAR EN WINDOWS (1 doble clic)
```
Doble clic en → INICIAR.bat
```
Eso es todo. Abre el navegador solo.

## INICIAR EN MAC / LINUX
```bash
chmod +x iniciar.sh && ./iniciar.sh
```

---

## ¿Qué necesitas tener instalado?
- **Node.js** versión 18 o mayor → https://nodejs.org (descarga "LTS")
- Nada más. La base de datos se crea sola (SQLite).

---

## URLs del proyecto
| Página | URL |
|--------|-----|
| Inicio (propiedades) | http://localhost:3000 |
| Publicar propiedad | http://localhost:3000/publicar |
| Panel admin | http://localhost:3000/admin |
| API backend | http://localhost:4000/api/health |

## Contraseña del admin
```
bardales2025
```

---

## Recibir alertas por email (opcional)
Edita el archivo `backend/.env` y completa:
```
NOTIFY_EMAIL_FROM=tuemail@gmail.com
NOTIFY_EMAIL_PASS=xxxx xxxx xxxx xxxx   ← App Password de Gmail
NOTIFY_EMAIL_TO=elianbardales@gmail.com
NEXT_PUBLIC_WHATSAPP=51987654321        ← Tu número real
```

Para el App Password:
1. myaccount.google.com → Seguridad
2. Verificación en 2 pasos → activar
3. Contraseñas de aplicaciones → crear para "EE-Stars"
4. Copiar las 16 letras

---

## Estructura del proyecto
```
ee-stars/
├── INICIAR.bat          ← Doble clic para Windows
├── iniciar.sh           ← Mac/Linux
├── backend/             ← API Express + SQLite
│   ├── prisma/          ← Base de datos
│   └── src/             ← Código del servidor
└── frontend/            ← Next.js (la web)
    └── src/app/         ← Páginas
```
