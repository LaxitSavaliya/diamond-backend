import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connenctDB } from "./lib/db.js";

import authRoutes from "./Routes/authRoutes.js";
import colorRoutes from "./Routes/colorRoutes.js";
import clarityRoutes from "./Routes/clarityRoutes.js";
import shapeRoutes from "./Routes/shapeRoutes.js";
import partyRoutes from "./Routes/partyRoutes.js";
import rateRoutes from "./Routes/rateRoutes.js";
import statusRoutes from "./Routes/statusRoutes.js";
import paymentStatusRoutes from "./Routes/paymentStatusRoutes.js";
import transactionRoutes from "./Routes/transactionRoutes.js";
import employeeRoutes from "./Routes/employeeRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import diamondLotRoutes from "./Routes/diamondLotRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://diamond-frontend-umber.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/color", colorRoutes);
app.use("/api/clarity", clarityRoutes);
app.use("/api/shape", shapeRoutes);
app.use("/api/party", partyRoutes);
app.use("/api/rate", rateRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/paymentStatus", paymentStatusRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/diamondLot", diamondLotRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  try {
    await connenctDB();
    app.listen(8000, () => {
      console.log("Server running on http://localhost:8000");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
