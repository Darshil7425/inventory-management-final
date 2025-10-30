// server/src/index.ts
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTES */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";

/* ENV */
dotenv.config();

const app = express();

/* SECURITY & LOGGING */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

/* BODY PARSING */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* CORS: allow multiple origins via FRONTEND_ORIGIN (comma-separated) */
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // allow non-browser tools (curl/Postman) with no Origin
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight globally, then apply CORS
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

/* ROUTES */
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

/* HEALTH */
app.get("/", (_req: Request, res: Response) => {
  res.send("API is up");
});

/* 404 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

/* ERROR */
app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ) => {
    // narrow unknown to Error-like for logging
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? (err as any).message
        : String(err);
    console.error("[ERROR]", message);
    res.status(500).json({ message: "Server error" });
  }
);

/* SERVER */
const port = Number(process.env.PORT) || 8000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Local:  http://127.0.0.1:${port}`);
  console.log(`Remote: http://${host}:${port}`);
});