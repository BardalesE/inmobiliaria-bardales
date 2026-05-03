#!/bin/bash
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   🏠  EE-Stars — Iniciando proyecto...   ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "[1/4] Instalando dependencias del sistema..."
npm install

echo "[2/4] Instalando dependencias del backend..."
npm install --prefix backend

echo "[3/4] Instalando dependencias del frontend..."
npm install --prefix frontend

echo "[4/4] Preparando base de datos..."
cd backend
npx prisma generate
npx prisma db push
node prisma/seed.js
cd ..

echo ""
echo "  ✅ Todo listo!"
echo "  → Web:   http://localhost:3000"
echo "  → Admin: http://localhost:3000/admin"
echo "  → API:   http://localhost:4000/api/health"
echo ""

# Abrir dos terminales y levantar ambos servidores
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"' 2>/dev/null || \
  (cd backend && npm run dev &)

sleep 3

osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"' 2>/dev/null || \
  (cd frontend && npm run dev &)

sleep 5
open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null
