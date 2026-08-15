import express from "express";
import dotenv from "dotenv";
import router from "./routes/chat.routes.js";
import connectDB from "./config/db.js";

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

app.use("/",router)

app.use((err, req, res, next) => {
  console.error("Chat Service error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
    connectDB()
  console.log(
    `chat service running on ${port}`
  );
});
