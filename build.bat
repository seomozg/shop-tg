@echo off
echo ========================================
echo Сборка проекта для выкладки на сервер
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
echo Сборка проекта...
call npm run build
if errorlevel 1 (
    echo Ошибка при сборке проекта!
    pause
    exit /b 1
)

echo.
echo Создание архива...
if exist "dist.zip" (
    del /F /Q "dist.zip"
)

echo Копирование .htaccess...
if exist ".htaccess" (
    copy /Y ".htaccess" "dist\.htaccess" >nul
    echo ✓ .htaccess скопирован в dist
) else (
    echo ⚠ .htaccess не найден, продолжаем без него
)

powershell -Command "Compress-Archive -Path dist\* -DestinationPath dist.zip -Force"

if errorlevel 1 (
    echo Ошибка при создании архива!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Готово! Архив создан: dist.zip
echo ========================================
echo Архив находится в папке проекта
echo.
pause

