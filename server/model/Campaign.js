const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  message: { type: String },
  leads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
  status: { type: String, enum: ['active', 'inactive', 'completed', 'scheduled'], default: 'inactive' },
  scheduledAt: {
    type: Date,
    default: null
  },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;