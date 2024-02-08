import express from "express";
import cors from "cors";
import mongosoe from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import AuthRoutes from "./routes/authRoutes.js";
//import UserRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
//const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_DEV;
//to create two separate databases for development and production

mongosoe
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database Connected and Server Running on Port: ${PORT}...@PRP`
      );
    });
  })
  .catch((error) => {
    console.log({ message: error.message });
  });

//Healthcheck
app.get("/api/v1", (req, res) => {
  try {
    res.status(200).json("API Is Working Well!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/v1/auth", AuthRoutes);
//app.use("/api/v1/user", UserRoutes);

export default app;
