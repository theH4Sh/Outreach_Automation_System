const parseCSV = require('../../../utils/parseCSV')
const path = require('path')

describe('parseCSV', () => {
    test('should parseCSV', async () => {
        const file = path.join(__dirname, '../../files/test.csv')
        const result = await parseCSV(file)

        expect(Array.isArray(result)).toBe(true)
    })
})