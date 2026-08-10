const {integrator, stopIntegration} = require('../engine/integrator');
const catchAsync = require('../middleware/catchAsync')
const BrowserProfile = require('../model/BrowserProfile')
const validateObjectId = require('../utils/validateObjectId');

const integrateAccount = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const profileName = req.body.profileName //used to manage multiple profiles in future

    if (!profileName) {
        return res.status(400).json({ message: 'Profile name is required' });
    }

    const existingProfile = await BrowserProfile.findOne({ profileName, user: userId });
    if (existingProfile) {
        return res.status(400).json({ message: 'Profile name already exists for this user' });
    }

    const newProfile = new BrowserProfile({ profileName, user: userId });
    
    const session = await integrator(profileName);
    await newProfile.save();
    res.status(200).json({ 
        message: 'Integration successful',
        url: session.url
    })
});

const closeIntegration = catchAsync(async (req, res) => {
    const profileName = req.params.profileName;

    const stopped = await stopIntegration(profileName);

    if (!stopped) {
        return res.status(404).json({
            message: 'No active integration foud'
        })
    }

    res.status(200).json({
        message: 'Integration session closed'
    })
})

const getProfiles = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const profiles = await BrowserProfile.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ profiles });
});

const deleteProfile = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const profileId = req.params.profileId;

    validateObjectId(profileId, 'Invalid profile ID');

    const deletedProfile = await BrowserProfile.findOneAndDelete({ _id: profileId, user: userId });
    if (!deletedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
    }
    // Optionally, you can also delete the corresponding browser profile directory here
    res.status(200).json({ message: `Profile ${deletedProfile.profileName} deleted successfully` });
});

module.exports = {
    integrateAccount,
    closeIntegration,
    getProfiles,
    deleteProfile
}