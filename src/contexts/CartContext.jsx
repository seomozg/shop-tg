import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // Загружаем корзину из localStorage при монтировании
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Создаем уникальный ключ для товара с учетом размера
      const itemKey = `${product.id}-${product.size || 'M'}`
      
      // Проверяем, есть ли уже такой товар с таким же размером в корзине
      const existingItem = prevItems.find(item => {
        const existingKey = `${item.id}-${item.size || 'M'}`
        return existingKey === itemKey
      })
      
      if (existingItem) {
        // Если товар с таким размером уже есть, увеличиваем количество
        return prevItems.map(item => {
          const existingKey = `${item.id}-${item.size || 'M'}`
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        })
      } else {
        // Если товара нет, добавляем его с количеством 1 и размером M по умолчанию
        return [...prevItems, { ...product, quantity: 1, size: product.size || 'M' }]
      }
    })
  }

  const removeFromCart = (itemKey) => {
    setCartItems((prevItems) => prevItems.filter(item => {
      const existingKey = `${item.id}-${item.size || 'M'}`
      return existingKey !== itemKey
    }))
  }

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey)
      return
    }
    
    setCartItems((prevItems) =>
      prevItems.map(item => {
        const existingKey = `${item.id}-${item.size || 'M'}`
        return existingKey === itemKey
          ? { ...item, quantity }
          : item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.newPrice) || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

