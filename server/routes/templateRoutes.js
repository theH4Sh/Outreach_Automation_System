const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    previewTemplate,
} = require('../controllers/templateController')

const router = express.Router()

router.use(requireAuth)

router.get('/templates', getTemplates)
router.post('/templates', createTemplate)
router.post('/templates/preview', previewTemplate)
router.get('/templates/:id', getTemplateById)
router.put('/templates/:id', updateTemplate)
router.delete('/templates/:id', deleteTemplate)

module.exports = router
