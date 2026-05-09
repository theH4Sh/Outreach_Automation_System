const { chromium } = require('playwright');

const createBrowser = async () => {
    return await chromium.launchPersistentContext('auth.json',{
        headless: false,
    })
}

module.exports = createBrowser