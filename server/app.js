const express = require('express');
const morgan = require('morgan');
const path = require('path');

const campaignRoutes = require('./routes/campaignRoutes');
const leadRoutes = require('./routes/leadRoutes')

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use("/files", express.static(path.join(__dirname, "files")));

app.use('/api', campaignRoutes);
app.use('/api', leadRoutes)

//error handling middleware
app.use(errorHandler);

module.exports = app;