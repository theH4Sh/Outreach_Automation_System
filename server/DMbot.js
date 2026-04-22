const { chromium } = require('playwright');

const sendDM = async (leads, message) => {
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
			await page.waitForSelector('header', { timeout: 10000 });

			const isNotFound = await page
				.locator("text=Sorry, this page isn't available.")
				.isVisible()
				.catch(() => false);

				console.log("not found checked");

			const bodyText = await page.content('body');
			const isPrivate = bodyText.includes('This profile is private');

				console.log("private checked", isPrivate);

			const canDM = await page
				.getByRole('button', { name: 'Message', exact: true })
				.isVisible()
				.catch(() => false);

				console.log("can DM checked", canDM);
				
			if (isNotFound) {
				throw new Error('Profile not found');
			}

			if (isPrivate && !canDM) {
				throw new Error('Profile is private');
			}

			if (!canDM) {
				throw new Error('Cannot send DM to this profile');
			}

			await page.getByRole('button', { name: 'Message', exact: true }).click();
			const input = await page.getByRole('textbox')
			await input.type(message, { delay: 100 });
			await page.waitForTimeout(500);
			await page.keyboard.press('Enter')
			await page.waitForTimeout(500)
			console.log('message sent successfully to ' + lead.username)

		} catch (error) {
			console.log("Failed for " + lead.username, error.message);
		}
	}
	// browser.close();
}

module.exports = sendDM;