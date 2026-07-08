const jwt = require('jsonwebtoken')
const User = require('../model/userModel')

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: 'authorization required' })
    }

    const token = authorization.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decoded._id).select('username role isBanned')

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' })
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Your account has been banned' })
        }

        req.user = {
            _id: user._id,
            username: user.username,
            role: user.role,
        }
        next()
    } catch {
        res.status(401).json({ error: 'not authorized' })
    }
}

module.exports = requireAuth
