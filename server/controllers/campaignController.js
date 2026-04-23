const Campaign = require('../model/Campaign');
const mongoose = require('mongoose');

// Create a new campaign
const createCampaign = async (req, res, next) => {
    try {
        const { name, description, message } = req.body;
        const campaign = new Campaign({ name, description, message });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error('Error creating campaign:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get all campaigns
const getCampaigns = async (req, res, next) => {
    try {
        const campaigns = await Campaign.find();

        if (campaigns.length === 0) {
            return res.status(404).json({ error: 'No campaigns found' });
        }
        
        res.json(campaigns);
    } catch (err) {
        next(err)
    }
}

// Get a campaign by ID
const getCampaignById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid campaign ID' });
        }

        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(campaign);
    } catch (err) {
        next(err)
    }
}

// Update a campaign by ID
const updateCampaign = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid campaign ID' });
        }

        const campaign = await Campaign.findById(id);

        campaign.name = name || campaign.name;
        campaign.description = description || campaign.description;
        
        if (campaign.status === 'active' && message) {
            return res.status(400).json({ error: 'Cannot update message of an active campaign' });
        }
        campaign.message = message || campaign.message;

        await campaign.save();

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (err) {
        next(err)
    }
}

// Update campaign status [active/inactive]
const updateCampaignStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid campaign ID' });
        }

        const campaign = await Campaign.findById(id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        campaign.status = status || campaign.status;
        await campaign.save();

        res.json(campaign);
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    updateCampaignStatus
}