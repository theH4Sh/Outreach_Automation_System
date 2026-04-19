const { chromium } = require('playwright');

const sendDM = async (link) => {
	const browser = await chromium.launchPersistentContext(
		'auth.json',
	{
		headless: false,
	})

	const page = await browser.newPage();

	await page.goto(link)
	await page.getByRole('button', { name: 'Message', exact: true }).click();
	const input = await page.getByRole('textbox')
	await input.type('test message', { delay: 100 });
	await page.waitForTimeout(500);
	await page.keyboard.press('Enter')
	await page.waitForTimeout(500)
	console.log('message sent successfully')

	browser.close();
}

module.exports = sendDM;