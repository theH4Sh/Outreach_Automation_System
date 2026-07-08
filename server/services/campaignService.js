const Lead = require('../model/Lead')
const Campaign = require('../model/Campaign');
const BrowserProfile = require('../model/BrowserProfile');
const Log = require('../model/Log');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const runCampaign = require('./campaignRunner/runCampaign')
const validateObjectId = require('../utils/validateObjectId')
const retryFailed = require('./campaignRunner/retryFailed')
const resolveCampaignOperator = require('../utils/resolveCampaignOperator')

const createCampaignService = async ({ name, description, message, leads, browserProfile, createdBy }) => {
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

    validateObjectId(browserProfile, 'Invalid browser profile ID');

    const browserProfileExists = await BrowserProfile.findById(browserProfile);
    if (!browserProfileExists) {
        throw new AppError('Browser profile not found', 404);
    }

    const campaign = new Campaign({ name, description, message, leads, browserProfile, createdBy });
    return await campaign.save();
}

const getCampaignsService = async () => {
    return await Campaign.find().populate('browserProfile').populate('leads')
}

const getCampaignByIdService = async (id) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findById(id).populate('browserProfile').populate('leads')
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

const updateCampaignStatusService = async (id, status, operator = null) => {
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

    if (status === 'active' && campaign.status === 'active') {
        throw new AppError('Campaign is already active', 400);
    }

    campaign.status = status;

    if (status === 'active' && operator?._id) {
        campaign.lastActivatedBy = operator._id
        if (!campaign.createdBy) {
            campaign.createdBy = operator._id
        }
    }

    await campaign.save();

    if (status === 'active') {
        runCampaign(campaign, operator);
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

const retryFailedLeadsService = async (campaignId, runId, operator = null) => {
    validateObjectId(campaignId, 'Invalid campaign ID')
    validateObjectId(runId, 'Invalid run ID')

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    const failedLogs = await Log.find({
        campaignId,
        runId,
        success: false
    })

    const failedUsernames = failedLogs.map(log => ({
        username: log.username,
        name: log.name
    }))

    console.log('Failed usernames: ', failedUsernames)

    retryFailed(campaign, failedUsernames, operator)

    return {
        success: true,
        failedCount: failedUsernames.length,
        runId,
        campaignId: campaign._id,
    }
}

const scheduleCampaignService = async (campaignId, scheduledAt) => {
    validateObjectId(campaignId, 'Invalid campaign ID')

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    if (campaign.status === 'active') {
        throw new AppError('Cannot schedule an active campaign', 400)
    }

    campaign.scheduledAt = new Date(scheduledAt);
    campaign.status = 'scheduled';

    await campaign.save();

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
    deleteCampaignService,
    retryFailedLeadsService,
    scheduleCampaignService
}