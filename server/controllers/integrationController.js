const integrator = require('../engine/integrator');
const catchAsync = require('../middleware/catchAsync')
const BrowserProfile = require('../model/BrowserProfile')

const integrateAccount = catchAsync(async (req, res) => {
    const profileName = req.body.profileName // optional, can be used to manage multiple profiles in future
    const existingProfile = await BrowserProfile.findOne({ profileName });
    if (existingProfile) {
        return res.status(400).json({ message: 'Profile name already exists' });
    }

    const newProfile = new BrowserProfile({ profileName });
    
    await integrator(profileName);
    await newProfile.save();
    res.status(200).json({ message: 'Integration successful' })
});

const getProfiles = catchAsync(async (req, res) => {
    const profiles = await BrowserProfile.find();
    res.status(200).json({ profiles });
});

const deleteProfile = catchAsync(async (req, res) => {
    const profileName = req.params.profileName;
    await BrowserProfile.findOneAndDelete({ profileName });
    // Optionally, you can also delete the corresponding browser profile directory here
    res.status(200).json({ message: 'Profile deleted successfully' });
});

module.exports = {
    integrateAccount,
    getProfiles,
    deleteProfile
}