@echo off
title EE-Stars Dev

echo.
echo  ╔══════════════════════════════════════╗
echo  ║      🏠 EE-Stars Iniciando...       ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 🧹 Limpiando cache frontend...
if exist frontend\.next rmdir /s /q frontend\.next

echo [1/2] Iniciando Backend...
start "EE-Stars API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 >nul

echo [2/2] Iniciando Frontend...
start "EE-Stars Web" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 6 >nul

start http://localhost:3000

echo.
echo ✅ Sistema iniciado correctamente
echo 🌐 Web:   http://localhost:3000
echo 🔐 Admin: http://localhost:3000/admin
echo.

pause