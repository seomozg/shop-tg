import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import './_Header.scss'

function Header() {
  const { getTotalItems, cartItems } = useCart()
  const totalItems = getTotalItems()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLogo, setShowLogo] = useState(true)

  useEffect(() => {
    if (cartItems.length > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [cartItems.length])

  return (
    <div className="">
      <div className="header-banner">
        FREE DELIVERY ON ORDERS OVER $25
      </div>
      <header className="header">
        <div className="header-center">
          <Link to="/" className="logo">
            {showLogo ? (
              <img 
                src="/img/logo.png" 
                alt="shop" 
                className="logo__image"
                onError={() => setShowLogo(false)}
              />
            ) : (
              'shop'
            )}
          </Link>
        </div>
        <div className="header-right">
          <Link to="/cart" className={`icon-button cart-button ${isAnimating ? 'cart-button--animate' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H4L4.4 6M6 16H14L18 6H4.4M6 16C5.46957 16 4.96086 15.7893 4.58579 15.4142C4.21071 15.0391 4 14.5304 4 14C4 13.4696 4.21071 12.9609 4.58579 12.5858C4.96086 12.2107 5.46957 12 6 12C6.53043 12 7.03914 12.2107 7.41421 12.5858C7.78929 12.9609 8 13.4696 8 14C8 14.5304 7.78929 15.0391 7.41421 15.4142C7.03914 15.7893 6.53043 16 6 16ZM14 16C13.4696 16 12.9609 15.7893 12.5858 15.4142C12.2107 15.0391 12 14.5304 12 14C12 13.4696 12.2107 12.9609 12.5858 12.5858C12.9609 12.2107 13.4696 12 14 12C14.5304 12 15.0391 12.2107 15.4142 12.5858C15.7893 12.9609 16 13.4696 16 14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {totalItems > 0 && (
              <span className="cart-button__badge">{totalItems}</span>
            )}
          </Link>
        </div>
      </header>
    </div>
  )
}

export default Header

