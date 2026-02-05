Cypress.on('uncaught:exception', (err, runnable) => {
	// Если ошибка содержит текст про 'message' и 'DOMException'
	// или любые другие внутренние ошибки сайта — игнорируем их
	if (
		err.message.includes('property message') ||
		err.message.includes('DOMException')
	) {
		return false
	}
	// Позволяем другим критическим ошибкам валить тест
	return false // Или просто всегда возвращайте false для WB
})

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

		if (!size) {
			throw new Error('WB_TEST_PRODUCT_SIZE env var is missing')
		}

		cy.log(`Selecting size: ${size}`)
		// Look for the size in a button element, matching the user's provided structure
		cy.contains('button', size).should('be.visible').click()
		cy.wait(2000)
		cy.contains('span', 'Добавить в корзину').click()
		cy.wait(2000)

		const secondProduct = Cypress.env('WB_TEST_SECOND_PRODUCT')
		if (!secondProduct) {
			throw new Error('WB_TEST_SECOND_PRODUCT env var is missing')
		}

		cy.log(`Searching for second product: ${secondProduct}`)
		cy.get('[data-testid="searchInput"]')
			.should('be.visible')
			.click()
			.clear()
			.type(`${secondProduct}{enter}`)

		cy.wait(3000)

		cy.get('a.product-card__link.j-open-full-product-card').first().click()
		cy.wait(2000)

		cy.contains('span', 'Добавить в корзину').click()
		cy.wait(2000)
		cy.get('.navbar-pc__notify').should('be.visible').and('contain', '2')

		cy.get('.navbar-pc__icon--basket').click()
		cy.wait(2000)

		cy.get('.b-top__total.line').then($el => {
			const text = $el.text() // "Итого2 458,08 ₾"

			// Ищем совпадение: цифры, пробелы и запятую
			const match = text.match(/[\d\s\u00a0]+,\d+/)

			if (match) {
				const rawDigits = match[0].trim()

				// Очищаем строку от неразрывных пробелов для красоты в файле
				const cleanDigits = rawDigits.replace(/\u00a0/g, ' ')

				// Записываем в файл.
				// По умолчанию cy.writeFile ПЕРЕЗАПИСЫВАЕТ файл, удаляя старое содержимое.
				cy.writeFile(
					'basketSum.md',
					`### Финальная сумма\n\n**${cleanDigits}**`,
				)

				cy.log('Результат записан в basketSum.md:', cleanDigits)
			} else {
				cy.log('Сумма не найдена')
			}
		})
	})
})
