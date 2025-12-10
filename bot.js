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

// Хранилище состояний чатов (ожидание логотипа, архив и т.д.)
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
  { command: 'status', description: 'Показать статус бота' },
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
    '/status - Статус бота\n' +
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

// Команда /getfile - получить последний dist.zip
bot.onText(/\/getfile/, (msg) => {
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
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const modifiedDate = new Date(stats.mtime).toLocaleString('ru-RU');

  bot.sendMessage(chatId,
    `📦 *Отправляю последний собранный архив*\n\n` +
    `📊 Размер: ${sizeInMB} MB\n` +
    `🕐 Создан: ${modifiedDate}\n\n` +
    `Отправляю...`,
    { parse_mode: 'Markdown' }
  );

  bot.sendDocument(chatId, distZipPath, {
    caption:
      '📦 *Последняя сборка проекта*\n\n' +
      `📊 Размер: ${sizeInMB} MB\n` +
      `🕐 Создан: ${modifiedDate}`,
    parse_mode: 'Markdown'
  })
  .catch(err => {
    console.error(`[${chatId}] Error sending existing dist.zip:`, err);
    console.error(`[${chatId}] Telegram API error:`, err.response?.body);

    bot.sendMessage(chatId,
      '❌ Не удалось отправить файл\n\n' +
      `Причина: ${err.message}\n\n` +
      'Файл находится на сервере: dist.zip\n' +
      'Попросите администратора забрать его напрямую.'
      // Убрали parse_mode: 'Markdown' чтобы избежать проблем с парсингом
    );
  });
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

  // Если ожидаем логотип, игнорируем документы
  const state = chatStates.get(chatId);
  if (state && state.waitingForLogo) {
    return;
  }

  if (mimeType !== 'application/zip' && !fileName.endsWith('.zip')) {
    return bot.sendMessage(chatId, '❌ Пожалуйста, пришлите ZIP архив.');
  }

  // Спрашиваем про логотип перед обработкой архива
  bot.sendMessage(chatId, 
    '📦 Архив получен!\n\n' +
    '❓ Будет ли логотип у магазина?\n\n' +
    'Если да, отправьте изображение логотипа.\n' +
    'Если нет, отправьте "нет" или "no".',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Да, будет логотип', callback_data: 'logo_yes' }],
          [{ text: '❌ Нет, без логотипа', callback_data: 'logo_no' }]
        ]
      }
    }
  );

  // Сохраняем архив и состояние ожидания ответа
  chatStates.set(chatId, {
    waitingForLogoAnswer: true,
    archiveFileId: fileId,
    archiveFileName: fileName
  });
});

// Обработка callback_query (кнопки)

// Обработка callback_query (кнопки)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'logo_yes') {
    await bot.answerCallbackQuery(query.id);
    chatStates.set(chatId, {
      ...chatStates.get(chatId),
      waitingForLogoAnswer: false,
      waitingForLogo: true
    });
    bot.sendMessage(chatId, '📸 Отлично! Отправьте изображение логотипа.');
  } else if (data === 'logo_no') {
    await bot.answerCallbackQuery(query.id);
    const state = chatStates.get(chatId);
    if (state && state.archiveFileId) {
      chatStates.set(chatId, {
        ...state,
        waitingForLogoAnswer: false,
        waitingForLogo: false,
        hasLogo: false
      });
      // Начинаем обработку архива без логотипа
      processArchive(chatId, state.archiveFileId, state.archiveFileName, null);
    }
  }
});

// Обработка фото (логотип)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const state = chatStates.get(chatId);

  if (!state || !state.waitingForLogo) {
    return; // Игнорируем фото, если не ожидаем логотип
  }

  saveMessage(chatId, msg);

  // Берем фото наибольшего размера
  const photos = msg.photo;
  const largestPhoto = photos[photos.length - 1];
  const fileId = largestPhoto.file_id;

  bot.sendMessage(chatId, '⬇️ Загружаю логотип...');

  try {
    const logoDir = path.join(__dirname, 'public', 'img');
    
    // Создаем папку если не существует
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }

    // Скачиваем фото во временную папку
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Скачиваем файл
    await bot.downloadFile(fileId, tempDir);
    
    // После скачивания ищем файл в tempDir напрямую
    // Это более надежно, чем полагаться на возвращаемый путь
    const filesInTemp = fs.readdirSync(tempDir);
    if (filesInTemp.length === 0) {
      throw new Error('Файл не был скачан в temp директорию');
    }
    
    // Используем последний файл (скорее всего это наш только что скачанный файл)
    // Сортируем по времени модификации, берем самый новый
    const filesWithStats = filesInTemp.map(file => ({
      name: file,
      path: path.join(tempDir, file),
      mtime: fs.statSync(path.join(tempDir, file)).mtime
    }));
    filesWithStats.sort((a, b) => b.mtime - a.mtime);
    
    const tempPath = filesWithStats[0].path;
    
    const logoPath = path.join(logoDir, 'logo.png');

    // Переименовываем в logo.png
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }
    fs.copyFileSync(tempPath, logoPath);
    
    // Удаляем временный файл
    try {
      fs.unlinkSync(tempPath);
    } catch (cleanupErr) {
      console.warn(`[${chatId}] Не удалось удалить временный файл:`, cleanupErr.message);
    }

    bot.sendMessage(chatId, '✅ Логотип сохранен! Начинаю обработку архива...');

    // Обновляем состояние и начинаем обработку архива
    chatStates.set(chatId, {
      ...state,
      waitingForLogo: false,
      hasLogo: true,
      logoPath: logoPath
    });

    // Начинаем обработку архива с логотипом
    processArchive(chatId, state.archiveFileId, state.archiveFileName, logoPath);
  } catch (err) {
    console.error(`[${chatId}] Error downloading logo:`, err);
    console.error(`[${chatId}] Error stack:`, err.stack);
    
    // Очищаем состояние при ошибке
    chatStates.delete(chatId);
    
    bot.sendMessage(chatId, 
      '❌ *Ошибка при загрузке логотипа*\n\n' +
      `Причина: ${err.message}\n\n` +
      '💡 *Попробуйте:*\n' +
      '• Отправить изображение еще раз\n' +
      '• Использовать другой формат (PNG, JPG)\n' +
      '• Убедиться, что файл не поврежден',
      { parse_mode: 'Markdown' }
    );
  }
});

// Функция обработки архива
async function processArchive(chatId, fileId, fileName, logoPath) {
  bot.sendMessage(chatId, '📦 Начинаю обработку архива...');

  try {
    // Скачивание файла
    bot.sendMessage(chatId, '⬇️ Загружаю архив...');

    const downloadPath = await bot.downloadFile(fileId, './');

    // 1. Clean public directory
    bot.sendMessage(chatId, '🧹 Очищаю старые файлы...');
    const publicDir = path.join(__dirname, 'public');
    cleanDirectory(publicDir);

    // Сохраняем логотип если есть (после очистки, но до распаковки архива)
    if (logoPath && fs.existsSync(logoPath)) {
      const logoDest = path.join(publicDir, 'img', 'logo.png');
      const logoDestDir = path.dirname(logoDest);
      if (!fs.existsSync(logoDestDir)) {
        fs.mkdirSync(logoDestDir, { recursive: true });
      }
      fs.copyFileSync(logoPath, logoDest);
      // Обновляем Header.jsx с логотипом
      updateHeaderWithLogo();
    }

    // 2. Unzip
    bot.sendMessage(chatId, '📂 Распаковываю архив...');
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
    bot.sendMessage(chatId, '🔨 Сборка проекта (npm run build)...\n⏱ Это может занять 1-3 минуты.');

    const buildStartTime = Date.now();

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

      bot.sendMessage(chatId, `✅ Сборка завершена за ${buildTime}с\n📦 Создаю архив...`);

      // 4. Zip dist
      const distPath = path.join(__dirname, 'dist');
      const distZipPath = path.join(__dirname, 'dist.zip');

      const output = fs.createWriteStream(distZipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
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

        // Проверяем, что файл существует и читаем
        if (!fs.existsSync(distZipPath)) {
          console.error(`[${chatId}] Archive file not found: ${distZipPath}`);
          bot.sendMessage(chatId, '❌ Архив не найден. Попробуйте еще раз.');
          return;
        }

        bot.sendDocument(chatId, distZipPath, { 
          caption: 
            '🎉 Сборка завершена!\n\n' +
            `📦 Размер архива: ${sizeInMB} MB\n` +
            `⏱ Время обработки: ${totalTime}с\n\n` +
            '📋 Следующие шаги:\n' +
            '1️⃣ Распакуйте dist.zip\n' +
            '2️⃣ Загрузите содержимое в public_html\n' +
            '3️⃣ Проверьте наличие .htaccess\n\n' +
            '⚠️ Важно: Загружайте файлы из папки dist, а не саму папку!\n\n' +
            '💡 Используйте /help для подробной инструкции',
          disable_notification: false
        })
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
          console.error(`[${chatId}] Error message:`, err.message);
          console.error(`[${chatId}] Error code:`, err.code);

          // Логируем тело ответа от Telegram API
          if (err.response && err.response.body) {
            console.error(`[${chatId}] Telegram API response body:`, JSON.stringify(err.response.body, null, 2));
          }

          // Логируем полный объект ошибки для диагностики
          console.error(`[${chatId}] Full error object:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
          console.error(`[${chatId}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

          // Определяем причину ошибки
          let errorReason = err.message;
          let suggestions = '';

          // Проверяем конкретные типы ошибок от Telegram API
          if (err.response && err.response.body) {
            const telegramError = err.response.body;
            if (telegramError.description) {
              errorReason = telegramError.description;
            }

            // Специфичные советы на основе ошибки
            if (errorReason.includes('Request Entity Too Large') || errorReason.includes('file is too big')) {
              suggestions = '• Файл превышает лимит (обычно из-за больших изображений)\n• Сожмите изображения в формат .webp\n• Уменьшите качество изображений';
            } else if (errorReason.includes('Wrong file identifier') || errorReason.includes('file not found')) {
              suggestions = '• Проблема с файлом на диске\n• Попробуйте отправить архив еще раз';
            } else if (errorReason.includes('ETELEGRAM')) {
              suggestions = '• Проблема с Telegram API\n• Проверьте токен бота\n• Попробуйте через несколько минут';
            } else {
              suggestions = '• Проверьте интернет-соединение\n• Попробуйте отправить архив еще раз\n• Уменьшите размер изображений';
            }
          }

          bot.sendMessage(chatId,
            '❌ Ошибка при отправке архива\n\n' +
            `📦 Размер: ${sizeInMB} MB\n` +
            `❗ Причина: ${errorReason}\n\n` +
            '💡 Возможные решения:\n' +
            suggestions + '\n\n' +
            '📁 Архив сохранен локально: dist.zip\n' +
            'Можете забрать его напрямую с сервера.\n\n' +
            'Используйте /debug для диагностики.'
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

// Функция для обновления Header.jsx с логотипом
function updateHeaderWithLogo() {
  const headerPath = path.join(__dirname, 'src', 'components', 'Header', 'Header.jsx');
  
  if (!fs.existsSync(headerPath)) {
    console.error('Header.jsx not found');
    return;
  }
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  
  // Проверяем, есть ли уже логотип
  if (headerContent.includes('img/logo.png')) {
    return; // Уже обновлен
  }

  // Заменяем текст "shop" на изображение логотипа
  const updatedContent = headerContent.replace(
    /<Link to="\/" className="logo">shop<\/Link>/,
    `<Link to="/" className="logo">
          <img alt="" src="img/logo.png"/>
        </Link>`
  );

  fs.writeFileSync(headerPath, updatedContent, 'utf8');
}

// Обработка обычных текстовых сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const state = chatStates.get(chatId);
  
  // Если ожидаем ответ о логотипе
  if (state && state.waitingForLogoAnswer) {
    const text = msg.text?.toLowerCase();
    if (text === 'нет' || text === 'no' || text === 'н') {
      chatStates.set(chatId, {
        ...state,
        waitingForLogoAnswer: false,
        waitingForLogo: false,
        hasLogo: false
      });
      processArchive(chatId, state.archiveFileId, state.archiveFileName, null);
      return;
    } else if (text === 'да' || text === 'yes' || text === 'д') {
      chatStates.set(chatId, {
        ...state,
        waitingForLogoAnswer: false,
        waitingForLogo: true
      });
      bot.sendMessage(chatId, '📸 Отлично! Отправьте изображение логотипа.');
      return;
    }
  }
  
  // Игнорируем команды и документы (они обрабатываются отдельно)
  if (msg.text && !msg.text.startsWith('/') && !msg.document && !msg.photo) {
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

