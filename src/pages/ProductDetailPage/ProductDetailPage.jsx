import React, {useState, useEffect, useRef} from 'react'
import {useParams, Link} from 'react-router-dom'
import {loadProducts} from '../../utils/loadProducts'
import {loadProductImages} from '../../utils/loadProductImages'
import {useCart} from '../../contexts/CartContext'
import SecurityComponent from '../../components/SecurityComponent/SecurityComponent'
import Toast from '../../components/Toast/Toast'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import './_ProductDetailPage.scss'

function ProductDetailPage() {
	const {id} = useParams()
	const {addToCart} = useCart()
	const [product, setProduct] = useState(null)
	const [loading, setLoading] = useState(true)
	const [images, setImages] = useState([])
	const [selectedSize, setSelectedSize] = useState('M')
	const [showToast, setShowToast] = useState(false)
	const [thumbsSwiper, setThumbsSwiper] = useState(null)
	const [mainSwiper, setMainSwiper] = useState(null)
	const prevRef = useRef(null)
	const nextRef = useRef(null)

	useEffect(() => {
		async function fetchProduct() {
			setLoading(true)
			const products = await loadProducts()
			const foundProduct = products[parseInt(id)]
			setProduct(foundProduct)
			
			// Загружаем изображения продукта
			if (foundProduct) {
				const productImages = await loadProductImages(foundProduct.id)
				setImages(productImages)
			}
			
			setLoading(false)
		}

		fetchProduct()
	}, [id])

	// Обновляем навигацию после монтирования кнопок
	useEffect(() => {
		if (mainSwiper && prevRef.current && nextRef.current && mainSwiper.navigation) {
			mainSwiper.navigation.init()
			mainSwiper.navigation.update()
		}
	}, [mainSwiper, images.length])

	if (loading) {
		return (
			<div className="container">
				<div className="loading">Loading...</div>
			</div>
		)
	}

	if (!product) {
		return (
			<div className="container">
				<div className="error-message">
					<h2>Product not found</h2>
					<Link to="/" className="back-link">← Back to Home</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="container">
			<Toast 
				message="Item added to cart!" 
				isVisible={showToast} 
				onClose={() => setShowToast(false)} 
			/>
			<div className="product-detail">
				<Link to="/" className="back-link">← Back to Home</Link>

				<div className="product-detail__content">
					<div className="product-detail__image hero-images">
						{images.length > 0 ? (
							<>
								<div className="hero-images__btns" style={{ display: images.length > 1 ? 'flex' : 'none' }}>
									<div ref={prevRef} className="swiper-button-prev hero-images__slider-btn hero-images__slider-btn--prev" role="button"></div>
									<div ref={nextRef} className="swiper-button-next hero-images__slider-btn hero-images__slider-btn--next" role="button"></div>
								</div>
								
								<Swiper
									modules={[Navigation, Thumbs]}
									spaceBetween={10}
									slidesPerView={1}
									onSwiper={setMainSwiper}
									onBeforeInit={(swiper) => {
										swiper.params.navigation.nextEl = nextRef.current
										swiper.params.navigation.prevEl = prevRef.current
									}}
									navigation={images.length > 1 ? {
										nextEl: nextRef.current,
										prevEl: prevRef.current,
									} : false}
									thumbs={images.length > 1 ? { swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null } : undefined}
									className="hero-images__main-slider"
								>
									{images.map((imagePath, index) => (
										<SwiperSlide key={index}>
											<img 
												src={imagePath} 
												alt={`${product.title} - ${index + 1}`}
												loading={index === 0 ? 'eager' : 'lazy'}
											/>
										</SwiperSlide>
									))}
								</Swiper>
								
								{images.length > 1 && (
									<Swiper
										modules={[Thumbs]}
										onSwiper={setThumbsSwiper}
										spaceBetween={10}
										slidesPerView={3}
										freeMode={true}
										watchSlidesProgress={true}
										className="hero-images__images-mini-slider"
									>
										{images.map((imagePath, index) => (
											<SwiperSlide key={index}>
												<img 
													src={imagePath} 
													alt={`${product.title} - миниатюра ${index + 1}`}
													loading="lazy"
												/>
											</SwiperSlide>
										))}
									</Swiper>
								)}
							</>
						) : (
							<img src={`img/products/${product.id}.webp`} alt={product.title}/>
						)}
					</div>

					<div className="product-detail__info">
						<div className="product-detail__category">{product.category}</div>
						<h1 className="product-detail__title">{product.title}</h1>
						<div className="product-detail__price">
							<span className="original-price">€{product.oldPrice}</span>
							<span className="current-price">€{product.newPrice}</span>
						</div>

						<div className="product-detail__block">
							<h3>Description:</h3>
							<p>{product.description}</p>
						</div>

						<div className="product-detail__block">
							<h3>Sizes:</h3>
							<ul className="list-row">
								<li>
									<button 
										className={selectedSize === 'XS' ? 'active' : ''}
										onClick={() => setSelectedSize('XS')}
									>
										XS
									</button>
								</li>
								<li>
									<button 
										className={selectedSize === 'S' ? 'active' : ''}
										onClick={() => setSelectedSize('S')}
									>
										S
									</button>
								</li>
								<li>
									<button 
										className={selectedSize === 'M' ? 'active' : ''}
										onClick={() => setSelectedSize('M')}
									>
										M
									</button>
								</li>
								<li>
									<button 
										className={selectedSize === 'L' ? 'active' : ''}
										onClick={() => setSelectedSize('L')}
									>
										L
									</button>
								</li>
								<li>
									<button 
										className={selectedSize === 'XL' ? 'active' : ''}
										onClick={() => setSelectedSize('XL')}
									>
										XL
									</button>
								</li>
								<li>
									<button 
										className={selectedSize === 'XXL' ? 'active' : ''}
										onClick={() => setSelectedSize('XXL')}
									>
										XXL
									</button>
								</li>
							</ul>
						</div>

						<div className="product-detail__actions">
							<button 
								className="add-to-cart-btn"
								onClick={() => {
									if (product) {
										addToCart({ ...product, size: selectedSize })
										setShowToast(true)
									}
								}}
							>
								Add to Cart
							</button>
						</div>

						<div className="product-detail__block">
							<ul className="list-column">
								<li>
									<svg className="flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
										<path
											d="M17.14 13.65h-3.457c.327-1.022.517-2.081.568-3.164h3.751a7.954 7.954 0 0 1-.862 3.165zm-5.784 4.259a13.405 13.405 0 0 0 1.968-3.285h3.226a8.038 8.038 0 0 1-5.194 3.285zM3.45 14.624h3.227a13.407 13.407 0 0 0 1.968 3.285 8.039 8.039 0 0 1-5.195-3.285zm-1.451-4.138h3.751c.051 1.083.24 2.142.568 3.165H2.86a7.97 7.97 0 0 1-.862-3.165zM2.86 6.35h3.457a12.244 12.244 0 0 0-.568 3.164H1.998A7.97 7.97 0 0 1 2.86 6.35zm5.784-4.258a13.416 13.416 0 0 0-1.968 3.285H3.449a8.04 8.04 0 0 1 5.195-3.285zm7.906 3.285h-3.226a13.414 13.414 0 0 0-1.968-3.285 8.04 8.04 0 0 1 5.194 3.285zm-4.3 0h-4.5A12.805 12.805 0 0 1 10 2.007a12.807 12.807 0 0 1 2.25 3.37zM6.734 9.513C6.79 8.43 7 7.37 7.358 6.35h5.284c.359 1.02.568 2.08.624 3.164H6.734zm.624 4.138a11.26 11.26 0 0 1-.624-3.165h6.532a11.26 11.26 0 0 1-.624 3.165H7.358zm.392.973h4.5A12.799 12.799 0 0 1 10 17.992a12.797 12.797 0 0 1-2.25-3.368zm10.252-5.11h-3.75a12.265 12.265 0 0 0-.569-3.165h3.457c.493.96.794 2.03.862 3.164zM1 10c0 4.963 4.037 9 9 9s9-4.037 9-9-4.037-9-9-9-9 4.037-9 9z"
											fill="currentColor"></path>
									</svg>
									<p>Free worldwide shipping</p>
								</li>
								<li>
									<svg className="flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
										<path
											d="M18.41 14.672a1.811 1.811 0 0 0-1.743-1.359c-.834 0-1.538.578-1.743 1.359H13.81v-4.366h5.238v4.366h-.638zm-1.743 1.552a1.04 1.04 0 0 1-.929-.582 1.042 1.042 0 0 1 0-.97 1.04 1.04 0 0 1 .929-.582c.404 0 .757.237.928.582a1.042 1.042 0 0 1 0 .97 1.04 1.04 0 0 1-.928.582zm-3.81-1.552h-5.4a1.811 1.811 0 0 0-1.743-1.359c-.833 0-1.538.578-1.743 1.359H.952V4.97h11.905v9.702zm-7.143 1.552a1.04 1.04 0 0 1-.928-.582 1.042 1.042 0 0 1 0-.97 1.04 1.04 0 0 1 .928-.582c.405 0 .757.237.929.582a1.042 1.042 0 0 1 0 .97 1.04 1.04 0 0 1-.929.582zM16.9 6.91l1.699 2.426h-4.79V6.91H16.9zm.486-.97H13.81V4H0v11.642h3.971c.205.78.91 1.358 1.743 1.358.834 0 1.538-.577 1.743-1.358H14.924c.205.78.91 1.358 1.743 1.358.833 0 1.538-.577 1.743-1.358H20V9.666L17.386 5.94z"
											fill="currentColor"></path>
									</svg>
									<p>Free returns</p>
								</li>
								<li>
									<svg className="flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
										<path
											d="m16.185 9.248-4.237-.92 4.46-4.46c.345 1.804.26 3.646-.223 5.38m-3.019 5.18-.092.091c-2.54 2.484-5.592 1.881-7.533.216l5.592-5.591 4.749 1.03a11.784 11.784 0 0 1-2.716 4.253m-8.094-7.91.092-.093a11.775 11.775 0 0 1 4.252-2.717l1.031 4.751-5.591 5.591c-1.666-1.94-2.268-4.993.216-7.532m8.45-3.548a11.7 11.7 0 0 1 2.202.212l-4.462 4.462-.919-4.235a11.829 11.829 0 0 1 3.18-.439m3.634-.193-.072-.27-.27-.073A12.802 12.802 0 0 0 4.477 5.74l-.099.099c-2.094 2.14-2.985 5.782-.205 8.894L2 16.905l.686.686 2.17-2.171c1.383 1.235 2.869 1.752 4.283 1.752 1.769 0 3.424-.796 4.614-1.96l.1-.1a12.802 12.802 0 0 0 3.304-12.336"
											fill="currentColor"></path>
									</svg>
								<p>Sustainably made</p>
								</li>
								<li>
									<svg className="flex-shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
										<path
											d="M9.5 1c2.757 0 5 2.243 5 5v.813H18v12.34H1V6.814h3.5V6c0-2.757 2.243-5 5-5zM17 7.813H2v10.34h15V7.814zM9.5 10.5a1.25 1.25 0 0 1 .5 2.394v2.318H9v-2.318a1.25 1.25 0 0 1 .5-2.394zm0-8.5c-2.205 0-4 1.794-4 4v.813h8V6c0-2.206-1.794-4-4-4z"
											fill="currentColor"></path>
									</svg>
									<p>Secure payments</p>
								</li>
							</ul>
						</div>

						<SecurityComponent/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProductDetailPage

