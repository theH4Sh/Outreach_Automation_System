const catchAsync = require('../middleware/catchAsync');
const {
    createCampaignService,
    getCampaignsService,
    getCampaignByIdService,
    getCampaignLogsService,
    updateCampaignService,
    updateCampaignStatusService,
    deleteCampaignService,
    retryFailedLeadsService,
    scheduleCampaignService
} = require('../services/campaignService');

const createCampaign = catchAsync(async (req, res) => {
    const campaign = await createCampaignService({
        ...req.body,
        createdBy: req.user._id,
    });

    res.status(201).json(campaign);
})

const getCampaigns = catchAsync(async (req, res) => {
    const campaigns = await getCampaignsService(req.user._id);

    res.status(200).json(campaigns);
})

const getCampaignById = catchAsync(async (req, res) => {
    const campaign = await getCampaignByIdService(req.params.id, req.user._id)

    res.status(200).json(campaign)
})

const updateCampaign = catchAsync(async (req, res) => {
    const campaign = await updateCampaignService(
        req.params.id,
        req.body,
        req.user._id
    )

    res.status(200).json(campaign);
})

const deleteCampaign = catchAsync(async (req, res) => {
    const campaign = await deleteCampaignService(req.params.id, req.user._id)

    res.status(200).json(campaign);
})

const getCampaignLogs = catchAsync(async (req, res) => {
    const logs = await getCampaignLogsService(req.params.id, req.user._id)
    res.status(200).json(logs)
})

const updateCampaignStatus = catchAsync(async (req, res) => {
    const campaign = await updateCampaignStatusService(
        req.params.id,
        req.body.status,
        req.user
    )

    res.status(200).json(campaign);
});

const retryFailedLeads = catchAsync(async (req, res) => {
    const result = await retryFailedLeadsService(
        req.params.id,
        req.query.runId,
        req.user
    )

    res.status(200).json(result)
})

const scheduleCampaign = catchAsync(async (req, res) => {
    const campaign = await scheduleCampaignService(
        req.params.id,
        req.body.scheduledAt,
        req.user._id
    );

    res.status(200).json(campaign);
});

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    getCampaignLogs,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
    retryFailedLeads,
    scheduleCampaign
}
