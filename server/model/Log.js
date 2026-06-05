const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Campaign'
    },
    success: {
        type: Boolean,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('Log', logSchema)