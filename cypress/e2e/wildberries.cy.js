describe('Wildberries Purchasing Scenario', () => {
	const PHONE_NUMBER = Cypress.env('WB_TEST_PHONE')

	beforeEach(() => {
		// 1. SETUP & BLOCKING
		// Block advertising and tracking resources
		cy.intercept('**google-analytics.com**', { statusCode: 503 })
		cy.intercept('**yandex.ru**', { statusCode: 503 })
		cy.intercept('**mail.ru**', { statusCode: 503 })
		cy.intercept('**wb-internal-ad-banners**', { statusCode: 503 }) // Hypothetical pattern
		// Add more specific patterns if known or discovered during debugging

		// Set User-Agent (Cypress allows this via config or per request, but visiting the page sets it for the session mostly)
		// Ideally handled in config, but we can try to influence headers.
		// Actually, just relying on standard Cypress UA is often fine, or configured in `cypress.config.js` (userAgent property).
		// Let's assume standard behavior for now unless specified closer.
		// The prompt asked to "Set the User-Agent to match a standard real browser".
		// We can do this in the visit options or config. Let's do it in config or here.
		// Doing it in visit options for the main page load:
	})

	it('Complete E2E Purchase Flow', () => {
		// Override User Agent for this test
		const userAgent =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

		// 2. SMART LOGIN
		cy.visit('/', {
			headers: {
				'User-Agent': userAgent,
			},
			onBeforeLoad: win => {
				Object.defineProperty(win.navigator, 'userAgent', { value: userAgent })
			},
		})

		// Check if authorized
		cy.get('body').then($body => {
			// Adjust current selector logic based on actual WB DOM.
			// Profile icon usually has a specific class or link.
			// Assuming a selector for profile/avatar.
			// If not found, we login.
			// "navbar-pc__icon--profile" or similar.
			const isAuthorized =
				$body.find('.navbar-pc__icon--profile').length > 0 ||
				$body.text().includes('Профиль')

			if (!isAuthorized) {
				cy.log('User not authorized. Proceeding to login.')
				// Navigate to login
				cy.get('.j-main-login').click() // Adjust selector

				cy.humanWait(1000, 2000)

				// Type phone number
				cy.get('.input-item').type(PHONE_NUMBER) // Adjust selector
				cy.humanWait(500, 1000)

				cy.contains('button', 'Получить код').click()

				// Pause for manual SMS entry
				cy.log('Please enter the SMS code manually and then resume the test.')
				cy.pause()

				// Verification of login success
				cy.get('.navbar-pc__icon--profile', { timeout: 10000 }).should('exist')
			} else {
				cy.log('User already authorized.')
			}
		})

		// 3. SMART "ADD TO CART"
		cy.get('#searchInput').type('мужская футболка{enter}')
		cy.humanWait(2000, 3000)

		// Select first two cards
		cy.get('.product-card-list .product-card').eq(0).as('card1')
		cy.get('.product-card-list .product-card').eq(1).as('card2')

		const addProductToCart = cardAlias => {
			cy.get(cardAlias).scrollIntoView().trigger('mouseover')
			cy.humanWait(500, 1000)

			// Find "Add to Cart" button within the card
			cy.get(cardAlias).find('.product-card__add-basket').click({ force: true }) // "In basket" or cart icon
			cy.humanWait(1000, 2000)

			// Conditional size check using jQuery sync logic
			cy.get('body').then($body => {
				// Check for size popup/drawer presence
				// Selector needs to be accurate for WB. e.g. .popup-list-of-sizes
				const $sizePopup = $body.find('.popup-list-of-sizes, .sizes-list-block')

				if ($sizePopup.length > 0 && $sizePopup.is(':visible')) {
					cy.log('Size selection required.')
					// Find first active size
					const $activeSizes = $sizePopup.find(
						'.sizes-list__item:not(.disabled)',
					)
					if ($activeSizes.length > 0) {
						cy.wrap($activeSizes.first()).click()
						cy.humanWait(500, 1500)
					} else {
						cy.log('No active sizes found!')
					}
				} else {
					cy.log('No size selection required or popup not found.')
				}
			})

			// Verify button state changed?
			// WB often replaces the button or adds a counter.
			// For now, relying on lack of error and flow continuation.
		}

		addProductToCart('@card1')
		cy.humanWait(1000, 2000)
		addProductToCart('@card2')

		// 4. CART CALCULATION
		cy.get('.navbar-pc__icon--basket').click()
		cy.humanWait(2000, 3000)

		// Parse prices
		let totalSumOptimistic = 0

		cy.get('.list-item__price-new')
			.each($el => {
				const priceText = $el.text().replace(/\s/g, '').replace('₽', '')
				const price = parseInt(priceText, 10)
				totalSumOptimistic += price
				cy.log(`Item price: ${price}`)
			})
			.then(() => {
				cy.log(`Calculated Total: ${totalSumOptimistic}`)

				// Get displayed total
				cy.get('.b-top__total .total-price__sum').then($totalEl => {
					const totalText = $totalEl.text().replace(/\s/g, '').replace('₽', '')
					const displayedTotal = parseInt(totalText, 10)

					expect(totalSumOptimistic).to.eq(displayedTotal)
				})
			})
	})
})
