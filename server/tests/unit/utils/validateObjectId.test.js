const { default: mongoose } = require('mongoose')
const validateObjectId = require('../../../utils/validateObjectId')

describe ('validateObjectId', () => {
    test('should throw error', () => {
        expect (() => {
            validateObjectId(
                '123',
                'Invalid ID'
            )
        }).toThrow('Invalid ID')
    })

    test ('should not throw error', () => {
        const fakeId = new mongoose.Types.ObjectId()

        expect (() => {
            validateObjectId(
                fakeId,
                'Invalid Id'
            )
        }).not.toThrow()
    })
})