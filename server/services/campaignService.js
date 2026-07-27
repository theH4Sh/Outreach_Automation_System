const Lead = require('../model/Lead')
const Campaign = require('../model/Campaign');
const BrowserProfile = require('../model/BrowserProfile');
const Log = require('../model/Log');
const AppError = require('../utils/AppError');
const runCampaign = require('./campaignRunner/runCampaign')
const validateObjectId = require('../utils/validateObjectId')
const retryFailed = require('./campaignRunner/retryFailed')

const getOwnedCampaign = async (id, userId) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findOne({ _id: id, createdBy: userId })
    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    return campaign
}

const createCampaignService = async ({ name, description, message, leads, browserProfile, createdBy }) => {
    if (!createdBy) {
        throw new AppError('Authentication required', 401);
    }

    if (!Array.isArray(leads)) {
        throw new AppError('Lead must be an array', 400);
    }

    for (const lead of leads) {
        validateObjectId(lead, 'Invalid lead ID');
    }

    const existingLeads = await Lead.find({
        _id: { $in: leads },
        user: createdBy,
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

const getCampaignsService = async (userId) => {
    return await Campaign.find({ createdBy: userId })
        .populate('browserProfile')
        .populate('leads')
        .sort({ createdAt: -1 })
}

const getCampaignByIdService = async (id, userId) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findOne({ _id: id, createdBy: userId })
        .populate('browserProfile')
        .populate('leads')

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    return campaign
}

const updateCampaignService = async (id, data, userId) => {
    const campaign = await getOwnedCampaign(id, userId);

    if (campaign.status === 'active' && data.message) {
        throw new AppError(
            'Cannot update message of an active campaign',
            400
        );
    }

    // Never allow ownership reassignment through update payloads
    const { createdBy, ...safeData } = data
    Object.assign(campaign, safeData)

    await campaign.save();

    return campaign;
}

const updateCampaignStatusService = async (id, status, operator = null) => {
    if (!operator?._id) {
        throw new AppError('Authentication required', 401)
    }

    const campaign = await getOwnedCampaign(id, operator._id);

    const allowedStatuses = [
        'active',
        'inactive'
    ]

    if (!allowedStatuses.includes(status)) {
        throw new AppError('Invalid status value', 400)
    }

    if (status === 'active' && campaign.status === 'active') {
        throw new AppError('Campaign is already active', 400);
    }

    campaign.status = status;

    if (status === 'active') {
        campaign.lastActivatedBy = operator._id
    }

    await campaign.save();

    if (status === 'active') {
        runCampaign(campaign, operator);
    }

    return campaign
}

const getCampaignLogsService = async (id, userId) => {
    await getOwnedCampaign(id, userId)

    return await Log.find({ campaignId: id }).sort({ runId: -1, createdAt: 1 })
}

const deleteCampaignService = async (id, userId) => {
    validateObjectId(id, 'Invalid campaign ID')

    const campaign = await Campaign.findOneAndDelete({ _id: id, createdBy: userId });

    if (!campaign) {
        throw new AppError('Campaign not found', 404)
    }

    return campaign
}

const retryFailedLeadsService = async (campaignId, runId, operator = null) => {
    if (!operator?._id) {
        throw new AppError('Authentication required', 401)
    }

    validateObjectId(runId, 'Invalid run ID')

    const campaign = await getOwnedCampaign(campaignId, operator._id);

    const failedLogs = await Log.find({
        campaignId,
        runId,
        success: false
    })

    const failedUsernames = failedLogs.map(log => ({
        username: log.username,
        name: log.name
    }))

    retryFailed(campaign, failedUsernames, operator)

    return {
        success: true,
        failedCount: failedUsernames.length,
        runId,
        campaignId: campaign._id,
    }
}

const scheduleCampaignService = async (campaignId, scheduledAt, userId) => {
    const campaign = await getOwnedCampaign(campaignId, userId);

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
