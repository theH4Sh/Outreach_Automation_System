const express = require('express')

const { integrateAccount } = require('../controllers/integrationController')

const router = express.Router()

router.post('/integrate/', integrateAccount)

module.exports = router