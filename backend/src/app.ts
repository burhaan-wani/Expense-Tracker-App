import "dotenv/config";
import path from "path";
import express, { type Application } from "express";
import cors from "cors";

import { router as authRoutes } from "./routes/authRoutes.js";
import { router as profileRoutes } from "./routes/profileRoutes.js";
import { router as analyticsRoutes } from "./routes/analyticsRoutes.js";
import { router as expenseRoutes } from "./routes/expenseRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/db.js";

const app: Application = express();
const PORT = process.env.PORT || 8000;

connectDB();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static("uploads"));

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
