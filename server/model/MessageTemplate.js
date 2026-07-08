const mongoose = require('mongoose')

const messageTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    variables: {
        type: [String],
        default: [],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true })

messageTemplateSchema.index({ createdBy: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema)
