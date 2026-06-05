const Lead = require('../model/Lead')
const Campaign = require('../model/Campaign');
const Log = require('../model/Log');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const runCampaign = require('./campaignRunner/runCampaign')
const validateObjectId = require('../utils/validateObjectId')

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

const updateCampaignStatusService = async (id, status) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    const allowedStatuses = [
        'active',
        'inactive'
    ]

    if (!allowedStatuses.includes(status)) {
        throw new AppError ('Invalid status value', 400)
    }

    //START
    if (status === 'active' && campaign.status === 'active') {

        throw new AppError('Campaign is already active', 400);
    }

    campaign.status = status;
    await campaign.save();

    if (status === 'active') {
        runCampaign(campaign);
    }

    return campaign
}

const getCampaignLogsService = async (id) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id);
    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    return await Log.find({ campaignId: id }).sort({ runId: -1, createdAt: 1 })
}

const deleteCampaignService = async (id) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    return campaign
}

module.exports = {
    createCampaignService,
    getCampaignsService,
    getCampaignByIdService,
    getCampaignLogsService,
    updateCampaignService,
    runCampaign,
    updateCampaignStatusService,
    deleteCampaignService
}