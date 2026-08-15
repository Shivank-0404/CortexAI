import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import router from "./routes/auth.routes.js";
dotenv.config();
const app = express();
app.use(express.json());
const port=process.env.PORT 



process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

app.get("/", (req, res) => {
  res.status(200).json({
    service: "auth",
    status: "ok"
  });
});
app.use("/",router);

app.use((err, req, res, next) => {
  console.error("Auth Service error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
    connectDB()
  console.log(
    `auth service running on ${port}`
  );
});
