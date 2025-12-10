const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const distPath = path.join(__dirname, 'dist');
const distZipPath = path.join(__dirname, 'dist.zip');

// Удаляем старый архив если существует
if (fs.existsSync(distZipPath)) {
  fs.unlinkSync(distZipPath);
}

const output = fs.createWriteStream(distZipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const sizeInBytes = archive.pointer();
  const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
  console.log(`✓ Archive created: dist.zip (${sizeInMB} MB)`);
});

archive.on('error', (err) => {
  console.error('Archive error:', err);
  process.exit(1);
});

archive.pipe(output);

// Архивируем саму папку dist целиком (с её именем)
archive.directory(distPath, 'dist');

archive.finalize();

