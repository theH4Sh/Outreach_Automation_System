const { chromium } = require('playwright');
require('dotenv').config();
(async () => {
	const browser = await chromium.launch({
		// executablePath: '/usr/bin/brave-browser',
		headless: false,
		// args: ['--no-sandbox', '--disable-dev-shm-usage']
	});

	const context = await browser.newContext();
	const page = await context.newPage();

	page.setDefaultTimeout(0);
	page.setDefaultNavigationTimeout(0);

	await page.goto('https://www.instagram.com/');
	console.log('Page Title: ', await page.title());
	await page.getByLabel('Mobile number, username or email').type(process.env.USERNAME, { delay: 500 })
	console.log('username typed')
	await page.getByLabel('Password').type(process.env.PASSWORD, { delay: 500 })
	console.log('Password Typed')
	await page.waitForTimeout(500 + Math.random() * 1000);
	await page.locator('[aria-label="Log In"]').click()
	console.log('logging in...')
	
	console.log('redirected')
	await page.context().storageState({ path: 'auth.json' });
	console.log('Auth state saved successfully')

	//browser.close()
})();