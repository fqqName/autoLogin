Write a professional E2E test for Wildberries using Cypress.

TASK:
Automate a purchasing scenario considering anti-bot protection and complex UI for parameter selection (size/color/quantity).

TECHNICAL REQUIREMENTS:

1. Use `Cypress.env` for the phone number.
2. Implement a `humanWait(min, max)` function for random delays to mimic human behavior.

SCENARIO (Workflow):

1. SETUP & BLOCKING:
   - In `beforeEach`, block advertising and tracking resources (google-analytics, yandex, mail.ru, WB internal ad banners) to speed up loading and reduce noise.
   - Set the User-Agent to match a standard real browser.

2. SMART LOGIN (Conditional):
   - Open the main page.
   - Check if the user is already authorized (look for a profile icon).
   - IF NO:
     - Navigate to the login page.
     - Type the phone number (insert a `humanWait` before typing).
     - Click "Get Code".
     - Execute `cy.pause()` so I can manually enter the SMS code.
     - After `resume`, verify that the login was successful.
   - IF YES: Continue execution.

3. SMART "ADD TO CART" (Critical):
   - Search for "men's t-shirt" (or any item that definitely has sizes).
   - Find the first two product cards in the results.
   - For each card, implement the following logic:
     - Hover over the card (trigger 'mouseover') to reveal the button.
     - Click "Add to Cart".
     - `humanWait(1000, 2000)`.
     - CONDITIONAL CHECK: If a popup/drawer with sizes appears (check the DOM for a size list container):
       - Find the first ACTIVE (not disabled/out-of-stock) size.
       - Click on it.
       - `humanWait(500, 1500)`.
     - Verify that the button state has changed (e.g., text became "In Cart" or a counter appeared).

4. CART CALCULATION:
   - Navigate to the Cart page.
   - `humanWait(2000, 3000)`.
   - Parse the prices of each item (convert string "1 500 ₽" -> number 1500).
   - Parse the "Total" sum.
   - Assert: The sum of the individual items === The Total sum.
   - `cy.log` the final calculated sum.

IMPORTANT:
The code must be robust enough to handle items that require size selection AND items that do not.
Use synchronous jQuery checks inside Cypress commands (e.g., `$('body').find(...)` inside a `.then()` block) for the size popup check. Do NOT use standard `cy.get()` for the popup, as it will cause the test to fail if the popup does not appear.

🚧 Rules & Constraints
🔴 Critical
No Hardcode: The phone number must never be written directly in the test code. It must be loaded from .env.

Timings & Timeouts: Do not delay entering the SMS code. The code typically expires within 60 seconds. If you do not click "Resume" in the Cypress Runner within the default command timeout, the test may fail.

Tip: You might need to increase defaultCommandTimeout in cypress.config.js for this specific test if you are slow at typing.

⚠️ Edge Cases
Captcha: If a CAPTCHA appears before the SMS step, cy.pause() allows you to solve it manually as well.

SMS Rate Limiting: Ensure the test does not spam SMS requests (e.g., inside a loop or retrying too fast), otherwise, the phone number will be blocked for 24 hours by Wildberries.

Dynamic UI (Sizes): The test must not fail if a product has no sizes to select. The logic for size selection must be strictly conditional (check if exists -> then click).

✅ Definition of Done (DoD)
The task is considered complete when the following criteria are met:

[ ] Repository Setup: A GitHub repository is created with a correct .gitignore (excluding .env and node_modules).

[ ] Environment: The .env file is configured with WB_TEST_PHONE.

[ ] Interactive Auth: The test successfully opens the login modal, enters the phone number, pauses at cy.pause(), and resumes successfully after the manual SMS entry.

[ ] Smart Cart Logic: The test successfully handles adding items to the cart, whether they require a size selection (popup/drawer) or not.

[ ] Human Simulation: The test execution is not detected as a bot (thanks to random humanWait gaps and ad-blocking).

[ ] Math Validation: The test asserts that the sum of the individual item prices in the cart equals the "Total" displayed value.

[ ] Documentation: The prompts.md file contains the history of Gemini requests used to generate the code.
