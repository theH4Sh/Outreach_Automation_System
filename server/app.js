const express = require('express');
const morgan = require('morgan');

const campaignRoutes = require('./routes/campaignRoutes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', campaignRoutes);

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

module.exports = app;