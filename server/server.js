const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});