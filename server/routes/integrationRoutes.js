const express = require('express')

const { integrateAccount, getProfiles, deleteProfile } = require('../controllers/integrationController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.post('/integrate/', requireAuth, integrateAccount)

router.get('/getProfiles/', requireAuth, getProfiles)

router.delete('/deleteProfile/:profileId', requireAuth, deleteProfile)

module.exports = router