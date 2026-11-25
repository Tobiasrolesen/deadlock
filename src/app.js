import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import patchnotesRoutes from './routes/patchnotesRoutes.js'
import heroesRoutes from './routes/heroesRoutes.js'
import itemsRoutes from "./routes/itemsRoutes.js";

//Mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/deadlock");

const app = express();
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/deadlock/patchnotes", patchnotesRoutes);
app.use("/api/deadlock/items", itemsRoutes);
app.use("/api/heroes", heroesRoutes);

export default app;
