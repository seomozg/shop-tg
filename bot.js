const TelegramBot = require('node-telegram-bot-api');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token === 'YOUR_TOKEN_HERE') {
  console.error('ERROR: TELEGRAM_BOT_TOKEN is missing in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('Bot started...');

// Helper to remove directory contents
const cleanDirectory = (directory) => {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  fs.mkdirSync(directory);
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    'Привет! Я бот-сборщик.\n' +
    'Пришли мне ZIP-архив с содержимым папки public (картинки, csv и т.д.).\n' +
    'Я заменю текущие файлы, соберу проект и пришлю тебе готовый build.'
  );
});

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  const mimeType = msg.document.mime_type;

  if (mimeType !== 'application/zip' && !fileName.endsWith('.zip')) {
    return bot.sendMessage(chatId, 'Пожалуйста, пришлите ZIP архив.');
  }

  bot.sendMessage(chatId, 'Архив получен. Начинаю обработку...');

  try {
    const downloadPath = await bot.downloadFile(fileId, './');
    console.log(`Downloaded to ${downloadPath}`);

    // 1. Clean public directory
    const publicDir = path.join(__dirname, 'public');
    console.log('Cleaning public directory...');
    cleanDirectory(publicDir);

    // 2. Unzip
    console.log('Extracting archive...');
    const zip = new AdmZip(downloadPath);
    zip.extractAllTo(publicDir, true);
    
    // Handle case where user zipped the folder "public" itself, creating public/public/...
    const items = fs.readdirSync(publicDir);
    if (items.length === 1 && items[0] === 'public' && fs.statSync(path.join(publicDir, 'public')).isDirectory()) {
       const nestedPublic = path.join(publicDir, 'public');
       const nestedItems = fs.readdirSync(nestedPublic);
       nestedItems.forEach(item => {
         fs.renameSync(path.join(nestedPublic, item), path.join(publicDir, item));
       });
       fs.rmdirSync(nestedPublic);
    }

    // 3. Build
    bot.sendMessage(chatId, 'Сборка проекта (npm run build)... Это может занять время.');
    
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error}`);
        return bot.sendMessage(chatId, `Ошибка сборки:\n${error.message}`);
      }

      console.log('Build complete');

      // 4. Zip dist
      const distPath = path.join(__dirname, 'dist');
      const distZipPath = path.join(__dirname, 'dist.zip');
      const output = fs.createWriteStream(distZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Dist zip created: ${archive.pointer()} bytes`);
        bot.sendDocument(chatId, distZipPath, { caption: 'Сборка завершена!' })
           .then(() => {
              // Cleanup
              fs.unlinkSync(downloadPath);
              // Optional: fs.unlinkSync(distZipPath);
           });
      });

      archive.on('error', (err) => {
        bot.sendMessage(chatId, 'Ошибка при архивации результата.');
      });

      archive.pipe(output);
      archive.directory(distPath, false);
      archive.finalize();
    });

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `Произошла ошибка: ${err.message}`);
  }
});

