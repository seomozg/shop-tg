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

// Хранилище последних сообщений для каждого чата (максимум 10)
const chatMessages = new Map();

// Функция для сохранения сообщения (ограничение: 10 последних)
const saveMessage = (chatId, message) => {
  if (!chatMessages.has(chatId)) {
    chatMessages.set(chatId, []);
  }
  
  const messages = chatMessages.get(chatId);
  messages.push({
    date: new Date(),
    text: message.text || message.caption || '[файл]',
    from: message.from.first_name
  });
  
  // Храним только последние 10 сообщений
  if (messages.length > 10) {
    messages.shift(); // Удаляем самое старое
  }
};

// Установка команд бота (они появятся в меню)
bot.setMyCommands([
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'help', description: 'Показать инструкцию' },
  { command: 'status', description: 'Показать статус бота' }
]).then(() => {
  console.log('✓ Bot commands set successfully');
}).catch(err => {
  console.error('Error setting bot commands:', err);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 Bot started successfully!');
console.log('📝 Commands available: /start, /help, /status');
console.log('💾 Message history limit: 10 per chat');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛑 Shutting down bot...');
  console.log(`💬 Total chats in history: ${chatMessages.size}`);
  bot.stopPolling();
  console.log('✓ Bot stopped');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
});

// Helper to remove directory contents
const cleanDirectory = (directory) => {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  fs.mkdirSync(directory);
};

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);
  
  bot.sendMessage(chatId, 
    '🤖 *Привет! Я бот-сборщик проекта*\n\n' +
    '📦 *Что я умею:*\n' +
    '1. Принимаю ZIP-архив с папкой public\n' +
    '2. Заменяю файлы в проекте\n' +
    '3. Собираю проект (npm run build)\n' +
    '4. Отправляю готовый dist.zip\n\n' +
    '📝 *Как использовать:*\n' +
    'Просто пришлите мне ZIP-архив с содержимым папки public (картинки, products.csv и т.д.)\n\n' +
    '💡 Используйте /help для подробной инструкции',
    { parse_mode: 'Markdown' }
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);
  
  bot.sendMessage(chatId,
    '📚 *Инструкция по использованию*\n\n' +
    '*Шаг 1:* Подготовьте файлы\n' +
    '• Картинки товаров (формат .webp)\n' +
    '• Файл products.csv\n' +
    '• Другие файлы из папки public\n\n' +
    '*Шаг 2:* Создайте ZIP-архив\n' +
    '• Упакуйте все файлы в ZIP\n' +
    '• Можно использовать структуру папок\n\n' +
    '*Шаг 3:* Отправьте архив боту\n' +
    '• Я автоматически обработаю его\n' +
    '• Соберу проект\n' +
    '• Пришлю готовый dist.zip\n\n' +
    '*Шаг 4:* Загрузите на сервер\n' +
    '• Распакуйте dist.zip\n' +
    '• Загрузите содержимое в public_html\n' +
    '• Не забудьте файл .htaccess!\n\n' +
    '⏱ Процесс сборки занимает 1-3 минуты\n\n' +
    '💬 *Доступные команды:*\n' +
    '/start - Начать работу\n' +
    '/help - Показать эту инструкцию\n' +
    '/status - Статус бота',
    { parse_mode: 'Markdown' }
  );
});

// Команда /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);
  
  const userMessages = chatMessages.get(chatId) || [];
  const messageCount = userMessages.length;
  
  bot.sendMessage(chatId,
    '📊 *Статус бота*\n\n' +
    `✅ Бот работает нормально\n` +
    `💬 Сообщений в истории: ${messageCount}/10\n` +
    `🕐 Время сервера: ${new Date().toLocaleString('ru-RU')}\n\n` +
    `👤 Ваш ID: \`${chatId}\`\n` +
    `👋 Имя: ${msg.from.first_name}`,
    { parse_mode: 'Markdown' }
  );
});

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const fileName = msg.document.file_name;
  const mimeType = msg.document.mime_type;
  
  // Сохраняем сообщение с документом
  saveMessage(chatId, msg);

  if (mimeType !== 'application/zip' && !fileName.endsWith('.zip')) {
    return bot.sendMessage(chatId, '❌ Пожалуйста, пришлите ZIP архив.');
  }

  bot.sendMessage(chatId, '📦 Архив получен. Начинаю обработку...');

  try {
    // Скачивание файла
    console.log(`[${chatId}] Downloading file: ${fileName}`);
    bot.sendMessage(chatId, '⬇️ Загружаю архив...');
    
    const downloadPath = await bot.downloadFile(fileId, './');
    const fileSizeMB = (fs.statSync(downloadPath).size / 1024 / 1024).toFixed(2);
    console.log(`[${chatId}] Downloaded to ${downloadPath} (${fileSizeMB} MB)`);

    // 1. Clean public directory
    bot.sendMessage(chatId, '🧹 Очищаю старые файлы...');
    const publicDir = path.join(__dirname, 'public');
    console.log(`[${chatId}] Cleaning public directory...`);
    cleanDirectory(publicDir);

    // 2. Unzip
    bot.sendMessage(chatId, '📂 Распаковываю архив...');
    console.log(`[${chatId}] Extracting archive...`);
    const zip = new AdmZip(downloadPath);
    zip.extractAllTo(publicDir, true);
    
    // Handle case where user zipped the folder "public" itself, creating public/public/...
    const items = fs.readdirSync(publicDir);
    if (items.length === 1 && items[0] === 'public' && fs.statSync(path.join(publicDir, 'public')).isDirectory()) {
       console.log(`[${chatId}] Detected nested 'public' folder, flattening...`);
       const nestedPublic = path.join(publicDir, 'public');
       const nestedItems = fs.readdirSync(nestedPublic);
       nestedItems.forEach(item => {
         fs.renameSync(path.join(nestedPublic, item), path.join(publicDir, item));
       });
       fs.rmdirSync(nestedPublic);
    }
    
    const fileCount = items.length;
    console.log(`[${chatId}] Extracted ${fileCount} items`);

    // 3. Build
    bot.sendMessage(chatId, '🔨 Сборка проекта (npm run build)...\n⏱ Это может занять 1-3 минуты.');
    
    const buildStartTime = Date.now();
    console.log(`[${chatId}] Starting build...`);
    
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error(`[${chatId}] Build error:`, error);
        return bot.sendMessage(chatId, 
          `❌ *Ошибка сборки:*\n\n\`\`\`\n${error.message}\n\`\`\`\n\n` +
          '💡 Возможные причины:\n' +
          '• Отсутствуют зависимости (npm install)\n' +
          '• Ошибка в файлах проекта\n' +
          '• Недостаточно памяти',
          { parse_mode: 'Markdown' }
        );
      }

      const buildTime = ((Date.now() - buildStartTime) / 1000).toFixed(1);
      console.log(`[${chatId}] Build complete in ${buildTime}s`);
      
      bot.sendMessage(chatId, `✅ Сборка завершена за ${buildTime}с\n📦 Создаю архив...`);

      // 4. Zip dist
      const distPath = path.join(__dirname, 'dist');
      const distZipPath = path.join(__dirname, 'dist.zip');
      
      console.log(`[${chatId}] Creating archive...`);
      
      const output = fs.createWriteStream(distZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        const totalTime = ((Date.now() - buildStartTime) / 1000).toFixed(1);
        
        console.log(`[${chatId}] Archive created: ${archive.pointer()} bytes (${sizeInMB} MB)`);
        console.log(`[${chatId}] Total processing time: ${totalTime}s`);
        console.log(`[${chatId}] Sending archive to user...`);
        
        bot.sendDocument(chatId, distZipPath, { 
          caption: 
            '🎉 *Сборка завершена!*\n\n' +
            `📦 Размер архива: ${sizeInMB} MB\n` +
            `⏱ Время обработки: ${totalTime}с\n\n` +
            '📋 *Следующие шаги:*\n' +
            '1️⃣ Распакуйте dist.zip\n' +
            '2️⃣ Загрузите содержимое в public_html\n' +
            '3️⃣ Проверьте наличие .htaccess\n\n' +
            '⚠️ *Важно:* Загружайте файлы из папки dist, а не саму папку!\n\n' +
            '💡 Подробная инструкция: ПАМЯТКА-ЗАГРУЗКА.txt',
          parse_mode: 'Markdown'
        })
        .then(() => {
          console.log(`[${chatId}] ✓ Archive sent successfully`);
          // Cleanup
          fs.unlinkSync(downloadPath);
          console.log(`[${chatId}] ✓ Cleaned up: ${downloadPath}`);
          console.log(`[${chatId}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          // Optional: fs.unlinkSync(distZipPath);
        })
        .catch(err => {
          console.error(`[${chatId}] Error sending document:`, err);
          bot.sendMessage(chatId, '❌ Ошибка при отправке архива. Попробуйте еще раз.');
        });
      });

      archive.on('error', (err) => {
        console.error(`[${chatId}] Archive error:`, err);
        bot.sendMessage(chatId, '❌ Ошибка при архивации результата.');
      });
      
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn(`[${chatId}] Archive warning:`, err);
        } else {
          throw err;
        }
      });

      archive.pipe(output);
      
      // Архивируем содержимое dist, исключая .sh и .bat файлы
      archive.glob('**/*', {
        cwd: distPath,
        ignore: ['**/*.sh', '**/*.bat']
      });
      
      console.log(`[${chatId}] Finalizing archive...`);
      archive.finalize();
    });

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 
      `❌ *Произошла ошибка:*\n\n\`\`\`\n${err.message}\n\`\`\`\n\n` +
      '💡 Попробуйте:\n' +
      '• Проверить архив\n' +
      '• Отправить файл заново\n' +
      '• Использовать /help',
      { parse_mode: 'Markdown' }
    );
  }
});

// Обработка обычных текстовых сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // Игнорируем команды и документы (они обрабатываются отдельно)
  if (msg.text && !msg.text.startsWith('/') && !msg.document) {
    saveMessage(chatId, msg);
    
    bot.sendMessage(chatId,
      '🤔 Я понимаю только ZIP-архивы с файлами проекта.\n\n' +
      '📝 Используйте:\n' +
      '/start - Начать работу\n' +
      '/help - Инструкция\n' +
      '/status - Статус бота\n\n' +
      '📦 Или просто отправьте ZIP-архив'
    );
  }
});

