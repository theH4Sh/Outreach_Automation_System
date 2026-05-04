const express = require('express')
const upload = require('../middleware/upload')
const { uploadLead, getLeads, getLeadById, deleteLead } = require('../controllers/leadController')

const router = express.Router()

router.post('/lead', upload.single('file'), uploadLead)
router.get('/leads', getLeads)
router.get('/lead/:id', getLeadById)
router.delete('/lead/:id', deleteLead)

module.exports = router