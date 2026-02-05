describe('Add Product Test', () => {
	it('should open wildberries.by', () => {
		cy.visit('https://www.wildberries.by')
		cy.wait(2000)
		// cy.visit(Cypress.env('secondUrl'))

		const product = Cypress.env('WB_TEST_PRODUCT')
		const color = Cypress.env('WB_TEST_PRODUCT_COLOR')
		const size = Cypress.env('WB_TEST_PRODUCT_SIZE')

		if (!product) {
			throw new Error('WB_TEST_PRODUCT env var is missing')
		}

		cy.log(`Searching for product: ${product}`)

		// Wait for search input to be visible and type the query
		cy.get('[data-testid="searchInput"]')
			.should('be.visible')
			.click()
			.type(`${product}{enter}`)

		cy.wait(3000) // Wait for results to load

		cy.log('Selecting the first product...')
		cy.get('a.product-card__link').first().click()
		cy.wait(2000) // Wait for product page to load
	})
})
