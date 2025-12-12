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

// Хранилище состояний чатов
const chatStates = new Map();

// Функция для сохранения сообщения (ограничение: 10 последних)
const saveMessage = (chatId, message) => {
  if (!chatMessages.has(chatId)) {
    chatMessages.set(chatId, []);
  }

  const messages = chatMessages.get(chatId);
  messages.push({
    date: new Date(),
    text: message.text || message.caption || '[файл]',
    from:
      message.from?.first_name ||
      message.sender_chat?.title ||
      'unknown'
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
  { command: 'status', description: 'Показать статус бота' },
  { command: 'history', description: 'Показать историю сообщений (последние 10)' },
  { command: 'getfile', description: 'Получить последний dist.zip' },
  { command: 'debug', description: 'Диагностика проблем' }
]).catch(err => {
  console.error('Error setting bot commands:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0);
});

// Helper to remove directory contents
const cleanDirectory = (directory) => {
  if (fs.existsSync(directory)) {
    if (fs.rmSync) {
      fs.rmSync(directory, { recursive: true, force: true });
    } else {
      fs.rmdirSync(directory, { recursive: true });
    }
  }
  fs.mkdirSync(directory, { recursive: true });
};

// Функция для отправки файла
async function sendFile(chatId, filePath, totalSizeMB, totalTime) {
  try {
    return bot.sendDocument(chatId, filePath, {
      caption:
        '🎉 Сборка завершена!\n\n' +
        `📦 Размер архива: ${totalSizeMB} MB\n` +
        `⏱ Время обработки: ${totalTime}с\n\n` +
        '📋 Следующие шаги:\n' +
        '1️⃣ Распакуйте dist.zip\n' +
        '2️⃣ Загрузите содержимое в public_html\n' +
        '3️⃣ Проверьте наличие .htaccess\n\n',
      disable_notification: false
    });
  } catch (err) {
    console.error(`[${chatId}] Error sending file:`, err);
    throw err;
  }
}

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
    '/status - Статус бота\n' +
    '/history - История сообщений (последние 10)\n' +
    '/getfile - Получить последний dist.zip\n' +
    '/debug - Диагностика проблем',
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

// Команда /history - показать историю сообщений
bot.onText(/\/history/, (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);

  const userMessages = chatMessages.get(chatId) || [];
  const messageCount = userMessages.length;

  if (messageCount === 0) {
    return bot.sendMessage(chatId,
      '📜 *История сообщений*\n\n' +
      'История пуста. Отправьте сообщение или команду, чтобы начать историю.',
      { parse_mode: 'Markdown' }
    );
  }

  // Формируем список сообщений (последние 10)
  let historyText = `📜 *История сообщений (последние ${messageCount} из 10)*\n\n`;
  
  // Функция для экранирования спецсимволов Markdown
  const escapeMarkdown = (text) => {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  };
  
  userMessages.forEach((msgData, index) => {
    const time = msgData.date.toLocaleString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
    const text = msgData.text.length > 50 
      ? msgData.text.substring(0, 50) + '...' 
      : msgData.text;
    
    const safeText = escapeMarkdown(text);
    const safeFrom = escapeMarkdown(msgData.from);
    
    historyText += `${index + 1}. *${time}* - ${safeFrom}\n`;
    historyText += `   \`${safeText}\`\n\n`;
  });

  historyText += '💡 История хранит только последние 10 сообщений';

  bot.sendMessage(chatId, historyText, { parse_mode: 'Markdown' });
});

// Команда /getfile - получить последний dist.zip (с учётом лимита Telegram и разбиением)
bot.onText(/\/getfile/, async (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);

  const distZipPath = path.join(__dirname, 'dist.zip');

  if (!fs.existsSync(distZipPath)) {
    return bot.sendMessage(chatId,
      '❌ *Файл dist.zip не найден*\n\n' +
      'Сначала отправьте архив с файлами для сборки проекта.',
      { parse_mode: 'Markdown' }
    );
  }

  const stats = fs.statSync(distZipPath);
  const sizeInBytes = stats.size;
  const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
  const modifiedDate = new Date(stats.mtime).toLocaleString('ru-RU');

  const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB лимит Telegram

  if (sizeInBytes > maxSizeInBytes) {
    return bot.sendMessage(chatId,
      '❌ *Файл слишком большой для отправки через Telegram*\n\n' +
      `📦 Размер: ${sizeInMB} MB\n` +
      `⚠️ Лимит Telegram: 50 MB\n\n` +
      'Файл находится на сервере как `dist.zip`.\n' +
      'Попросите администратора забрать его напрямую.',
      { parse_mode: 'Markdown' }
    );
  }

  await bot.sendMessage(chatId,
    `📦 *Отправляю последний собранный архив*\n\n` +
    `📊 Размер: ${sizeInMB} MB\n` +
    `🕐 Создан: ${modifiedDate}\n\n` +
    `Если потребуется, отправлю архив по частям.`,
    { parse_mode: 'Markdown' }
  );

  const totalTime = '-'; // Для /getfile не знаем время сборки

  try {
    await sendFile(chatId, distZipPath, sizeInMB, totalTime);
  } catch (err) {
    console.error(`[${chatId}] Error sending dist.zip via /getfile:`, err);
    bot.sendMessage(chatId,
      '❌ Не удалось отправить архив через /getfile.\n' +
      'Попробуйте позже или обратитесь к администратору.');
  }
});

// Команда /debug
bot.onText(/\/debug/, (msg) => {
  const chatId = msg.chat.id;
  saveMessage(chatId, msg);

  // Проверяем наличие dist.zip
  const distZipPath = path.join(__dirname, 'dist.zip');
  const distExists = fs.existsSync(distZipPath);
  let distSize = 'Не найден';
  let distDate = '';

  if (distExists) {
    const stats = fs.statSync(distZipPath);
    distSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
    distDate = new Date(stats.mtime).toLocaleString('ru-RU');
  }

  // Проверяем папку dist
  const distPath = path.join(__dirname, 'dist');
  const distDirExists = fs.existsSync(distPath);

  // Проверяем папку public
  const publicPath = path.join(__dirname, 'public');
  const publicDirExists = fs.existsSync(publicPath);
  let publicFiles = 0;
  if (publicDirExists) {
    publicFiles = fs.readdirSync(publicPath).length;
  }

  bot.sendMessage(chatId,
    '🔍 *Диагностика*\n\n' +
    '*Файловая система:*\n' +
    `📦 dist.zip: ${distExists ? '✅ ' + distSize : '❌ Не найден'}\n` +
    (distExists ? `   🕐 ${distDate}\n` : '') +
    `📁 dist/: ${distDirExists ? '✅ Существует' : '❌ Не найдена'}\n` +
    `📁 public/: ${publicDirExists ? '✅ ' + publicFiles + ' файлов' : '❌ Не найдена'}\n\n` +
    '*Лимиты Telegram:*\n' +
    '📤 Максимальный размер: 50 MB\n' +
    '⏱ Таймаут отправки: 60 секунд\n\n' +
    '*Возможные проблемы:*\n' +
    '• Архив > 50 MB\n' +
    '• Медленное соединение\n' +
    '• Недостаточно прав на файлы\n\n' +
    (distExists ? '💡 Используйте /getfile чтобы получить файл\n' : '') +
    '📖 Используйте /help для инструкции',
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

  // Проверяем только расширение: у Telegram mimeType может быть разным
  if (!fileName.toLowerCase().endsWith('.zip')) {
    return bot.sendMessage(chatId, '❌ Пожалуйста, пришлите ZIP-архив (.zip).');
  }

  // Сразу начинаем обработку архива
  processArchive(chatId, fileId, fileName);
});

// Функция обработки архива
async function processArchive(chatId, fileId, fileName) {
  bot.sendMessage(chatId, '📦 Начинаю обработку архива...');

  try {
    // Скачивание файла
    bot.sendMessage(chatId, '⬇️ Загружаю архив...');

    const downloadPath = await bot.downloadFile(fileId, './');

    // 1. Clean public directory
    bot.sendMessage(chatId, '🧹 Очищаю старые файлы...');
    const publicDir = path.join(__dirname, 'public');
    cleanDirectory(publicDir);

    // 2. Unzip
    bot.sendMessage(chatId, '📂 Распаковываю архив...');
    const zip = new AdmZip(downloadPath);
    zip.extractAllTo(publicDir, true);

    // Handle case where user zipped the folder "public" itself, creating public/public/...
    const items = fs.readdirSync(publicDir);
    if (
      items.length === 1 &&
      items[0] === 'public' &&
      fs.statSync(path.join(publicDir, 'public')).isDirectory()
    ) {
      const nestedPublic = path.join(publicDir, 'public');
      const nestedItems = fs.readdirSync(nestedPublic);
      nestedItems.forEach(item => {
        fs.renameSync(path.join(nestedPublic, item), path.join(publicDir, item));
      });
      fs.rmdirSync(nestedPublic);
    }

    // 3. Build
    bot.sendMessage(chatId, '🔨 Сборка проекта (npm run build)...\n⏱ Это может занять 1-3 минуты.');

    const buildStartTime = Date.now();

    // Увеличиваем лимит памяти для процесса сборки
    // Можно настроить через переменную окружения BUILD_MEMORY_LIMIT (в MB)
    // По умолчанию используем максимум: 16GB (16384 MB)
    const memoryLimit = process.env.BUILD_MEMORY_LIMIT || '16384'; // По умолчанию 16GB
    
    const buildCommand = process.platform === 'win32' 
      ? `set NODE_OPTIONS=--max-old-space-size=${memoryLimit} && npm run build`
      : `NODE_OPTIONS=--max-old-space-size=${memoryLimit} npm run build`;

    exec(buildCommand, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (stderr) console.error(stderr);

      if (error) {
        console.error(`[${chatId}] Build error:`, error);
        
        // Специальная обработка ошибки нехватки памяти (код 137)
        let errorMessage = error.message;
        let suggestions = '💡 *Возможные причины:*\n';
        
        if (error.code === 137 || error.signal === 'SIGKILL' || error.killed) {
          errorMessage = 'Процесс сборки был прерван из-за нехватки памяти (OOM)';
          const memoryLimitGB = (parseInt(memoryLimit) / 1024).toFixed(1);
          suggestions += 
            '⚠️ *Недостаточно памяти на сервере*\n\n' +
            `📊 Текущий лимит: ${memoryLimitGB} GB\n\n` +
            '💡 *Быстрые решения:*\n' +
            '1️⃣ Уменьшите размер изображений (используйте WebP)\n' +
            '2️⃣ Уменьшите количество файлов в архиве\n' +
            '3️⃣ Удалите неиспользуемые изображения\n\n' +
            '⚙️ *Увеличить лимит памяти:*\n' +
            'Создайте файл `.env` и добавьте:\n' +
            '`BUILD_MEMORY_LIMIT=20480` (20 GB)\n' +
            'или `BUILD_MEMORY_LIMIT=32768` (32 GB)\n\n' +
            '📖 Подробная инструкция: см. файл `MEMORY-FIX.md`';
        } else {
          suggestions += 
            '• Отсутствуют зависимости (npm install)\n' +
            '• Ошибка в файлах проекта\n' +
            '• Недостаточно памяти\n' +
            '• Проверьте логи выше для деталей';
        }
        
        return bot.sendMessage(chatId,
          `❌ *Ошибка сборки:*\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n` +
          suggestions,
          { parse_mode: 'Markdown' }
        );
      }

      const buildTime = ((Date.now() - buildStartTime) / 1000).toFixed(1);

      bot.sendMessage(chatId, `✅ Сборка завершена за ${buildTime}с\n📦 Создаю архив...`);

      // 4. Zip dist
      const distPath = path.join(__dirname, 'dist');
      const distZipPath = path.join(__dirname, 'dist.zip');

      const output = fs.createWriteStream(distZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', async () => {
        const sizeInBytes = archive.pointer();
        const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
        const totalTime = ((Date.now() - buildStartTime) / 1000).toFixed(1);

        // Проверка размера файла (лимит Telegram: 50 MB)
        const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB

        if (sizeInBytes > maxSizeInBytes) {
          console.error(`[${chatId}] File too large: ${sizeInMB} MB (limit: 50 MB)`);
          bot.sendMessage(chatId,
            '❌ *Архив слишком большой!*\n\n' +
            `📦 Размер: ${sizeInMB} MB\n` +
            `⚠️ Лимит Telegram: 50 MB\n\n` +
            '💡 *Решение:*\n' +
            `Архив сохранен локально: \`${distZipPath}\`\n\n` +
            'Возьмите файл напрямую с сервера или сожмите изображения.',
            { parse_mode: 'Markdown' }
          );
          // Cleanup
          fs.unlinkSync(downloadPath);
          return;
        }

        // Небольшая задержка, чтобы убедиться, что файл полностью записан на диск
        await new Promise(resolve => setTimeout(resolve, 500));

        // Проверяем, что файл существует и читаем
        if (!fs.existsSync(distZipPath)) {
          console.error(`[${chatId}] Archive file not found: ${distZipPath}`);
          bot.sendMessage(chatId, '❌ Архив не найден. Попробуйте еще раз.');
          return;
        }

        // Проверяем реальный размер файла на диске
        const actualFileStats = fs.statSync(distZipPath);
        const actualSizeInBytes = actualFileStats.size;
        const actualSizeInMB = (actualSizeInBytes / 1024 / 1024).toFixed(2);

        // Проверяем, что файл не пустой
        if (actualSizeInBytes === 0) {
          console.error(`[${chatId}] Archive file is empty: ${distZipPath}`);
          bot.sendMessage(chatId, '❌ Архив пустой. Попробуйте еще раз.');
          return;
        }

        // Отправляем файл
        sendFile(chatId, distZipPath, actualSizeInMB, totalTime)
          .then(() => {
            // Cleanup
            try {
              fs.unlinkSync(downloadPath);
            } catch (cleanupErr) {
              console.warn(`[${chatId}] Cleanup warning:`, cleanupErr.message);
            }
            // Очищаем состояние
            chatStates.delete(chatId);
          })
          .catch(err => {
            console.error(`[${chatId}] ━━━━━━ ERROR SENDING DOCUMENT ━━━━━━`);
            console.error(`[${chatId}] File path: ${distZipPath}`);
            console.error(`[${chatId}] File exists: ${fs.existsSync(distZipPath)}`);
            console.error(`[${chatId}] File size: ${actualSizeInMB} MB`);
            console.error(`[${chatId}] Error message:`, err.message);
            console.error(`[${chatId}] Error code:`, err.code);
            console.error(`[${chatId}] Error stack:`, err.stack);

            // Логируем тело ответа от Telegram API
            if (err.response && err.response.body) {
              console.error(
                `[${chatId}] Telegram API response body:`,
                JSON.stringify(err.response.body, null, 2)
              );
            }

            // Логируем полный объект ошибки для диагностики
            console.error(
              `[${chatId}] Full error object:`,
              JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
            );
            console.error(`[${chatId}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            // Определяем причину ошибки
            let errorReason = err.message;
            let suggestions = '';

            if (err.response && err.response.body) {
              const telegramError = err.response.body;
              if (telegramError.description) {
                errorReason = telegramError.description;
              }

              if (
                errorReason.includes('Request Entity Too Large') ||
                errorReason.includes('file is too big') ||
                errorReason.includes('413')
              ) {
                suggestions =
                  '• Файл превышает лимит Telegram (50 MB)\n' +
                  '• Текущий размер: ' +
                  actualSizeInMB +
                  ' MB\n' +
                  '• Попробуйте уменьшить размер изображений\n' +
                  '• Используйте формат .webp для изображений';
              } else if (
                errorReason.includes('Wrong file identifier') ||
                errorReason.includes('file not found') ||
                errorReason.includes('400')
              ) {
                suggestions =
                  '• Проблема с файлом на диске\n' +
                  '• Файл может быть поврежден\n' +
                  '• Попробуйте отправить архив еще раз';
              } else if (
                errorReason.includes('ETELEGRAM') ||
                errorReason.includes('timeout') ||
                errorReason.includes('504')
              ) {
                suggestions =
                  '• Таймаут при отправке (файл слишком большой или медленное соединение)\n' +
                  '• Попробуйте через несколько минут\n' +
                  '• Проверьте интернет-соединение';
              } else if (errorReason.includes('429') || errorReason.includes('rate limit')) {
                suggestions =
                  '• Превышен лимит запросов к Telegram API\n' +
                  '• Подождите несколько минут и попробуйте снова';
              } else {
                suggestions =
                  '• Проверьте интернет-соединение\n' +
                  '• Попробуйте отправить архив еще раз\n' +
                  '• Если проблема повторяется, используйте /getfile для получения файла';
              }
            } else {
              suggestions =
                '• Проверьте интернет-соединение\n' +
                '• Попробуйте отправить архив еще раз\n' +
                '• Используйте /getfile для получения файла';
            }

            // Экранируем спецсимволы в Markdown
            const safeErrorReason = (errorReason || '').replace(
              /[_*[\]()~`>#+\-=|{}.!]/g,
              '\\$&'
            );

            bot.sendMessage(chatId,
              '❌ *Ошибка при отправке архива*\n\n' +
              `📦 Размер файла: ${actualSizeInMB} MB\n` +
              `❗ Причина: \`${safeErrorReason}\`\n\n` +
              '💡 *Возможные решения:*\n' +
              suggestions +
              '\n\n' +
              '📁 Архив сохранен локально: `dist.zip`\n' +
              '💡 Используйте `/getfile` для повторной попытки отправки\n' +
              '🔍 Используйте `/debug` для диагностики',
              { parse_mode: 'Markdown' }
            );

            // Cleanup даже при ошибке
            try {
              fs.unlinkSync(downloadPath);
            } catch (cleanupErr) {
              console.warn(`[${chatId}] Cleanup warning:`, cleanupErr.message);
            }
            // Очищаем состояние
            chatStates.delete(chatId);
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

      // Архивируем саму папку dist целиком (с её именем)
      archive.directory(distPath, 'dist');

      archive.finalize();
    });

  } catch (err) {
    console.error(`[${chatId}] Critical error:`, err);
    console.error(`[${chatId}] Error stack:`, err.stack);

    bot.sendMessage(chatId,
      `❌ *Произошла ошибка:*\n\n\`\`\`\n${err.message}\n\`\`\`\n\n` +
      '💡 *Попробуйте:*\n' +
      '• Проверить корректность архива\n' +
      '• Отправить архив еще раз\n' +
      '• Использовать /debug для диагностики',
      { parse_mode: 'Markdown' }
    );
    // Очищаем состояние
    chatStates.delete(chatId);
  }
}

// Обработка обычных текстовых сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Игнорируем команды и документы (они обрабатываются отдельно)
  if (msg.text && !msg.text.startsWith('/') && !msg.document && !msg.photo) {
    saveMessage(chatId, msg);

    bot.sendMessage(chatId,
      '🤔 Я понимаю только ZIP-архивы с файлами проекта.\n\n' +
      '📝 Используйте:\n' +
      '/start - Начать работу\n' +
      '/help - Инструкция\n' +
      '/status - Статус бота\n' +
      '/history - История сообщений\n\n' +
      '📦 Или просто отправьте ZIP-архив'
    );
  }
});
