const loadLeads = require('./loadLeads')
const createBrowser = require('../browserService');
const sendDM = require('../../engine/DMbot')

const Campaign = require('../../model/Campaign')

const compileTemplate = require('../../utils/compileTemplate')
const logger = require('../../utils/campaignLogger')

const mongoose = require('mongoose')
const resolveCampaignOperator = require('../../utils/resolveCampaignOperator')

const retryFailed = async (campaign, failedLeads, operator = null) => {
    const runId = new mongoose.Types.ObjectId()
    const owner = await resolveCampaignOperator(campaign._id, operator)
    const sentBy = owner?.username || 'Unknown'
    const sentById = owner?._id || null

    const leads = failedLeads
    const browser = await createBrowser(campaign.browserProfile);
    try {
        const page = await browser.newPage();
        console.log('Retrying failed leads: ', leads)

        for (let i = 0; i < leads.length; i++) {
            const freshCampaign = await Campaign.findById(campaign._id);

            const message = compileTemplate(campaign.message, leads[i])

            console.log("message: ", message)

            const result = await sendDM(page, leads[i], message);

            logger.emit('log', {
                campaignId: campaign._id,
                runId: runId,
                success: result.success,
                username: result.username,
                sentBy,
                sentById,
                name: leads[i].name,
                message: result.message
            })

            progress = i + 1

            logger.emit('progress', {
                campaignId: campaign._id,
                progress: i + 1,
                total: leads.length,
                percentage: Math.round((progress / leads.length) * 100)
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

module.exports = retryFailed