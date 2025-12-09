import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('🚀 JS файл загружен! main.jsx выполняется...');
console.log('✅ ReactDOM создает root элемент...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✅ Приложение запущено!');

