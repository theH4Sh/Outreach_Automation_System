const Campaign = require('../model/Campaign')
const Lead = require('../model/Lead')

const resolveCampaignOperator = async (campaignRef, explicitUser = null) => {
    if (explicitUser?.username) {
        return {
            _id: explicitUser._id,
            username: explicitUser.username,
        }
    }

    const campaignId = campaignRef?._id || campaignRef
    if (!campaignId) return null

    const campaign = await Campaign.findById(campaignId)
        .populate('lastActivatedBy', 'username _id')
        .populate('createdBy', 'username _id')
        .select('lastActivatedBy createdBy leads')

    if (!campaign) return null

    if (campaign.lastActivatedBy?.username) {
        return {
            _id: campaign.lastActivatedBy._id,
            username: campaign.lastActivatedBy.username,
        }
    }

    if (campaign.createdBy?.username) {
        return {
            _id: campaign.createdBy._id,
            username: campaign.createdBy.username,
        }
    }

    if (campaign.leads?.length) {
        const leadDoc = await Lead.findOne({ _id: { $in: campaign.leads } })
            .populate('user', 'username _id')
            .sort({ createdAt: 1 })

        if (leadDoc?.user?.username) {
            return {
                _id: leadDoc.user._id,
                username: leadDoc.user.username,
            }
        }
    }

    return null
}

module.exports = resolveCampaignOperator
