const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const transporter = require('../utils/mailer')
const bcrypt = require('bcrypt')
const validator = require('validator')

const createToken = (user) => {
    return jwt.sign({
        _id: user._id,
        username: user.username,
        role: user.role
    }, process.env.SECRET, { expiresIn: '3d'})
}

const loginUser = async (req, res, next) => {
    const { identifier, password } = req.body

    try {
        const user = await User.login(identifier, password)

        const role = user.role
        const username = user.username

        //token
        const token = createToken(user)

        res.status(200).json({ username, token, role })
    } catch (error) {
        next(error)
    }
}

const signUpUser = async (req, res, next) => {
    const {username, email, password} = req.body

    try {
        const user = await User.signup(username, email, password)

        //token
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '1h' });

        const verificationLink = `http://localhost:8000/api/auth/verify/${token}`


        const mail = await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify your email',
        html: `
            <h2>Welcome ${user.username}!</h2>
            <p>Click below to verify your account:</p>
            <a href="${verificationLink}">${verificationLink}</a>
        `,
        });
        console.log("mail: ", mail)

        res.status(201).json({ message: `${username} registered successfully. Please check your email and verify`, token })
    } catch (error) {
        next(error)
    }
}

const getUser = async (req, res, next) => {
    const { username } = req.params

    try {
        const user = await User.findOne({ username }).select("-password")
        if (!user) {
            return res.status(404).json({error: 'user not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params
        const decoded = jwt.verify(token, process.env.SECRET)
        console.log(decoded)
        const user = await User.findById(decoded._id)
        console.log(user)
        if (!user) return res.status(400).json({ error: "Invalid Token" })

        if (user.isVerified) {
            console.log("verified")
            return res.status(200).json({ message: "Already Verified" })
        }

        user.isVerified = true
        await user.save()

        res.status(200).json({ message: "Email verified successfully"})
    } catch (error) {
        console.log("Verification failed")
        next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: "Email not found" })

        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:5173/reset-password/${token}`

        const mail = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click the link to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link expires in 15 minutes.</p>`
        }

        await transporter.sendMail(mail)
        res.status(200).json({ message: "Password reset link sent to your email" })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params
        const { newPassword } = req.body

        if (!newPassword) return res.status(400).json({ error: "New password is required" })

        const decoded = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decoded._id)
        if (!user) return res.status(404).json({ error: 'Invalid token'})

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save()

        res.status(200).json({ message: "Password has been reset successfully" })
    } catch (error) {
        next(error)
    }
}

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (username !== undefined && username !== user.username) {
            if (!username || username.length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters long' })
            }

            const existingUsername = await User.findOne({ username })
            if (existingUsername) {
                return res.status(400).json({ error: 'Username already taken' })
            }

            user.username = username
        }

        if (email !== undefined && email !== user.email) {
            if (!email || !validator.isEmail(email)) {
                return res.status(400).json({ error: 'Invalid email address' })
            }

            const existingEmail = await User.findOne({ email })
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already in use' })
            }

            user.email = email
            user.isVerified = false
        }

        await user.save()

        const token = createToken(user)

        res.status(200).json({
            message: 'Profile updated successfully',
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            token,
        })
    } catch (error) {
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const match = await bcrypt.compare(currentPassword, user.password)
        if (!match) {
            return res.status(400).json({ error: 'Current password is incorrect' })
        }

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ error: 'Password not strong enough' })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        await user.save()

        res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loginUser,
    signUpUser,
    getUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
}