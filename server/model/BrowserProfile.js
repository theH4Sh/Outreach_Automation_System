const mongoose = require('mongoose');

const browserProfileSchema = new mongoose.Schema({
  profileName: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const BrowserProfile = mongoose.model('BrowserProfile', browserProfileSchema);

module.exports = BrowserProfile;