const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    let statusCode = err.statusCode || 500
    let message = err.message || 'Internal server error'

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401
        message = 'Invalid token'
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401
        message = 'Token expired'
    } else if (err.name === 'ValidationError') {
        statusCode = 400
        message = Object.values(err.errors).map((e) => e.message).join(', ')
    } else if (err.code === 11000) {
        statusCode = 409
        const field = Object.keys(err.keyPattern || {})[0] || 'field'
        message = `Duplicate value for ${field}`
    } else if (err.name === 'CastError') {
        statusCode = 400
        message = 'Invalid ID format'
    }

    res.status(statusCode).json({ error: message })
}

module.exports = errorHandler
