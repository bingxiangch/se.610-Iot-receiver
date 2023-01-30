const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const devices = require("./controllers/devices");
const data = require("./controllers/data");
const users = require("./controllers/users");
const { router: auth, authenticateToken } = require("./controllers/auth");

const app = express();
const PORT = 4000;

// Load .env into process.
dotenv.config();

// App middleware.
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use((req, res, next) => {
  // Add authetication to all others endpoints.
  if (!req.url.startsWith("/auth")) {
    // Authentication.
    return authenticateToken(req, res, next);
  }
  next();
});

app.get("/", (req, res) => {
  return res.send("Hi there");
});

app.use("/auth", auth);

// Router for /devices.
app.use("/devices", devices);

// Router for /data.
app.use("/data", data);

// Router for /users.
app.use("/users", users);
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Listen on the port ${PORT}...`);
  });
}

module.exports = app;
