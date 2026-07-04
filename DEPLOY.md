# EE-Stars — Guía de despliegue en VPS Ubuntu

**Requisitos del VPS:** Ubuntu 22.04 LTS, 1 vCPU, 1 GB RAM mínimo (2 GB recomendado), dominio apuntando al VPS.

---

## 1. Preparación del servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar utilidades
sudo apt install -y curl git ufw
```

### Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 2. Instalar Node.js 20 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # debe mostrar v20.x.x
```

---

## 3. Instalar MySQL 8

```bash
sudo apt install -y mysql-server

# Iniciar y habilitar el servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Asistente de seguridad (establece contraseña root, etc.)
sudo mysql_secure_installation
```

### Crear base de datos y usuario para la app
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE eestars_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eestars_user'@'localhost' IDENTIFIED BY 'clave_muy_segura_aqui';
GRANT ALL PRIVILEGES ON eestars_prod.* TO 'eestars_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 5. Instalar PM2

```bash
sudo npm install -g pm2
```

---

## 6. Subir el proyecto

```bash
# Opción A: clonar desde git
cd /var/www
sudo git clone https://github.com/tu-usuario/ee-stars.git ee-stars
sudo chown -R $USER:$USER /var/www/ee-stars

# Opción B: subir con scp desde Windows
# scp -r C:\laragon\www\ee-stars-final usuario@ip:/var/www/ee-stars
```

---

## 7. Configurar el Backend

```bash
cd /var/www/ee-stars/backend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env
nano .env
```

**Contenido de `/var/www/ee-stars/backend/.env`:**
```env
DATABASE_URL="mysql://eestars_user:clave_muy_segura_aqui@localhost:3306/eestars_prod"
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
SAME_DOMAIN=true

JWT_SECRET=genera_uno_con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN=8h

NOTIFY_EMAIL_FROM=tu_correo@gmail.com
NOTIFY_EMAIL_PASS=xxxx xxxx xxxx xxxx
NOTIFY_EMAIL_TO=notificaciones@gmail.com
WHATSAPP_NUMBER=51987654321

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Credenciales del admin (login por .env)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$...hash_bcrypt_aqui...
```

**Generar hash de contraseña:**
```bash
node -e "require('bcryptjs').hash('tu_nueva_password', 12).then(h => console.log(h))"
```

### Crear tablas y datos iniciales

```bash
# Las migraciones SQLite antiguas no sirven para MySQL.
# Elimina la carpeta de migraciones y crea una nueva desde cero:
rm -rf prisma/migrations
npx prisma migrate dev --name init

# Poblar con datos de ejemplo + usuario admin
npm run db:seed
```

### Crear cuenta para tu socia
```bash
npm run user:create
# Ingresa: nombre, email, contraseña, rol AGENT
```

---

## 8. Configurar el Frontend

```bash
cd /var/www/ee-stars/frontend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env.local
nano .env.local
```

**Contenido de `/var/www/ee-stars/frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://tudominio.com/api
NEXT_PUBLIC_WHATSAPP=51987654321
```

```bash
# Compilar para producción
npm run build
```

---

## 9. Configurar PM2

```bash
cat > /var/www/ee-stars/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ee-stars-api',
      cwd: '/var/www/ee-stars/backend',
      script: 'src/server.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'ee-stars-web',
      cwd: '/var/www/ee-stars/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
}
EOF
```

```bash
pm2 start /var/www/ee-stars/ecosystem.config.js
pm2 save
pm2 startup   # ejecuta el comando que te muestre
```

**Comandos útiles de PM2:**
```bash
pm2 list                    # ver procesos
pm2 logs ee-stars-api       # ver logs del backend
pm2 logs ee-stars-web       # ver logs del frontend
pm2 restart ee-stars-api    # reiniciar backend
pm2 reload ee-stars-web     # reiniciar frontend sin downtime
```

---

## 10. Configurar Nginx como reverse proxy

```bash
sudo nano /etc/nginx/sites-available/ee-stars
```

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Frontend (Next.js en puerto 3000)
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Express en puerto 4000)
    location /api/ {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        # Subidas grandes (videos)
        client_max_body_size 210m;
    }

    # Assets estáticos de Next.js
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ee-stars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. Certificado SSL con Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Verificar renovación automática:
sudo certbot renew --dry-run
```

---

## 12. Actualizaciones futuras

```bash
cd /var/www/ee-stars

git pull origin main

# Backend
cd backend && npm install
npx prisma migrate deploy
pm2 restart ee-stars-api

# Frontend
cd ../frontend && npm install
npm run build
pm2 reload ee-stars-web
```

---

## Resumen de puertos y URLs

| Servicio  | Puerto interno | URL pública               |
|-----------|----------------|---------------------------|
| Frontend  | 3000           | https://tudominio.com/    |
| Backend   | 4000           | https://tudominio.com/api |
| MySQL     | 3306           | solo interno (no exponer) |

---

## Checklist pre-lanzamiento

- [ ] `NODE_ENV=production` en backend `.env`
- [ ] `SAME_DOMAIN=true` en backend `.env`
- [ ] JWT_SECRET único y largo (mín. 64 bytes hex)
- [ ] ADMIN_PASSWORD_HASH actualizado (nueva contraseña fuerte)
- [ ] HTTPS funcionando (Certbot)
- [ ] `npm run build` exitoso en frontend
- [ ] `pm2 list` muestra ambos procesos `online`
- [ ] Visitar https://tudominio.com/api/health → `{"status":"OK"}`
- [ ] Login en https://tudominio.com/admin funciona
- [ ] Crear cuenta para tu socia: `npm run user:create`
