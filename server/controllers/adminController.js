const User = require('../model/userModel')
const Campaign = require('../model/Campaign')
const Lead = require('../model/Lead')
const Log = require('../model/Log')
const resolveCampaignOperator = require('../utils/resolveCampaignOperator')
const catchAsync = require('../middleware/catchAsync')
const validateObjectId = require('../utils/validateObjectId')

const getStats = catchAsync(async (req, res) => {
    const [
        totalUsers,
        bannedUsers,
        adminUsers,
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        totalLogs,
        failedLogs,
        recentUsers,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isBanned: true }),
        User.countDocuments({ role: 'admin' }),
        Campaign.countDocuments(),
        Campaign.countDocuments({ status: 'active' }),
        Lead.countDocuments(),
        Log.countDocuments(),
        Log.countDocuments({ success: false }),
        User.find().select('-password').sort({ createdAt: -1 }).limit(5),
    ])

    res.status(200).json({
        users: { total: totalUsers, banned: bannedUsers, admins: adminUsers },
        campaigns: { total: totalCampaigns, active: activeCampaigns },
        leads: { total: totalLeads },
        logs: { total: totalLogs, failed: failedLogs, success: totalLogs - failedLogs },
        recentUsers,
    })
})

const getUsers = catchAsync(async (req, res) => {
    const { search, status } = req.query
    const filter = {}

    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ]
    }

    if (status === 'banned') filter.isBanned = true
    if (status === 'active') filter.isBanned = false
    if (status === 'admin') filter.role = 'admin'

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 })

    res.status(200).json(users)
})

const banUser = catchAsync(async (req, res) => {
    const { id } = req.params
    const { reason } = req.body

    validateObjectId(id, 'Invalid user ID')

    if (String(id) === String(req.user._id)) {
        return res.status(400).json({ error: 'You cannot ban your own account' })
    }

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot ban an admin account' })
    }

    user.isBanned = true
    user.banReason = reason?.trim() || 'Banned by administrator'
    user.bannedAt = new Date()
    await user.save()

    res.status(200).json({
        message: `User ${user.username} has been banned`,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isBanned: user.isBanned,
            banReason: user.banReason,
            bannedAt: user.bannedAt,
        },
    })
})

const unbanUser = catchAsync(async (req, res) => {
    const { id } = req.params
    validateObjectId(id, 'Invalid user ID')

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.isBanned = false
    user.banReason = null
    user.bannedAt = null
    await user.save()

    res.status(200).json({
        message: `User ${user.username} has been unbanned`,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isBanned: user.isBanned,
        },
    })
})

const updateUserRole = catchAsync(async (req, res) => {
    const { id } = req.params
    const { role } = req.body

    validateObjectId(id, 'Invalid user ID')

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be user or admin' })
    }

    if (String(id) === String(req.user._id)) {
        return res.status(400).json({ error: 'You cannot change your own role' })
    }

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.isBanned && role === 'admin') {
        return res.status(400).json({ error: 'Cannot promote a banned user to admin' })
    }

    user.role = role
    await user.save()

    res.status(200).json({
        message: `${user.username} is now ${role}`,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    })
})

const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params
    validateObjectId(id, 'Invalid user ID')

    if (String(id) === String(req.user._id)) {
        return res.status(400).json({ error: 'You cannot delete your own account' })
    }

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot delete an admin account' })
    }

    await Lead.deleteMany({ user: id })
    await user.deleteOne()

    res.status(200).json({ message: `User ${user.username} deleted` })
})

const getLogs = catchAsync(async (req, res) => {
    const { status, limit = 50, page = 1 } = req.query
    const filter = {}

    if (status === 'success') filter.success = true
    if (status === 'failed') filter.success = false

    const perPage = Math.min(Number(limit) || 50, 100)
    const skip = (Math.max(Number(page) || 1, 1) - 1) * perPage

    const [logs, total] = await Promise.all([
        Log.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .populate('sentById', 'username email')
            .populate({
                path: 'campaignId',
                select: 'name status createdBy lastActivatedBy leads',
                populate: [
                    { path: 'createdBy', select: 'username email' },
                    { path: 'lastActivatedBy', select: 'username email' },
                ],
            }),
        Log.countDocuments(filter),
    ])

    const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
            const doc = log.toObject()

            if (!doc.sentBy) {
                const operator = await resolveCampaignOperator(doc.campaignId)
                if (operator) {
                    doc.sentBy = operator.username
                    doc.sentById = operator
                }
            }

            return doc
        })
    )

    res.status(200).json({
        logs: enrichedLogs,
        pagination: {
            total,
            page: Number(page) || 1,
            pages: Math.ceil(total / perPage),
            limit: perPage,
        },
    })
})

const getCampaigns = catchAsync(async (req, res) => {
    const campaigns = await Campaign.find()
        .populate('browserProfile', 'profileName')
        .sort({ createdAt: -1 })

    res.status(200).json(campaigns)
})

module.exports = {
    getStats,
    getUsers,
    banUser,
    unbanUser,
    updateUserRole,
    deleteUser,
    getLogs,
    getCampaigns,
}
