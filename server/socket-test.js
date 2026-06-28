const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("campaign-log", (data) => {
  console.log("🔥 LOG RECEIVED:", data);
});

socket.on("campaign-progress", (data) => {
  console.log("📊 PROGRESS UPDATE:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});