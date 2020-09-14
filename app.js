const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Getting rid of favicon icon request from react app
app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/hey", (req, res) => res.send("ho!"));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/images", imageRoutes);

app.all("*", (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );

  next(err);
});

app.use(globalErrorHandler);

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

const port = process.env.PORT || 8000;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((err) => {
    console.log("DB connection successful");
  });

const server = app.listen(port, () => {
  console.log("Listening on port 8000...");
});

process.on("unhandledRejection", (err) => {
  console.log("UNHALDLED REJECTION! Shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
