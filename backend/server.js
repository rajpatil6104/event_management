require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const guestRoutes = require("./routes/guestRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/guest", guestRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server Running");
});
