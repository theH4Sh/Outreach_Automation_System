const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const requireAdmin = require('../middleware/requireAdmin')
const {
    getStats,
    getUsers,
    banUser,
    unbanUser,
    updateUserRole,
    deleteUser,
    getLogs,
    getCampaigns,
} = require('../controllers/adminController')

const router = express.Router()

router.use(requireAuth, requireAdmin)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.patch('/users/:id/ban', banUser)
router.patch('/users/:id/unban', unbanUser)
router.patch('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/logs', getLogs)
router.get('/campaigns', getCampaigns)

module.exports = router
