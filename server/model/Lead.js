const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true }
}, { timestamps: true });

const Lead = mongoose.model('Lead', LeadSchema);

module.exports = Lead;