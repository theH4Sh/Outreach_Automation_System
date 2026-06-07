const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');
const { createServer } = require("http")
const { Server } = require("socket.io")

const campaignLogger = require('./utils/campaignLogger')
const Log = require('./model/Log')

const scheduler = require('./services/campaignRunner/scheduler')

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


const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: "*"}
})

io.on('connection', (socket) => {
  console.log("Frontend Connected")
})

campaignLogger.on('log', async (data) => {
  io.emit('campaign-log', data)

  try {
    await Log.create({
      campaignId: data.campaignId,
      runId: data.runId,
      success: data.success,
      username: data.username,
      name: data.name,
      message: data.message
    })
  } catch (err) {
    console.log("Failed to save log to database", err)
  }
})

// Start the campaign scheduler
scheduler();

campaignLogger.on('progress', (data) => {
  io.emit('campaign-progress', data)
})

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});