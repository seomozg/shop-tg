import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './_Navigation.scss'

function Navigation({ categoriesList }) {
  const location = useLocation()

  if (!categoriesList || categoriesList.length === 0) {
    return null
  }

  const isHomeActive = !location.search || location.search === ''

  return (
    <nav className="navigation">
      <div className="navigation__container">
        <Link
          to="/"
          className={`nav-link ${isHomeActive ? 'active' : ''}`}
        >
          Home
        </Link>
        {categoriesList.map((category, index) => {
          const categoryPath = `/?category=${encodeURIComponent(category)}`
          const isActive = location.search === `?category=${encodeURIComponent(category)}`
          
          return (
            <Link
              key={index}
              to={categoryPath}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {category}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation

