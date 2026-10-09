const express = require("express");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.route");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

module.exports = app;

// API or MIDDLEWARE rhte h app.js mai