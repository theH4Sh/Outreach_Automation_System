const { chromium } = require('playwright');

const scraper = async (link) => {
    const browser = await chromium.launchPersistentContext('auth.json',{
        headless: false, // Set to false if you want to see the browser
    });
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: 'networkidle', timeout: 300000 });
    // await page.waitForSelector('header', { timeout: 10000 });


    const comments = await page.$$eval("a[href^='/'][role='link']", (elements) => [
            ... new Set(
                elements.map(el => el.getAttribute('href'))
                    .filter(href => href && /^\/[a-zA-Z0-9._]+\/$/.test(href))
                    .map(href => href.split('/').filter(Boolean)[0])
            )
        ]
    );

    // console.log(`Found ${comments.length} unique usernames.`);

    const leads = []

    for (const username of comments) {
        // console.log(`Processing username: ${username}`);
        if (['reels', 'explore', 'popular'].includes(username)) {
            continue; // Skip unwanted usernames
        }

        const profileLink = `https://www.instagram.com/${username}/`;
        await page.goto(profileLink, { waitUntil: 'domcontentloaded' });

        await page.waitForSelector('header');

        const spans = await page
            .locator('header span[dir="auto"]')
            .allTextContents();

        const name = spans[0] || '';
        const posts = spans[1] || '';
        const followers = spans[2] || '';
        const following = spans[3] || '';
        const bio = spans[4] || '';

        // console.log('-----------------------------');
        // console.log(`Profile Link: ${profileLink}`);
        // console.log(`Username: ${username}`);
        // console.log(`Name: ${name}`);
        // console.log(`Posts: ${posts}`);
        // console.log(`Followers: ${followers}`);
        // console.log(`Following: ${following}`);
        // console.log(`Bio: ${bio}`);
        // console.log('-----------------------------');

        leads.push({
            profileLink,
            username,
            name,
            posts,
            followers,
            following,
            bio
        });
    }

    await browser.close();
    return leads
}

module.exports = scraper