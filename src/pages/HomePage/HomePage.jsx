import React, {useState, useEffect} from 'react'
import {useSearchParams, Link} from 'react-router-dom'
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
			try {
				setLoading(true)
				const data = await loadProducts()
				setProducts(data || [])
				setLoading(false)
			} catch (error) {
				console.error('❌ HomePage: ошибка при загрузке товаров:', error);
				setProducts([])
				setLoading(false)
			}
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

	// Если выбрана категория, показываем все товары этой категории
	// Если категория не выбрана, показываем все категории с первыми 10 товарами каждой
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

	return (
		<>
			{categories.length > 0 && <Navigation categoriesList={categories}/>}

			<div className="container">
				{products.length === 0 ? (
					<div className="no-products">no products</div>
				) : selectedCategory ? (
					// Показываем все товары выбранной категории
					<div className="products">
						<h1 className="products__title">{selectedCategory.toUpperCase()}</h1>
						{filteredProducts.length === 0 ? (
							<div className="no-products">no products</div>
						) : (
							<div className="products__grid">
								{filteredProducts.map((product, index) => (
									<ProductCard key={`${selectedCategory}-${product.id}-${index}`} product={product} />
								))}
							</div>
						)}
					</div>
				) : (
					<div className="categories">
						{categories.map((category) => {
							const categoryProducts = products.filter(product => product.category === category)
							const productsToShow = categoryProducts.slice(0, 8)
							
							return (
								<div key={category} className="products">
									<h1 className="products__title">{category.toUpperCase()}</h1>
									{productsToShow.length === 0 ? (
										<div className="no-products">no products</div>
									) : (
										<>
											<div className="products__grid">
											{productsToShow.map((product, index) => (
												<ProductCard key={`${category}-${product.id}-${index}`} product={product} />
											))}
											</div>
											{categoryProducts.length > 8 && (
												<div className="products__view-more">
													<Link 
														to={`/?category=${encodeURIComponent(category)}`}
														className="products__view-more-btn"
													>
														View more
													</Link>
												</div>
											)}
										</>
									)}
								</div>
							)
						})}
					</div>
				)}
			</div>
		</>
	)
}

export default HomePage

