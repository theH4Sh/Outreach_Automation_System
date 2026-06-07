const express = require('express');
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


router.post('/campaign', createCampaign);

router.get('/campaigns', getCampaigns);
router.get('/campaign/:id', getCampaignById);
router.get('/campaign/:id/logs', getCampaignLogs);

router.post('/campaign/:id/retry', retryFailedLeads);

router.put('/campaign/:id', updateCampaign);

router.patch('/campaign/:id/schedule', scheduleCampaign);
router.patch('/campaign/:id/status', updateCampaignStatus);

router.delete('/campaign/:id', deleteCampaign);

module.exports = router;