const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    location: { type: String },
}, { timestamps: true });

const Lead = mongoose.model('Lead', LeadSchema);

module.exports = Lead;