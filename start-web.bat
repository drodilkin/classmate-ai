@echo off
chcp 65001 > nul
title AI Omni Hub (Web)

echo ========================================================
echo    🌐 Запуск AI Omni Hub в браузере
echo    Сайт: http://localhost:3001
echo    🇷🇺 Работает в РФ без VPN
echo ========================================================
echo.

cd /d "%~dp0"

echo [*] Запуск сервера...
start "" http://localhost:3001
node server/server.js
