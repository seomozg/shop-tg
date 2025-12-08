import {useState} from 'react';

import "./_SecurityComponent.scss"

function SecurityComponent() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="security">
			<div className={`security__top ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen((prev) => !prev)}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				     viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" clip-rule="evenodd"
					      d="M9.99932 0C10.5736 0 11.1307 0.184885 11.5792 0.524258L12.0909 0.911325C13.4831 1.96508 15.0052 2.85514 16.6239 3.56198L17.9248 4.13095C18.3719 4.32298 18.7485 4.63668 19.0065 5.03203C19.2644 5.42739 19.3921 5.88649 19.3732 6.35077C18.9684 14.8758 13.0391 18.7013 11.0849 19.7312C10.4069 20.0896 9.59169 20.0896 8.91232 19.7312C6.95805 18.7 1.03164 14.8731 0.626913 6.32479C0.607503 5.85814 0.736181 5.39668 0.996373 4.99983C1.25657 4.60299 1.63636 4.28894 2.08683 4.09813L3.31114 3.57292C4.97349 2.85777 6.53548 1.94994 7.96121 0.870293L8.41942 0.524258C8.86789 0.184885 9.42506 0 9.99932 0ZM7.19446 9.35226C7.43734 9.34797 7.67239 9.43812 7.85011 9.60372L9.12261 10.875L12.1639 7.83623C12.3416 7.67063 12.5766 7.58047 12.8195 7.58476C13.0624 7.58904 13.2941 7.68743 13.4659 7.8592C13.6377 8.03096 13.736 8.2627 13.7403 8.50557C13.7446 8.74845 13.6545 8.98351 13.4889 9.16123L9.78511 12.8637C9.60933 13.0393 9.37105 13.1379 9.12261 13.1379C8.87418 13.1379 8.63589 13.0393 8.46011 12.8637L6.52511 10.9287C6.35951 10.751 6.26936 10.5159 6.27364 10.2731C6.27793 10.0302 6.37632 9.79846 6.54809 9.6267C6.71985 9.45493 6.95158 9.35654 7.19446 9.35226Z"
					      fill="currentColor"></path>
				</svg>
				<span>Security and Service</span>
				<svg className="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
				     fill="currentColor">
					<path
						d="M7.54264 10.3064C7.77695 10.5407 8.15686 10.5407 8.39117 10.3064L12.8459 5.85165C12.9631 5.73449 12.9631 5.54454 12.8459 5.42738L12.5065 5.08797C12.3894 4.97082 12.1994 4.97082 12.0823 5.08797L7.96696 9.20328L3.85155 5.08787C3.73439 4.97071 3.54444 4.97071 3.42728 5.08787L3.08787 5.42728C2.97071 5.54444 2.97071 5.73439 3.08787 5.85154L7.54264 10.3064Z"
						fill="currentColor"></path>
				</svg>
			</div>

			<div className="security__bottom">
				<div className="security-item">
					<div className={`security-item__top ${isOpen ? 'open' : ''}`}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<g clip-path="url(#clip0_2533_19421)">
								<path
									d="M18.5653 9.98893C18.8533 9.78627 19.3146 9.78359 19.6026 9.98893C19.6026 9.98893 20.3706 10.6023 21.3253 11.0103V3.61827C21.3253 3.26094 21.0399 2.97559 20.6879 2.97559H0.626594C0.274586 2.97559 -0.0107422 3.26359 -0.0107422 3.61827V17.2689C-0.0107422 17.6263 0.274586 17.9116 0.626594 17.9116H14.1626C13.9279 17.5516 13.8533 17.0343 13.8533 16.6209V11.5543C13.8533 11.3169 14.0373 11.1676 14.2666 11.2183C14.2666 11.2183 14.8266 11.3649 15.3466 11.3649C16.8346 11.3649 18.5653 9.98895 18.5653 9.98895V9.98893ZM7.88259 9.80494H2.76259C2.40791 9.80494 2.12259 9.51694 2.12259 9.16494C2.12259 8.81026 2.41059 8.52493 2.76259 8.52493H7.88259C8.23727 8.52493 8.52259 8.81293 8.52259 9.16494C8.52259 9.51694 8.23459 9.80494 7.88259 9.80494ZM2.75992 6.3916C2.40791 6.3916 2.12259 6.1036 2.12259 5.75159C2.12259 5.39691 2.40791 5.11159 2.75992 5.11159H18.5519C18.9039 5.11159 19.1893 5.39959 19.1893 5.75159C19.1893 6.10627 18.9039 6.3916 18.5519 6.3916H2.75992Z"
									fill="currentColor"></path>
								<path
									d="M23.4559 12.0668H22.5412C21.2052 12.0668 19.7092 10.8668 19.7092 10.8668C19.4212 10.6615 18.9572 10.6669 18.6692 10.8668C18.6692 10.8668 17.1732 12.0668 15.8372 12.0668H14.9225C14.6879 12.0668 14.4985 12.2588 14.4985 12.4935V16.7842C14.4985 17.2535 14.7972 17.8722 15.1652 18.1655L18.5225 20.8242C18.8905 21.1149 19.4879 21.1149 19.8586 20.8242L23.2159 18.1655C23.5839 17.8749 23.8826 17.2562 23.8826 16.7842V12.4935C23.8826 12.2588 23.6906 12.0668 23.4559 12.0668ZM21.3386 14.7922L19.3866 17.2748C19.0026 17.7655 18.3199 17.7788 17.9172 17.3068L17.0532 16.2988C16.8986 16.1202 16.9199 15.8508 17.0986 15.6961C17.2772 15.5415 17.5466 15.5628 17.7012 15.7415L18.5652 16.7495C18.6186 16.8135 18.6639 16.8135 18.7172 16.7442L20.6692 14.2615C20.8159 14.0775 21.0826 14.0428 21.2692 14.1895C21.4506 14.3388 21.4826 14.6082 21.3386 14.7922Z"
									fill="currentColor"></path>
							</g>
							<defs>
								<clipPath id="clip0_2533_19421">
									<rect width="24" height="24" fill="currentColor"></rect>
								</clipPath>
							</defs>
						</svg>
						<span>Payment Security</span>
					</div>
					{isOpen && (
						<div className="security-item__bottom">
							<p>
								We are committed to your secure shopping experience. We offer safe and trusted payment options to protect your transactions. Your payment information is shared only with our certified payment service providers, who are dedicated to maintaining the confidentiality of your details.
							</p>
							<div className="security-item__images">
								<img src="/img/security/1-1.svg" alt=""/>
								<img src="/img/security/1-2.svg" alt=""/>
								<img src="/img/security/1-3.svg" alt=""/>
								<img src="/img/security/1-4.svg" alt=""/>
								<img src="/img/security/1-5.svg" alt=""/>
							</div>
						</div>
					)}
				</div>

				<div className="security-item">
					<div className={`security-item__top ${isOpen ? 'open' : ''}`}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
							<path fill="currentColor"
							      d="M19.505 15.49h-3.174a.712.712 0 0 1-.082-.338v-.675c0-.322.199-.584.444-.584h1.05c.243 0 .441.26.441.582 0 .254.157.46.352.46.194 0 .351-.206.351-.46 0-.83-.512-1.504-1.143-1.504h-1.051c-.632 0-1.145.675-1.145 1.506v.675c0 .114.01.227.032.338h-1.138a.674.674 0 0 0-.66.685v4.614c0 .378.295.685.66.685h5.063c.364 0 .66-.307.66-.685v-4.614a.672.672 0 0 0-.66-.685m-2.193 2.994v1.864a.272.272 0 1 1-.543 0v-1.864a.9.9 0 0 1-.6-.86c0-.499.39-.903.872-.903.481 0 .872.404.872.904 0 .4-.252.74-.601.859m3.6-1.075v3.663a.794.794 0 0 1-.329.643h1.097c0-1.546-.127-3.008-.769-4.306"></path>
							<path fill="currentColor"
							      d="M16.905 7.214a4.863 4.863 0 0 0-5.79-4.773A4.81 4.81 0 0 0 7.26 6.366a4.863 4.863 0 0 0 3.817 5.61.03.03 0 0 1 .016.05.03.03 0 0 1-.02.008c-4.915.477-8.76 4.613-8.775 9.65a.03.03 0 0 0 .03.03h10.978c.027 0-.124-.033-.144-.051-.162-.146-.334-.356-.334-.591l.07-5.33a.825.825 0 0 1 .826-.825h1.203a.03.03 0 0 0 .03-.034c-.047-.281-.07-1.728.574-2.141a.03.03 0 0 0 .014-.029.03.03 0 0 0-.02-.025c-.782-.287-1.645-.534-2.568-.641a.03.03 0 0 1-.002-.06 4.861 4.861 0 0 0 3.95-4.773"></path>
						</svg>
						<span>Privacy Protection</span>
					</div>
					{isOpen && (
						<div className="security-item__bottom">
							<p>
								Your privacy is our priority. We employ internationally recognized encryption methods for all network transmissions, ensuring the utmost security for your private data during your shopping journey. This includes the protection of your shipping address, credit card information, shopping details, and more. Shop with confidence, knowing your privacy is safeguarded with us.
							</p>
							<div className="security-item__images">
								<img src="/img/security/2-1.webp" alt=""/>
								<img src="/img/security/2-2.webp" alt=""/>
								<img src="/img/security/2-3.webp" alt=""/>
								<img src="/img/security/2-4.webp" alt=""/>
								<img src="/img/security/2-5.webp" alt=""/>
							</div>
						</div>
					)}
				</div>

				<div className="security-item">
					<div className={`security-item__top ${isOpen ? 'open' : ''}`}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
							<path fill="currentColor"
							      d="M10.469 5.344c.094.375.187.75.187 1.125 0 .656-.094 1.218-.375 1.687-.281.563-.562 1.031-.937 1.406-.375.376-.844.75-1.406.938-.563.188-1.125.375-1.688.375-.656 0-1.219-.094-1.687-.375-.563-.187-1.032-.562-1.407-.937-.375-.376-.75-.844-.937-1.407-.281-.562-.375-1.125-.375-1.687V6.28c-.375.282-.469.563-.657.844A3.37 3.37 0 0 0 1 8.156V19.22c0 .281.094.468.188.656.187.188.375.188.562.188h.469c0-.938.187-1.594.656-2.063.469-.469 1.125-.656 1.969-.656.937 0 1.593.281 1.968.75.47.468.657 1.125.657 1.968h5.812c.188 0 .375-.093.563-.187.187-.187.281-.375.281-.562V5.53h-3.656z"></path>
							<path fill="currentColor"
							      d="M5.031 18.656c-.375 0-.75.094-.937.375-.282.282-.375.563-.375.938s.094.656.375.937c.281.282.562.375.937.375s.75-.093.938-.375c.281-.281.375-.562.375-.937s-.094-.75-.375-.938c-.282-.187-.563-.375-.938-.375m14.532.094c.375 0 .656.094.937.375s.375.563.375.938-.094.75-.375.937c-.281.281-.562.375-.937.375s-.75-.094-.938-.375c-.281-.281-.375-.562-.375-.937s.094-.657.375-.938c.281-.281.563-.375.938-.375"></path>
							<path fill="currentColor"
							      d="M23.406 15c-.093-.844-.281-1.594-.562-2.437a8 8 0 0 0-1.219-2.344A3.994 3.994 0 0 0 20.5 9.188c-.469-.282-.937-.563-1.406-.75-.469-.188-1.032-.282-1.5-.376-.469-.093-1.032-.093-1.5-.093-.188 0-.282.093-.375.375-.094.187-.188.375-.188.562v10.219c0 .281.094.469.281.656a.851.851 0 0 0 .657.282h.375c0-.375.093-.657.187-1.032.094-.281.282-.562.563-.843.187-.282.468-.47.843-.563.282-.187.657-.187 1.032-.187s.75.093 1.031.187c.375.094.656.281.844.469.281.187.468.468.562.843.188.375.188.75.188 1.22h.843c.094 0 .188 0 .188-.095.094-.093.094-.187.094-.28 0-.095.093-.282.093-.376v-1.968c.282-.844.188-1.594.094-2.438m-1.687-.281h-4.407c-.093 0-.187-.094-.28-.188-.095-.094-.188-.187-.188-.281v-3.844c0-.187.093-.281.187-.469a.716.716 0 0 1 .469-.187h1.031c.282 0 .563.094.938.188.281.093.656.28.937.562.469.469.75 1.031.938 1.688.187.656.375 1.312.468 1.968v.188c.094.281 0 .375-.093.375M6.156 3C4.188 3 2.594 4.594 2.594 6.469c0 1.968 1.594 3.468 3.562 3.468A3.46 3.46 0 0 0 9.625 6.47 3.46 3.46 0 0 0 6.156 3m1.688 3.188-2.25 1.968-1.219-1.125V5.72l1.219 1.125 2.25-2.063z"></path>
						</svg>
						<span>Efficient and Safe Logitics</span>
					</div>
					{isOpen && (
						<div className="security-item__bottom">
							<p>
								We ensure secure and efficient logistics. Track your order in real-time right from the order page. For added security, consider our optional "Shipping Protection" service. If your purchase encounters any delays, damage, or loss during delivery, rest assured, our insurance will cover your losses.
							</p>
							<div className="security-item__images">
								<img src="/img/security/3-1.webp" alt=""/>
								<img src="/img/security/3-2.webp" alt=""/>
								<img src="/img/security/3-3.webp" alt=""/>
								<img src="/img/security/3-4.webp" alt=""/>
								<img src="/img/security/3-5.webp" alt=""/>
								<img src="/img/security/3-6.webp" alt=""/>
							</div>
						</div>
					)}
				</div>

				<div className="security-item">
					<div className={`security-item__top ${isOpen ? 'open' : ''}`}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
							<path fill="currentColor"
							      d="M11.966 4.548c-3.109 0-5.628 2.467-5.628 5.51 0 3.044 2.52 5.51 5.628 5.51 3.109 0 5.628-2.466 5.628-5.51 0-3.043-2.52-5.51-5.628-5.51m-6.5 7.626V7.087a2.69 2.69 0 0 0-.21.008c1.153-2.504 3.721-4.247 6.71-4.247 2.99 0 5.559 1.743 6.712 4.247a2.677 2.677 0 0 0-.212-.008v5.087c1.436 0 2.6-1.14 2.6-2.544 0-.954-.537-1.785-1.33-2.22C18.616 4.26 15.565 2 11.965 2c-3.599 0-6.65 2.261-7.768 5.41a2.534 2.534 0 0 0-1.331 2.22c0 1.405 1.163 2.544 2.6 2.544m12.116 2.916a8.3 8.3 0 0 1-5.616 2.167 8.3 8.3 0 0 1-5.608-2.16C3.728 16.424 2 18.783 2 21.987h20c0-3.21-1.76-5.572-4.418-6.896"></path>
						</svg>
						<span>Customer Service</span>
					</div>
					{isOpen && (
						<div className="security-item__bottom">
							<p>
								If you encounter problems during or after shopping, don't hesitate to reach out. Our customer service team is here to assist you.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default SecurityComponent