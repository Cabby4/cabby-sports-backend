const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { errorHandler } = require("./middlewares/errorMiddleware");
const { notFound } = require("./middlewares/notFoundMiddleware");
const authRoutes = require("./routes/authRoutes");

const newsRoutes = require("./routes/newsRoutes");
const teamRoutes = require("./routes/teamRoutes");
const fixtureRoutes = require("./routes/fixtureRoutes");
const resultRoutes = require("./routes/resultRoutes");
const transferRoutes = require("./routes/transferRoutes");


const app = express();

// Security
app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cabby Sports API is running",
  });
});

app.use("/api/auth", authRoutes);


app.use("/api/news", newsRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/transfers", transferRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;