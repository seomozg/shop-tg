const fs = require('fs');
const path = require('path');

// Путь к исходному файлу в public
const sourcePath = path.join(__dirname, 'public', 'products.csv');

// Путь к файлу в корне dist
const destPath = path.join(__dirname, 'dist', 'products.csv');

// Проверяем, существует ли исходный файл в public
if (!fs.existsSync(sourcePath)) {
  process.exit(0);
}

try {
  // Копируем файл из public напрямую в корень dist
  fs.copyFileSync(sourcePath, destPath);
} catch (err) {
  console.error('Error copying products.csv:', err);
  process.exit(1);
}

