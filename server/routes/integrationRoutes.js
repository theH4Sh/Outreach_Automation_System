const express = require('express')

const { integrateAccount, getProfiles, deleteProfile } = require('../controllers/integrationController')

const router = express.Router()

router.post('/integrate/', integrateAccount)

router.get('/getProfiles/', getProfiles)

router.delete('/deleteProfile/:profileName', deleteProfile)

module.exports = router