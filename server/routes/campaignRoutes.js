const express = require('express');
const { 
    createCampaign, 
    getCampaigns, 
    getCampaignById, 
    updateCampaign, 
    updateCampaignStatus,
    deleteCampaign
} = require('../controllers/campaignController');

const router = express.Router();


router.post('/campaign', createCampaign);
router.get('/campaigns', getCampaigns);
router.get('/campaign/:id', getCampaignById);
router.put('/campaign/:id', updateCampaign);
router.patch('/campaign/:id/status', updateCampaignStatus);
router.delete('/campaign/:id', deleteCampaign);

module.exports = router;