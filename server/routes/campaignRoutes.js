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


router.post('/campaign', requireAuth, createCampaign);

router.get('/campaigns', getCampaigns);
router.get('/campaign/:id', getCampaignById);
router.get('/campaign/:id/logs', getCampaignLogs);

router.post('/campaign/:id/retry', requireAuth, retryFailedLeads);

router.put('/campaign/:id', updateCampaign);

router.patch('/campaign/:id/schedule', scheduleCampaign);
router.patch('/campaign/:id/status', requireAuth, updateCampaignStatus);

router.delete('/campaign/:id', deleteCampaign);

module.exports = router;