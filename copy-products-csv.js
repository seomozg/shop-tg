const fs = require('fs');
const path = require('path');

// Путь к исходному файлу в public
const sourcePath = path.join(__dirname, 'public', 'products.csv');

// Путь к папке assets в dist
const destDir = path.join(__dirname, 'dist', 'assets');
const destPath = path.join(destDir, 'products.csv');

// Путь к файлу в корне dist (если Vite скопировал его туда)
const sourceInDist = path.join(__dirname, 'dist', 'products.csv');

// Проверяем, существует ли исходный файл в public
if (!fs.existsSync(sourcePath)) {
  console.log('⚠ products.csv not found in public/ directory');
  process.exit(0);
}

// Создаем папку assets, если её нет
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  // Копируем файл из public напрямую в dist/assets
  fs.copyFileSync(sourcePath, destPath);
  console.log('✓ products.csv copied to dist/assets/');
  
  // Удаляем из корня dist, если Vite скопировал его туда
  if (fs.existsSync(sourceInDist)) {
    fs.unlinkSync(sourceInDist);
    console.log('✓ products.csv removed from dist root');
  }
} catch (err) {
  console.error('Error copying products.csv:', err);
  process.exit(1);
}

