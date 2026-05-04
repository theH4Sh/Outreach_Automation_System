const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
}, { timestamps: true });

const Lead = mongoose.model('Lead', LeadSchema);

module.exports = Lead;