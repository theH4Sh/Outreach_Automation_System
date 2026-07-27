const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    getCampaignLogs,
    updateCampaign, 
    updateCampaignStatus,
    deleteCampaign,
    retryFailedLeads,
    scheduleCampaign
} = require('../controllers/campaignController');

const router = express.Router();

// Auth required for every campaign endpoint (keeps ownership filters working)
router.post('/campaign', requireAuth, createCampaign);
router.get('/campaigns', requireAuth, getCampaigns);
router.get('/campaign/:id', requireAuth, getCampaignById);
router.get('/campaign/:id/logs', requireAuth, getCampaignLogs);
router.post('/campaign/:id/retry', requireAuth, retryFailedLeads);
router.put('/campaign/:id', requireAuth, updateCampaign);
router.patch('/campaign/:id/schedule', requireAuth, scheduleCampaign);
router.patch('/campaign/:id/status', requireAuth, updateCampaignStatus);
router.delete('/campaign/:id', requireAuth, deleteCampaign);

module.exports = router;
