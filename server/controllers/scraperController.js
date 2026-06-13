const catchAsync = require('../middleware/catchAsync')
const scraper = require('../engine/scraper')
const { Parser } = require('json2csv')

const scrapeData = catchAsync(async (req, res) => {
    const { link, exportToCSV } = req.body

    const leads = await scraper(link)

     const result = {
        link,
        leads
    }

    if (exportToCSV) {
        const parser = new Parser()
        const csv = parser.parse(leads)

        res.header('Content-Type', 'text/csv')
        res.attachment('leads.csv')
        return res.send(csv)
    }
    

    res.status(200).json(result)
})

module.exports = {
    scrapeData
}