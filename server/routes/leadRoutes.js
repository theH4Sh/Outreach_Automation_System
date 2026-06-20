const express = require('express')
const upload = require('../middleware/upload')
const { uploadLead, getLeads, getLeadById, deleteLead } = require('../controllers/leadController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.post('/lead', requireAuth, upload.single('file'), uploadLead)
router.get('/leads', requireAuth, getLeads)
router.get('/lead/:id', requireAuth, getLeadById)
router.delete('/lead/:id', requireAuth, deleteLead)

module.exports = router