const integrator = require('../engine/integrator');
const catchAsync = require('../middleware/catchAsync')

const integrateAccount = catchAsync(async (req, res) => {
    // const profileName = req.body.profileName // optional, can be used to manage multiple profiles in future
    await integrator();
    res.status(200).json({ message: 'Integration successful' })
});

module.exports = {
    integrateAccount
}