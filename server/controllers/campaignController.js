const catchAsync = require('../middleware/catchAsync');
const Campaign = require('../model/Campaign');
const Lead = require('../model/Lead')
const mongoose = require('mongoose');
const {
    runCampaign,
    createCampaignService,
    getCampaignsService,
    getCampaignByIdService,
    updateCampaignService,
    updateCampaignStatusService,
    deleteCampaignService
} = require('../services/campaignService');

// Create a new campaign
const createCampaign = catchAsync(async (req, res) => {
    const campaign = await createCampaignService(req.body);

    res.status(201).json(campaign);
})

// Get all campaigns
const getCampaigns = catchAsync(async (req, res) => {
    const campaigns = await getCampaignsService();

    res.status(200).json(campaigns);
})

// Get a campaign by ID
const getCampaignById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campaign = await getCampaignByIdService(id)

    res.status(200).json(campaign)
})

// Update a campaign by ID
const updateCampaign = catchAsync(async (req, res) => {
    const campaign = await updateCampaignService(
        req.params.id,
        req.body
    )

    res.status(200).json(campaign);
})

// Delete a campaign by ID
const deleteCampaign = catchAsync(async (req, res) => {
    const campaign = await deleteCampaignService(req.params.id)

    res.status(200).json(campaign);
})

// Update campaign status [active/inactive]
const updateCampaignStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const campaign = await updateCampaignStatusService(
        id, status
    )

    res.status(200).json(campaign);
});

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign
}