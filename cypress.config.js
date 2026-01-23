const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
			config.env.WB_TEST_PHONE = process.env.WB_TEST_PHONE
			return config
		},
		defaultCommandTimeout: 10000, // Increased timeout for robustness
		viewportWidth: 1280,
		viewportHeight: 720,
		baseUrl: 'https://www.wildberries.by',
	},
})
