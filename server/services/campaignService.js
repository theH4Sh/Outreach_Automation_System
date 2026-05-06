const sendDM = require('./DMbot')
const csv = require('csv-parser');
const fs = require('fs');
const Lead = require('../model/Lead')
const Campaign = require('../model/Campaign');
const { chromium } = require('playwright');

const runCampaign = async (campaign) => {
    try {
        const leadDocs = await Lead.find({
            _id: { $in: campaign.leads }
        });

        const leads = [];

        // wrap CSV reading in Promise so we can await it
        for (const leadDoc of leadDocs) {
            const fileData = await new Promise((resolve, reject) => {
                const results = [];

                fs.createReadStream(leadDoc.location)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', reject);
            });

            leads.push(...fileData);
        }
        
        const browser = await chromium.launchPersistentContext('auth.json',{
            headless: false,
        })

        const page = await browser.newPage();

        for (let i = campaign.progress; i < leads.length; i++) {
            const freshCampaign = await Campaign.findById(campaign._id);

            if (!freshCampaign || freshCampaign.status !== 'active') {
                console.log('Campaign stopped at index: ', i);
                return
            }

            await sendDM(page, leads[i], campaign.message);

            // save progress after each DM
            await Campaign.findByIdAndUpdate(campaign._id, {
                progress: i + 1
            })
        }

        await browser.close();

        // mark campaign as completed and reset progress

        await Campaign.findByIdAndUpdate(campaign._id, {
            status: 'completed',
            progress: 0
        })

    } catch (err) {
        console.error('Error executing campaign:', err);
    }
};

module.exports = runCampaign