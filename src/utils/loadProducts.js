import Papa from 'papaparse'

export async function loadProducts() {
  try {
    const csvUrl = 'products.csv';
    
    console.log('🔍 Loading products from:', csvUrl);
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      console.error('❌ Failed to load products.csv:', response.status, response.statusText);
      console.error('❌ Tried path:', csvUrl);
      return [];
    }
    
    const csvText = await response.text()
    console.log('✅ Products loaded successfully, CSV length:', csvText.length);
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('📊 CSV parsed, rows found:', results.data.length);
          const products = results.data.map((product, index) => ({
            id: product.id || index,
            title: product.title || '',
            description: product.description || '',
            category: product.category || '',
            oldPrice: product["old-price"] || '',
            newPrice: product["new-price"] || '',
          }))
          console.log('✅ Products processed:', products.length);
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

