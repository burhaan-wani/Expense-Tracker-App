import path from "path";
import express, { Application } from "express";
import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

connectDB();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Basic Health Check Route
app.get("/health-check", (req, res) => {
  res.send("Hello from TS + Express");
});

// Expense Routes
app.use("/api/expenses", expenseRoutes);

// Auth Routes
app.use("/api/auth", authRoutes);

// Profile Route
app.use("/api/profile", profileRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// Avatar
app.use("/uploads", express.static("uploads"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot Find ${req.method} ${req.originalUrl}`,
  });
});

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();

  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(
    `📋 Port loaded from: ${process.env.PORT ? ".env file" : "default (8000)"}`,
  );
  console.log(`🔍 Environment: ${process.env.NODE_ENV || "development"}`);
});
