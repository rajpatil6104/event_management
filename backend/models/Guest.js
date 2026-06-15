const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  guestId: String,
  name: String,
  email: String,
  phone: String,
  qrCode: String,
  attended: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Guest", guestSchema);
