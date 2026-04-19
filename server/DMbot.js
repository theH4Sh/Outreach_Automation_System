const { chromium } = require('playwright');

const sendDM = async (leads) => {
	const browser = await chromium.launchPersistentContext(
		'auth.json',
	{
		headless: false,
	})

	const page = await browser.newPage();
	for (const lead of leads) {
		const link = `https://www.instagram.com/${lead.username}`

		try {
			await page.goto(link, { waitUntil: 'domcontentloaded' });

			const isNotFound = await page
				.locator("text=Sorry, this page isn't available.")
				.isVisible()
				.catch(() => false);

			if (isNotFound) {
				throw new Error('Profile not found');
				return;
			}
			await page.getByRole('button', { name: 'Message', exact: true }).click();
			const input = await page.getByRole('textbox')
			await input.type('test message 123', { delay: 100 });
			await page.waitForTimeout(500);
			await page.keyboard.press('Enter')
			await page.waitForTimeout(500)
			console.log('message sent successfully to ' + lead.username)

		} catch (error) {
			console.log("Failed for " + lead.username)
		}
	}
	browser.close();
}

module.exports = sendDM;