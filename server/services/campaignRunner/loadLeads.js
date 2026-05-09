const Lead = require('../../model/Lead');
const parseCSV = require('../../utils/parseCSV');

const loadLeads = async (campaign) => {
    const leadDocs = await Lead.find({
        _id: { $in: campaign.leads }
    });

    const leads = [];

    for (const leadDoc of leadDocs) {
        const fileData = await parseCSV(leadDoc.location)
        leads.push(...fileData);
    }

    return leads;
}

module.exports = loadLeads;