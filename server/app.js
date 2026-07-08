const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors')

const campaignRoutes = require('./routes/campaignRoutes');
const leadRoutes = require('./routes/leadRoutes')
const scraperRoutes = require('./routes/scraperRoutes')
const integrationRoutes = require('./routes/integrationRoutes')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const templateRoutes = require('./routes/templateRoutes')

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())
app.use("/files", express.static(path.join(__dirname, "files")));

app.use('/api', campaignRoutes);
app.use('/api', leadRoutes)
app.use('/api', scraperRoutes)
app.use('/api', integrationRoutes)
app.use('/api/auth', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', templateRoutes)

//error handling middleware
app.use(errorHandler);

module.exports = app;