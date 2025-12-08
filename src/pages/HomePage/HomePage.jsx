import React, {useState, useEffect} from 'react'
import {useSearchParams} from 'react-router-dom'
import Navigation from "../../components/Navigation/Navigation";
import ProductCard from '../../components/ProductCard/ProductCard'
import {loadProducts} from '../../utils/loadProducts'
import './_HomePage.scss'

function HomePage() {
	const [products, setProducts] = useState([])
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchParams] = useSearchParams()
	const selectedCategory = searchParams.get('category')

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true)
			const data = await loadProducts()
			setProducts(data)
			setLoading(false)
		}

		fetchProducts()
	}, [])

	useEffect(() => {
		if (products.length > 0) {
			// Извлекаем все уникальные категории из продуктов
			const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))]
			setCategories(uniqueCategories)
		}
	}, [products])

	// Фильтруем товары по выбранной категории
	const filteredProducts = selectedCategory
		? products.filter(product => product.category === selectedCategory)
		: products

	if (loading) {
		return (
			<div className="page-container">
				<div className="loading">Loading...</div>
			</div>
		)
	}

	const displayCategory = selectedCategory || 'new arrival'

	return (
		<>
			{categories.length > 0 && <Navigation categoriesList={categories}/>}

			<div className="container">
				<div className="products">
					<h1 className="products__title">{displayCategory.toUpperCase()}</h1>
					{filteredProducts.length === 0 ? (
						<div className="error-message">No products found</div>
					) : (
						<div className="products__grid">
							{filteredProducts.map((product, index) => (
								<ProductCard key={product.id} product={product} index={product.id}/>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default HomePage

