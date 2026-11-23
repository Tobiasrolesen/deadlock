import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";

//Mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/deadlock");

const app = express();
app.use(express.json());

app.use("/api/user", userRoutes);

export default app;
