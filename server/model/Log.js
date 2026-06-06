const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Campaign'
    },
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    success: {
        type: Boolean,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Log', logSchema)