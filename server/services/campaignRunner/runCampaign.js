const loadLeads = require('./loadLeads')
const createBrowser = require('../browserService');
const sendDM = require('../../engine/DMbot')

const Campaign = require('../../model/Campaign')

const compileTemplate = require('../../utils/compileTemplate')

const runCampaign = async (campaign) => {
    const leads = await loadLeads(campaign)
    const browser = await createBrowser();
    try {
        const page = await browser.newPage();

        for (let i = campaign.progress; i < leads.length; i++) {
            const freshCampaign = await Campaign.findById(campaign._id);

            if (!freshCampaign || freshCampaign.status !== 'active') {
                console.log('Campaign stopped at index: ', i);
                return
            }

            const message = compileTemplate(campaign.message, leads[i])

            await sendDM(page, leads[i], message);

            // save progress after each DM
            await Campaign.findByIdAndUpdate(campaign._id, {
                progress: i + 1
            })
        }

        // mark campaign as completed and reset progress

        await Campaign.findByIdAndUpdate(campaign._id, {
            status: 'completed',
            progress: 0
        })

    } catch (err) {
        console.error('Error executing campaign:', err);
    } finally {
        await browser.close();
    }
};

module.exports = runCampaign;