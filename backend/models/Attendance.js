const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  guestId: String,
  name: String,
  email: String,
  entryTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
