// server/src/index.ts
import express, {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTES */
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
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow tools like Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Handle preflight for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

/* ROUTES */
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

/* HEALTH CHECK */
app.get("/", (_req: Request, res: Response) => {
  res.send("API is up");
});

/* 404 HANDLER */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

/* ERROR HANDLER */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server error" });
};
app.use(errorHandler);

/* SERVER */
const port = Number(process.env.PORT) || 8000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`✅ Server running`);
  console.log(`   Local:  http://127.0.0.1:${port}`);
  console.log(`   Remote: http://<EC2_PUBLIC_IP>:${port}`);
});