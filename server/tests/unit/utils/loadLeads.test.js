jest.mock('../../../model/Lead')
jest.mock('../../../utils/parseCSV')

const Lead = require('../../../model/Lead')
const parseCSV = require('../../../utils/parseCSV')
const loadLeads = require('../../../services/campaignRunner/loadLeads')

describe('loadLeads', () => {
    test('should load and parse leads', async () => {
        const mockCampaign = {
            lead: ['id1', 'id2']
        }

        Lead.find.mockResolvedValue([
            { location: 'file1.csv'},
            { location: 'file2.csv'}
        ])

        parseCSV.mockResolvedValueOnce([
            { username : 'John' }
        ]).mockResolvedValueOnce([
            { username : 'Eren' }
        ])

        const result = await loadLeads(mockCampaign)

        console.log(result)

        expect(result).toEqual([
            { username : 'John' },
            { username : 'Eren' }
        ])
    })
})