const express = require("express");
const cors = require("cors");

const releaseRoutes = require("./routes/release.routes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_, res) => {
    res.status(200).json({
      success: true,
      message: "Release Backend is running 🚀"
    });
  });

app.get("/health", (_, res) => {
  res.json({
    success: true,
    status: "UP"
  });
});

app.use("/api/releases", releaseRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

module.exports = app;