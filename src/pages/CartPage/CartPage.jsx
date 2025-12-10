import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import './_CartPage.scss'

// Список доступных цен для округления (в порядке возрастания)
const PRICE_TIERS = [2, 2.95, 3.95, 4.95, 5.95, 6.99, 7.95, 9.99, 11.90, 13.99, 14.95, 17.95, 19.99, 24.95, 29.99, 39.99, 49.99]

/**
 * Округляет сумму вниз до ближайшего значения из списка цен
 * @param {number} amount - Сумма для округления
 * @returns {string} - Округленная сумма с двумя знаками после запятой
 */
function roundDownToPriceTier(amount) {
  // Находим ближайшее меньшее или равное значение
  for (let i = PRICE_TIERS.length - 1; i >= 0; i--) {
    if (amount >= PRICE_TIERS[i]) {
      return PRICE_TIERS[i].toFixed(2)
    }
  }
  // Если сумма меньше минимального значения, возвращаем минимальное
  return PRICE_TIERS[0].toFixed(2)
}

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const [offer, setOffer] = useState('')

  useEffect(() => {
    // Получаем offer из элемента в index.html после того, как сервер подставит значение
    const getOfferFromHTML = () => {
      const offerLink = document.getElementById('offer-link')
      if (offerLink) {
        const href = offerLink.getAttribute('href')
        // Проверяем, что это не просто строка "{offer}", а реальное значение
        if (href && href !== '{offer}' && href !== '"{offer}"') {
          return href
        }
      }
      return ''
    }

    // Проверяем сразу при монтировании
    const initialOffer = getOfferFromHTML()
    if (initialOffer) {
      setOffer(initialOffer)
      return
    }

    // Если еще не подставлено, проверяем периодически
    const checkInterval = setInterval(() => {
      const foundOffer = getOfferFromHTML()
      if (foundOffer) {
        setOffer(foundOffer)
        clearInterval(checkInterval)
      }
    }, 100)

    // Останавливаем проверку через 10 секунд
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
    }, 10000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [])

  const handleCheckout = () => {
    const totalPrice = getTotalPrice()
    // Округляем сумму вниз до ближайшего значения из списка цен
    const roundedPrice = roundDownToPriceTier(totalPrice)
    // Формируем ссылку: {offer}_сумма корзины
    const checkoutUrl = offer ? `${offer}_${roundedPrice}` : `{offer}_${roundedPrice}`
    
    // Перенаправляем пользователя
    window.location.href = checkoutUrl
  }

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="cart-page">
          <h1 className="cart-page__title">Cart</h1>
          <div className="cart-page__empty">
            <p>Your cart is empty</p>
            <Link to="/" className="cart-page__back-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="cart-page">
        <h1 className="cart-page__title">Cart</h1>
        
        <div className="cart-page__content">
          <div className="cart-page__items">
            {cartItems.map((item, index) => {
              const itemTotal = (parseFloat(item.newPrice) || 0) * item.quantity
              const itemSize = item.size || 'M'
              const itemKey = `${item.id}-${itemSize}`
              
              return (
                <div key={`${itemKey}-${index}`} className="cart-item">
                  <div className="cart-item__image">
                    <img 
                      src={`img/products/${item.id}.webp`} 
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = 'img/products/1.webp' // Fallback изображение
                      }}
                    />
                  </div>
                  
                  <div className="cart-item__info">
                    <h3 className="cart-item__title">{item.title}</h3>
                    <div className="cart-item__size">Size: {itemSize}</div>
                    <div className="cart-item__price">
                      {item.oldPrice && (
                        <span className="cart-item__old-price">{item.oldPrice}</span>
                      )}
                      <span className="cart-item__new-price">{item.newPrice}</span>
                    </div>
                  </div>
                  
                  <div className="cart-item__quantity">
                    <button 
                      className="cart-item__quantity-btn"
                      onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="cart-item__quantity-value">{item.quantity}</span>
                    <button 
                      className="cart-item__quantity-btn"
                      onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item__total">
                    <span className="cart-item__total-price">
                      ${itemTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <button 
                    className="cart-item__remove"
                    onClick={() => removeFromCart(itemKey)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
          
          <div className="cart-page__summary">
            <div className="cart-summary">
              <h2 className="cart-summary__title">Summary</h2>
              
              <div className="cart-summary__row">
                <span>Items:</span>
                <span>{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total:</span>
                <span className="cart-summary__total-price">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              
              <button 
                className="cart-summary__checkout-btn"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              
              <button 
                className="cart-summary__clear-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              
              <Link to="/" className="cart-summary__continue-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

