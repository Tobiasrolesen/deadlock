import express from "express";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import userRoutes from "./routes/userRoutes.js";
import patchnotesRoutes from './routes/patchnotesRoutes.js'
import heroesRoutes from './routes/heroesRoutes.js'
<<<<<<< HEAD
=======
import itemsRoutes from './routes/itemsRoutes.js';
>>>>>>> origin/main

//Mongoose connection
mongoose.connect("mongodb://127.0.0.1:27017/deadlock");

const app = express();
app.use(express.json());
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "public")));

app.use("/api/user", userRoutes);
app.use("/api/deadlock/patchnotes", patchnotesRoutes);
<<<<<<< HEAD
app.use("/api/deadlock/scoreboards", heroesRoutes);
=======
app.use("/api/deadlock/items", itemsRoutes);
app.use("/api/heroes", heroesRoutes);
>>>>>>> origin/main

export default app;
