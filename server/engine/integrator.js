const { chromium } = require('playwright');
require('dotenv').config();
const integrator = async (profileName) => {
	try {
		const browser = await chromium.launchPersistentContext(`./profiles/${profileName}`,{
			// executablePath: '/usr/bin/brave-browser',
			headless: false, viewport: null
			// args: ['--no-sandbox', '--disable-dev-shm-usage']
		});
		
		const page = await browser.newPage();

		page.setDefaultTimeout(0);
		page.setDefaultNavigationTimeout(0);

		await page.goto('https://www.instagram.com/');
		console.log('Page Title: ', await page.title());
		// const username = 'username'
		// await page.getByLabel('Mobile number, username or email').type(username, { delay: 500 })
		// console.log('username typed')
		// await page.getByLabel('Password').type(process.env.PASSWORD, { delay: 100 })
		// console.log('Password Typed')
		// await page.waitForTimeout(500 + Math.random() * 1000);
		// await page.locator('[aria-label="Log In"]').click()
		// console.log('logging in...')
		
		// console.log('redirected')

		// await page.waitForTimeout(30000);
		// console.log("URL after login:", page.url());

		const saveInfoBtn = page.locator('button:has-text("Save info")');

		await saveInfoBtn.waitFor({ state: 'visible', timeout: 0 });
		await saveInfoBtn.click();

		console.log("Save info clicked");

		// await page.context().storageState({ path: 'pauth.json' });
		// console.log('Auth state saved successfully')

		//browser.close()
	} catch (error) {
		console.error('Integration failed:', error);
		throw error; // Rethrow the error to be caught by the controller's catchAsync
	}
};

module.exports = integrator;