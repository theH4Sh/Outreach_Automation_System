const mongoose = require('mongoose')
const Lead = require('../model/Lead')
const upload = require('../middleware/upload')
const fs = require('fs').promises

const uploadLead = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const lead = new Lead({
            name: req.file.originalname,
            location: req.file.path
        })
        await lead.save()
        res.status(201).json(lead)
    } catch (err) {
        next(err)
    }
}

const getLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find()
        res.status(200).json(leads)
    } catch (err) {
        next(err)
    }
}

const getLeadById = async (req, res, next) => {
    try {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid lead ID' })
        }

        const lead = await Lead.findById(id)
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' })
        }
        res.status(200).json(lead)
    } catch (err) {
        next(err)
    }
}

const deleteLead = async (req, res, next) => {
    try {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid lead ID' })
        }

        const lead = await Lead.findByIdAndDelete(id)
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' })
        }

        if (lead.location) {
            try {
                await fs.unlink(lead.location);
            } catch (err) {
                console.log(`Failed to delete file at ${lead.location}: ${err.message}`)
            }
        }

        res.status(200).json({ message: 'Lead deleted successfully' })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    uploadLead,
    getLeads,
    getLeadById,
    deleteLead
}