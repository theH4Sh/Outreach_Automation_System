const express = require('express');
const { createCampaign, getCampaigns, getCampaignById, updateCampaign, updateCampaignStatus } = require('../controllers/campaignController');

const router = express.Router();


router.post('/campaign', createCampaign);
router.get('/campaigns', getCampaigns);
router.get('/campaign/:id', getCampaignById);
router.put('/campaign/:id', updateCampaign);
router.patch('/campaign/:id/status', updateCampaignStatus);

module.exports = router;