const Campaign = require('../../model/Campaign');
const runCampaign = require('./runCampaign')

const scheduler = () => {
    setInterval(async () => {
        try {
            const now = new Date();

            const campaignsToRun = await Campaign.find({
                status: 'scheduled',
                scheduledAt: { $lte: now }
            });


            if (!Array.isArray(campaignsToRun) || campaignsToRun.length === 0) {
                console.log(
                    `Scheduler found 0 campaign(s) to run at ${now.toISOString()}`
                );
                return;
            }


            console.log(`Scheduler found ${campaignsToRun.length} campaign(s) to run at ${now.toISOString()}`);

            for (const campaign of campaignsToRun) {
                try {
                    console.log(`Running scheduled campaign: ${campaign.name} (ID: ${campaign._id})`)
                    const lockedCampaign = await Campaign.findOneAndUpdate({
                        status: 'scheduled',
                    }, {
                        status: 'active',
                    }, {
                        new: true
                    });

                    if (!lockedCampaign) {
                        console.log(
                            `Campaign ${campaign._id} already picked by another worker`
                        );
                        continue;
                    }

                    console.log(`Locked campaign ${lockedCampaign._id} for processing`)

                    await runCampaign(lockedCampaign);
                    // campaign.scheduledAt = null;
                    // campaign.status = 'active';
                    // await campaign.save();

                    await Campaign.findByIdAndUpdate(lockedCampaign._id, {
                        status: 'completed',
                        progress: 0,
                        scheduledAt: null,
                    })

                    console.log(`Completed scheduled campaign: ${lockedCampaign.name} (ID: ${lockedCampaign._id})`)
                } catch (error) {
                    console.error(`Error running campaign ${campaign._id}:`, error);
                    await Campaign.findByIdAndUpdate(campaign._id, {
                            status: 'scheduled' // or 'failed'
                    });
                }
            }
        } catch (error) {
            console.error('Error in campaign scheduler:', error);
        }
    }, 10000)
}

module.exports = scheduler;