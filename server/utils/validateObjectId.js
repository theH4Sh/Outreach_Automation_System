const mongoose = require('mongoose')
const AppError = require('./AppError')

const validateObjectId = (id, message) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(message, 400);
    }
}

module.exports = validateObjectId