const express = require("express");
const mongoose = require("mongoose");

//Mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/deadlock");

const app = express();
app.use(express.json());

module.exports = app;