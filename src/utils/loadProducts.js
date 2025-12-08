import Papa from 'papaparse'

export async function loadProducts() {
  try {
    const response = await fetch('/products.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const products = results.data.map((product, index) => ({
            id: product.id || index,
            title: product.title || '',
            description: product.description || '',
            category: product.category || '',
            oldPrice: product["old-price"] || '',
            newPrice: product["new-price"] || '',
          }))
          resolve(products)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

