const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const integrationRoutes = require("./routes/integrationRoutes");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/integrations", integrationRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Resume Ecosystem API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      achievements: "/api/achievements",
      resume: "/api/resume",
      integrations: "/api/integrations",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
