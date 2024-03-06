const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: Date.now },
  xat: { type: String},
  time: { type: String, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
