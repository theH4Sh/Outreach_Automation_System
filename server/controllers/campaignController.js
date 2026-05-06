const Campaign = require('../model/Campaign');
const Lead = require('../model/Lead')
const mongoose = require('mongoose');

// Create a new campaign
const createCampaign = async (req, res, next) => {
    try {
        const { name, description, message, leads } = req.body;

        if (!Array.isArray(leads)) {
            return res.status(400).json({ error: 'Lead must be an array' });
        }

        for (const lead of leads) {
            if (!mongoose.Types.ObjectId.isValid(lead)) {
                return res.status(400).json({ error: 'Invalid lead ID' });
            }
        }

        //check the existence of leads
        const existingLeads = await Lead.find({
            _id: { $in: leads }
        })

        if (existingLeads.length !== leads.length) {
            return res.status(404).json({ error: 'One or more leads not found'})
        }

        const campaign = new Campaign({ name, description, message, leads });
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
            return res.status(200).json(campaigns);
        }
        res.status(200).json(campaigns);
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
        res.status(200).json(campaign)
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

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        campaign.name = name || campaign.name;
        campaign.description = description || campaign.description;
        
        if (campaign.status === 'active' && message) {
            return res.status(400).json({ error: 'Cannot update message of an active campaign' });
        }
        campaign.message = message || campaign.message;

        await campaign.save();

        res.status(200).json(campaign);
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

        // if (!['active', 'inactive'].includes(status)) {
        //     return res.status(400).json({ error: 'Invalid status value' });
        // }

        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.status(200).json(campaign);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    updateCampaignStatus
}