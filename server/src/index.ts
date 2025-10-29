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

/* CORS */
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
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

/* ROOT HEALTH CHECK */
app.get("/", (_req: Request, res: Response) => {
  res.send("API is up");
});

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
const port = Number(process.env.PORT) || 8000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Local:  http://127.0.0.1:${port}`);
  console.log(`Remote: http://<EC2_PUBLIC_IP>:${port}`);
});