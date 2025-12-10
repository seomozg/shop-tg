import Papa from 'papaparse'

export async function loadProducts() {
  try {
    // В режиме разработки Vite файлы из public доступны по корневому пути
    // В продакшене файл должен быть в корне dist
    const csvUrl = 'products.csv';
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      console.error('❌ Failed to load products.csv:', response.status, response.statusText);
      console.error('❌ Tried path:', csvUrl);
      return [];
    }
    
    const csvText = await response.text()
    
    // Проверяем, что получили CSV, а не HTML (например, страницу 404)
    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
      console.error('❌ Received HTML instead of CSV. File not found or wrong path.');
      console.error('❌ First 200 chars of response:', csvText.substring(0, 200));
      return [];
    }
    
    return new Promise((resolve, reject) => {
      // Убираем BOM если есть
      const cleanCsvText = csvText.replace(/^\uFEFF/, '')
      
      Papa.parse(cleanCsvText, {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        quoteChar: '"',
        escapeChar: '"',
        newline: '\n',
        transformHeader: (header) => header.trim(),
        transform: (value, field) => {
          if (typeof value === 'string') {
            return value.trim()
          }
          return value
        },
        complete: (results) => {
          const products = results.data.map((product, index) => {
            // Преобразуем ID в число, убирая пробелы и другие символы
            let productId = product.id
            if (productId !== undefined && productId !== null && productId !== '') {
              productId = String(productId).trim()
              productId = productId ? Number(productId) : index
            } else {
              productId = index
            }
            
            // Получаем значения, проверяя разные варианты названий полей
            const title = product.title || product.Title || ''
            const description = product.description || product.Description || ''
            const category = product.category || product.Category || ''
            const oldPrice = product["old-price"] || product["old_price"] || product["Old-Price"] || ''
            const newPrice = product["new-price"] || product["new_price"] || product["New-Price"] || ''
            const selection = product.selection || product.Selection || ''
            const selectionOptions = product["selection-options"] || product["selection_options"] || product["Selection-Options"] || ''
            
            // Парсим варианты выбора (разделенные запятыми)
            const options = selectionOptions 
              ? selectionOptions.split(',').map(opt => opt.trim()).filter(opt => opt)
              : []
            
            return {
              id: productId,
              title: title,
              description: description,
              category: category,
              oldPrice: oldPrice,
              newPrice: newPrice,
              selection: selection,
              selectionOptions: options,
            }
          })
          resolve(products)
        },
        error: (error) => {
          console.error('❌ CSV parsing error:', error);
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

