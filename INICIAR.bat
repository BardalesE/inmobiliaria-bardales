@echo off
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   🏠  EE-Stars v2.1 — Iniciando...       ║
echo  ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/4] Instalando dependencias...
call npm install
call npm install --prefix backend
call npm install --prefix frontend

echo [2/4] Preparando base de datos...
cd backend
call npx prisma generate
call npx prisma db push --force-reset
call node prisma/seed.js
cd ..

echo.
echo  ✅ Todo listo!
echo  → Web:   http://localhost:3000
echo  → Admin: http://localhost:3000/admin  (bardales2025)
echo.

start "EE-Stars API" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
start "EE-Stars Web" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 6 >nul
start http://localhost:3000
