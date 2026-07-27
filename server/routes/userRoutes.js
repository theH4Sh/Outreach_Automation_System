const express = require('express')
const {
    loginUser,
    signUpUser,
    getUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
} = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', signUpUser)
router.get('/me', requireAuth, getProfile)
router.patch('/profile', requireAuth, updateProfile)
router.patch('/password', requireAuth, changePassword)
router.get('/verify/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/:username', getUser)

module.exports = router
