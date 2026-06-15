const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },

  password: String,

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: String,
});

module.exports = mongoose.model("Admin", adminSchema);
