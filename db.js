const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Santhosh-Krishnan:*******@mini.apefkhq.mongodb.net/?retryWrites=true&w=majority&appName=Mini", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ MongoDB Atlas connected."));
module.exports = db;
