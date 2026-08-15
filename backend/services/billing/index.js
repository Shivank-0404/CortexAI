import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
import router from "./routes/billing.routes.js";
dotenv.config()
const port=process.env.PORT
const app =
express();


app.use(express.json());


app.use(helmet());

app.use(morgan("dev"));
app.use(
    "/",
    router
);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:"Billing Service Running"

    });

});

app.use((err, req, res, next) => {
  console.error("Billing Service error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
    connectDB()
  console.log(
    `billing service running on ${port}`
  );
});