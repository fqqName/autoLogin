const newLocal = describe('Wildberries Login Flow', () => {
	it('Executes Login Flow with Phone Typing', () => {
		// 1. Open baseUrl
		cy.visit('/')

		// 2. Wait 2 seconds
		cy.wait(2000)

		// 3. Open secondUrl
		const secondUrl =
			Cypress.config('secondUrl') || 'https://www.wildberries.by/security/login'
		cy.visit(secondUrl)

		// 4. Wait 2 seconds
		cy.wait(2000)

		// 5. Select Country (+375)
		cy.log('Opening Country List...')
		cy.get('div[data-class="btn"]').should('be.visible').click()
		cy.wait(500)
		cy.contains('+375').should('be.visible').click()

		// 6. Type Phone Number (User Provided Logic)
		const phone = Cypress.env('WB_TEST_PHONE')

		cy.log(`Typing phone number: ${phone}`)
		// Using stable selector [data-testid="phoneInput"]
		cy.get('[data-testid="phoneInput"]')
			.should('be.visible')
			.click()
			.type(phone, { delay: 100 })

		cy.log('Phone typed. Clicking Get Code...')

		// Wait for button to be enabled
		cy.wait(1000)

		cy.get('[data-testid="requestCodeBtn"]')
			.should('be.visible')
			.and('not.be.disabled')
			.click()

		/// wait for "Запросите код повторно"
		cy.wait(70000)
		cy.log('cy.wait(70000) finished')
		cy.contains('Запросите код повторно').should('be.visible')
		cy.log('Waiting for "Запросите код повторно" button')

		cy.get('[data-test-id="auth-code-confirmation-get-code-btn"]')
			.should('be.visible') // Убеждаемся, что она видна
			.and('not.be.disabled') // Убеждаемся, что она стала активной (не серая)
			.click()

		cy.pause()

		cy.log('Waiting for SMS via ADB...')

		// Run the bash script to get the SMS code
		// Timeout set to 65s to accommodate the 60s script timeout
		// Запускаем скрипт ожидания СМС
		// ... вы уже нажали кнопку "Получить код"

		// Запускаем скрипт чтения базы данных SMS
		// timeout: 65000 (чуть больше, чем ждет скрипт внутри, чтобы Cypress не убил его раньше времени)
		cy.exec('./get_sms_db.sh', { timeout: 65000 })
			.then(result => {
				// Очищаем результат
				const code = result.stdout.trim()

				// Проверка на ошибки
				if (
					!code ||
					code.includes('Timeout') ||
					code.includes('inaccessible') ||
					code.includes('Permission denied')
				) {
					// Если база недоступна, выводим понятную ошибку
					throw new Error(
						'❌ Ошибка доступа к SMS. Убедитесь, что выполнен "adb root" или используйте метод через уведомления.',
					)
				}

				// 1. Лог в Cypress
				cy.log('-------------------------------------------')
				cy.log(`🚀 КОД ИЗ БАЗЫ (DB): ${code}`)
				cy.log('-------------------------------------------')

				// 2. Лог в консоль браузера
				console.log(
					'%c 💾 DB SMS CODE: ' + code,
					'background: #000080; color: #fff; font-size: 20px; padding: 10px;',
				)

				return cy.wrap(code)
			})
			.then(code => {
				// Вводим код
				cy.get('[data-testid="smsCodeInput"]').should('be.visible').type(code)
			})
	})
})
// })
