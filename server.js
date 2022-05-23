const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwtCheck = require("./config/auth");
const { connectToServer } = require("./config/db");

dotenv.config();

connectToServer();

const PORT = process.env.PORT || 5000;

const app = express();

const errController = (err, req, res, next) => {
  const error = { ...err };
  error.message = err.message;

  console.log(error);
  if (error.code === "11000") {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: error.message });
};

// Setting up middleware
app.use(cors());
app.use(express.json());
app.use(jwtCheck);

// Setting up routes
app.use("/api/user", require("./api/user/routes"));

app.use(errController);

app.listen(PORT, () => {
  console.log(`Starto il server sulla porta: ${PORT}!`);
});
