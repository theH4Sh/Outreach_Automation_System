const sendDM = require('./DMbot')
const csv = require('csv-parser');
const fs = require('fs');

const leads = [];

fs.createReadStream('testacc.csv')
    .pipe(csv())
    .on('data', (data) => leads.push(data))
    .on('end', () => {
        //console.log(users);
        sendDM(leads)
    });