const express = require('express');
const morgan = require('morgan');
const path = require('path');

const campaignRoutes = require('./routes/campaignRoutes');
const leadRoutes = require('./routes/leadRoutes')

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use("/files", express.static(path.join(__dirname, "files")));

app.use('/api', campaignRoutes);
app.use('/api', leadRoutes)

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

module.exports = app;