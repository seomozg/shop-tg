import React, {useState, useEffect} from 'react'
import {useSearchParams} from 'react-router-dom'
import Navigation from "../../components/Navigation/Navigation";
import ProductCard from '../../components/ProductCard/ProductCard'
import {loadProducts} from '../../utils/loadProducts'
import './_HomePage.scss'

function HomePage() {
	console.log('🏠🏠🏠 HomePage компонент ВЫЗВАН!');
	
	const [products, setProducts] = useState([])
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchParams] = useSearchParams()
	const selectedCategory = searchParams.get('category')
	
	console.log('🏠 HomePage: состояние инициализировано', { loading, selectedCategory });

	useEffect(() => {
		console.log('🏠 HomePage: начинаю загрузку товаров...');
		async function fetchProducts() {
			try {
				setLoading(true)
				console.log('📦 HomePage: вызываю loadProducts()...');
				const data = await loadProducts()
				console.log('📦 HomePage: получил данные:', data);
				console.log('📦 HomePage: количество товаров:', data?.length || 0);
				if (data && data.length > 0) {
					console.log('📦 HomePage: первый товар:', data[0]);
				}
				setProducts(data || [])
				setLoading(false)
				console.log('📦 HomePage: загрузка завершена, loading = false');
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

	// Фильтруем товары по выбранной категории
	const filteredProducts = selectedCategory
		? products.filter(product => product.category === selectedCategory)
		: products

	console.log('🏠 HomePage render:', { 
		loading, 
		productsCount: products.length, 
		filteredCount: filteredProducts.length,
		selectedCategory 
	});

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
					{products.length === 0 ? (
						<div className="no-products">no products</div>
					) : (
						<>
							<h1 className="products__title">{displayCategory.toUpperCase()}</h1>
							{filteredProducts.length === 0 ? (
								<div className="no-products">no products</div>
							) : (
								<div className="products__grid">
									{filteredProducts.map((product, index) => (
										<ProductCard key={product.id} product={product} index={product.id}/>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default HomePage

