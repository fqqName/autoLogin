describe('Wildberries Login Flow', () => {
	it('Executes Login Flow with Phone Typing and SMS', () => {
		// 1. Open baseUrl
		cy.visit('/')

		// 2. Wait 2 seconds (для стабильности загрузки)
		cy.wait(2000)

		// 3. Open secondUrl
		// Используем переменную или дефолтное значение
		const secondUrl =
			Cypress.env('secondUrl') || 'https://www.wildberries.by/security/login'
		cy.visit(secondUrl)

		// 4. Wait 2 seconds
		cy.wait(2000)

		// 5. Select Country (+375)
		cy.log('Opening Country List...')
		// Используем force:true на случай перекрытия элементов
		cy.get('div[data-class="btn"]').should('be.visible').click()

		// Ждем анимацию списка
		cy.wait(500)
		cy.contains('+375').should('be.visible').click()

		// 6. Type Phone Number
		const phone = Cypress.env('WB_TEST_PHONE')

		// Проверка, что телефон задан
		if (!phone) throw new Error('Не задана переменная окружения WB_TEST_PHONE')

		cy.log(`Typing phone number: ${phone}`)

		// Ввод номера
		cy.get('[data-testid="phoneInput"]')
			.should('be.visible')
			.click()
			.type(phone, { delay: 100 })

		cy.log('Phone typed. Clicking Get Code...')

		// 7. Click "Get Code"
		cy.wait(1000) // Даем UI "остыть" после ввода
		cy.get('[data-testid="requestCodeBtn"]')
			.should('be.visible')
			.and('not.be.disabled')
			.click()

		// 8. Wait for "Запросите код повторно"
		// Мы специально ждем 70 сек, чтобы протестировать именно повторную отправку
		cy.log('Waiting 70s for retry button...')
		cy.wait(70000)

		// Клик по кнопке повторной отправки
		// cy.get('[data-test-id="auth-code-confirmation-get-code-btn"]')
		// .should('be.visible')
		// .and('not.be.disabled')
		// .click()

		cy.log('Waiting for SMS via ADB...')

		// 9. 🧹 ОЧИСТКА: Удаляем старые уведомления с телефона
		// Это гарантирует, что следующий найденный код будет НОВЫМ
		cy.log('Cleaning old notifications...')
		cy.exec('adb shell service call notification 1', {
			failOnNonZeroExit: false,
		})
		cy.wait(1000) // Даем секунду на удаление

		// 10. 🖱️ КЛИК: Нажимаем "Запросить код повторно"
		cy.get('[data-test-id="auth-code-confirmation-get-code-btn"]')
			.should('be.visible')
			.and('not.be.disabled')
			.click()
		cy.exec('./get_notification_sms.sh', { timeout: 65000 })
			.then(result => {
				const output = result.stdout.trim()

				// Проверка на ошибки скрипта
				if (
					!output ||
					output.includes('Timeout') ||
					output.includes('Error') ||
					output.includes('Permission denied')
				) {
					throw new Error(`❌ Ошибка получения СМС: ${output}`)
				}

				const code = output

				// Логирование
				cy.log('-------------------------------------------')
				cy.log(`🚀 КОД ПОЛУЧЕН: ${code}`)
				cy.log('-------------------------------------------')
				console.log(
					`%c 🔥 CODE: ${code}`,
					'background: #222; color: #bada55; font-size: 20px;',
				)

				return cy.wrap(code)
			})
			.then(code => {
				// 10. Type SMS Code
				cy.get('[data-testid="smsCodeInput"]').should('be.visible').type(code)
			})
	})
})
