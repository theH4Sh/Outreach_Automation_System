const {integrator, stopIntegration} = require('../engine/integrator');
const catchAsync = require('../middleware/catchAsync')
const BrowserProfile = require('../model/BrowserProfile')
const validateObjectId = require('../utils/validateObjectId');
const { rm } = require('fs/promises')
const path = require('path')

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
    
    const session = await integrator(userId, profileName);
    await newProfile.save();
    res.status(200).json({ 
        message: 'Integration successful',
        sessionId: session.sessionId,
        //url: session.url
    })
});

const closeIntegration = catchAsync(async (req, res) => {
    const profileName = req.params.profileName;
    const userId = req.user._id;

    const stopped = await stopIntegration(userId);

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

    // Delete browser profile directory
    const profilePath = path.resolve('./profiles', deletedProfile.profileName);
    await rm(profilePath, {
        recursive: true,
        force: true
    });
    res.status(200).json({ message: `Profile ${deletedProfile.profileName} deleted successfully` });
});

module.exports = {
    integrateAccount,
    closeIntegration,
    getProfiles,
    deleteProfile
}