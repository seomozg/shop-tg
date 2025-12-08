/**
 * Проверяет наличие изображения по пути
 * @param {string} imagePath - Путь к изображению
 * @returns {Promise<boolean>} - true если изображение существует
 */
async function checkImageExists(imagePath) {
  try {
    const response = await fetch(imagePath, { method: 'GET', cache: 'no-cache' })
    // Проверяем что статус 200 и Content-Type содержит image
    if (response.ok && response.status === 200) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.startsWith('image/')) {
        return true
      }
      // Если Content-Type не определен, проверяем через загрузку
      const blob = await response.blob()
      return blob.type.startsWith('image/')
    }
    return false
  } catch (error) {
    return false
  }
}

/**
 * Проверяет наличие дополнительных изображений для продукта
 * @param {number} productId - ID продукта
 * @returns {Promise<string[]>} - Массив путей к существующим изображениям
 */
export async function loadProductImages(productId) {
  const images = []
  
  // Проверяем основное изображение
  const mainImagePath = `/img/products/${productId}.webp`
  const mainExists = await checkImageExists(mainImagePath)
  
  if (!mainExists) {
    // Если основное изображение не найдено, возвращаем пустой массив
    return []
  }
  
  images.push(mainImagePath)
  
  // Проверяем дополнительные изображения (1-1, 1-2, 1-3 и т.д.)
  let index = 1
  let consecutiveFailures = 0
  const maxFailures = 2 // Останавливаемся после 2 подряд идущих отсутствующих файлов
  
  while (index <= 10) { // Ограничиваем до 10 дополнительных изображений
    const imagePath = `/img/products/${productId}-${index}.webp`
    const exists = await checkImageExists(imagePath)
    
    if (exists) {
      images.push(imagePath)
      consecutiveFailures = 0
      index++
    } else {
      consecutiveFailures++
      if (consecutiveFailures >= maxFailures) {
        // Если 2 файла подряд не найдены, прекращаем поиск
        break
      }
      index++
    }
  }
  
  return images
}

