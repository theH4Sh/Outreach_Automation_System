const { chromium } = require('playwright');
const BrowserProfile = require('../model/BrowserProfile');

const createBrowser = async (browserProfileId) => {
    const profileDoc = await BrowserProfile.findById(browserProfileId);

    if (!profileDoc) {
        throw new Error('Browser profile not found');
    }

    const profilePath = 'profiles/' + profileDoc.profileName;
    return await chromium.launchPersistentContext(profilePath,{
        headless: false,
    })
}

module.exports = createBrowser