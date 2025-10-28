// server/src/index.ts
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";

/* CONFIG */
dotenv.config();
const app = express();

/* SECURITY & LOGGING */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

/* BODY PARSING */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* CORS
   - You can override allowed origins via FRONTEND_ORIGIN (comma-separated)
   - Defaults to Next.js dev at http://localhost:3000
*/
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* ROUTES */
app.use("/dashboard", dashboardRoutes); // http://localhost:8000/dashboard
app.use("/products", productRoutes);    // http://localhost:8000/products
app.use("/users", userRoutes);          // http://localhost:8000/users
app.use("/expenses", expenseRoutes);    // http://localhost:8000/expenses

/* 404 HANDLER */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

/* ERROR HANDLER */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

/* SERVER */
const port = Number(process.env.PORT) || 8000; // default to 8000
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});