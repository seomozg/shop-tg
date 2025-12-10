import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header/Header'
import HomePage from './pages/HomePage/HomePage'
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage'
import CartPage from './pages/CartPage/CartPage'
import './_App.scss'

function App() {
  console.log('📱 App компонент рендерится...');
  console.log('📱 App: текущий URL:', window.location.href);
  console.log('📱 App: путь:', window.location.pathname);
  
  try {
    return (
      <CartProvider>
        <Router>
          <div className="app">
            <Header />
            <Routes>
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    )
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА в App:', error);
    return <div>Ошибка: {error.message}</div>;
  }
}

export default App

