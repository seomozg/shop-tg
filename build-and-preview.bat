@echo off
echo ========================================
echo Сборка проекта и запуск предпросмотра...
echo ========================================
echo.

echo Установка зависимостей...
call npm install
if errorlevel 1 (
    echo Ошибка при установке зависимостей!
    pause
    exit /b 1
)

echo.
echo Сборка проекта и запуск предпросмотра...
call npm run build:preview

pause

