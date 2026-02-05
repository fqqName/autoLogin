const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			config.env.WB_TEST_PHONE = process.env.WB_TEST_PHONE
			config.env.WB_TEST_PRODUCT = process.env.WB_TEST_PRODUCT
			config.env.WB_TEST_PRODUCT_COLOR = process.env.WB_TEST_PRODUCT_COLOR
			config.env.WB_TEST_PRODUCT_SIZE = process.env.WB_TEST_PRODUCT_SIZE
			config.env.WB_TEST_SECOND_PRODUCT = process.env.WB_TEST_SECOND_PRODUCT

			on('before:browser:launch', (browser = {}, launchOptions) => {
				if (browser.family === 'chromium' && browser.name !== 'electron') {
					const path = require('path')
					const userDataDir = path.join(__dirname, 'cypress', 'browser_profile')
					launchOptions.args.push(`--user-data-dir=${userDataDir}`)
					launchOptions.args.push('--no-first-run')
					launchOptions.args.push('--no-default-browser-check')
				}
				return launchOptions
			})

			return config
		},
		defaultCommandTimeout: 10000, // Increased timeout for robustness
		viewportWidth: 1280,
		viewportHeight: 720,
		chromeWebSecurity: false,
		baseUrl: 'https://www.wildberries.by',
		secondUrl: 'https://www.wildberries.by/security/login',
		basketUrl: 'https://www.wildberries.by/lk/basket',
	},
})
