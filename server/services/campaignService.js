const sendDM = require('../engine/DMbot')
const csv = require('csv-parser');
const fs = require('fs');
const Lead = require('../model/Lead')
const Campaign = require('../model/Campaign');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const { chromium } = require('playwright');

const validateObjectId = (id, message) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(message, 400);
    }
}

const createCampaignService = async ({ name, description, message, leads }) => {
    if (!Array.isArray(leads)) {
        throw new AppError('Lead must be an array', 400);
    }

    for (const lead of leads) {
        validateObjectId(lead, 'Invalid lead ID');
    }

    //check the existence of leads
    const existingLeads = await Lead.find({
        _id: { $in: leads }
    })

    if (existingLeads.length !== leads.length) {
        throw new AppError('One or more leads not found', 404);
    }

    const campaign = new Campaign({ name, description, message, leads });
    return await campaign.save();
}

const getCampaignsService = async () => {
    return await Campaign.find();
}

const getCampaignByIdService = async (id) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id)
    if (!campaign) {
        throw new AppError ('Campaign not found', 404)
    }

    return campaign
}

const updateCampaignService = async (id, data) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    //campaign.name = data.name || campaign.name;
    //campaign.description = data.description || campaign.description;

    if (campaign.status === 'active' && data.message) {
        throw new AppError(
            'Cannot update message of an active campaign',
            400
        );
    }

    //campaign.message = data.message || campaign.message;

    Object.assign(campaign, data)

    await campaign.save();

    return campaign;
}

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

const updateCampaignStatusService = async (id, status) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id);
    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    //START
    if (status === 'active') {

        if (campaign.status === 'active') {
            throw new AppError('Campaign is already active', 400);
        }

        campaign.status = 'active';
        await campaign.save();

        runCampaign(campaign);
    }
    //END
    else if (status === 'inactive') {
        campaign.status = 'inactive';
        await campaign.save();
    }
    else {
        throw new AppError('Invalid status value', 400)
    }

    return campaign
}

module.exports = {
    createCampaignService,
    getCampaignsService,
    getCampaignByIdService,
    updateCampaignService,
    runCampaign,
    updateCampaignStatusService
}