@echo off
chcp 65001 > nul
title AI Omni Hub (Claude, DeepSeek, Gemini)

echo ========================================================
echo    🚀 Запуск AI Omni Hub (Приложение для Windows)
echo    Нейросети: Claude 3.7 / DeepSeek R1 / Gemini 2.0
echo    🇷🇺 Работает в РФ без VPN
echo ========================================================
echo.

cd /d "%~dp0"

:: Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден в системе. Установите Node.js с https://nodejs.org/
    pause
    exit /b
)

:: Запуск сервера в отдельном фоновом процессе
echo [*] Запуск сервера API на порту 3001...
start /b "" node server/server.js

:: Ожидание старта сервера
timeout /t 2 /nobreak > nul

:: Открытие в режиме отдельного оконного приложения (Edge App mode)
echo [*] Запуск оконного приложения...
start msedge --app=http://localhost:3001

if %errorlevel% neq 0 (
    :: Если Edge недоступен, открываем Chrome
    start chrome --app=http://localhost:3001
)

echo [*] Приложение готово к работе!
echo [*] Не закрывайте это окно, пока пользуетесь приложением.
echo.
pause
