import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** ===== Types ===== */
export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string; // comes back as string from API
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

/** ===== Base URL (from env) =====
 * Prefer NEXT_PUBLIC_API_URL; fall back to NEXT_PUBLIC_API_BASE_URL if present.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  // This will show up in the browser console in dev if the env var is missing.
  // Make sure client/.env.local has: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
  // and restart `npm run dev`.
  // eslint-disable-next-line no-console
  console.warn(
    "[api] Missing NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL). Requests will fail."
  );
}

/** ===== API Slice ===== */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    // If you need credentials/cookies with requests in future:
    // credentials: "include",
    // prepareHeaders: (headers) => {
    //   headers.set("Content-Type", "application/json");
    //   return headers;
    // },
  }),
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses"],
  endpoints: (build) => ({
    /** Dashboard */
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    /** Products */
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : undefined,
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),

    /** Users */
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    /** Expenses */
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

/** ===== Hooks ===== */
export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
} = api;
