// server/src/controllers/productController.ts
import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/* ----------------------------- helpers ---------------------------------- */
const toFiniteNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const badRequest = (res: Response, message: string) =>
  res.status(400).json({ message });

/* ------------------------------ handlers -------------------------------- */

/** GET /products?search=foo */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const search = String(req.query.search ?? "").trim();

    const where: Prisma.ProductsWhereInput | undefined = search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined;

    const products = await prisma.products.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (err) {
    console.error("getProducts error:", err);
    res.status(500).json({ message: "Error retrieving products" });
  }
}

/** POST /products  body: { name, price, stockQuantity, rating? } */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, price, stockQuantity, rating } = req.body ?? {};

    if (!name || typeof name !== "string") {
      return void badRequest(res, "Missing or invalid 'name'");
    }

    const parsedPrice = toFiniteNumber(price);
    if (parsedPrice === null) {
      return void badRequest(res, "Missing or invalid 'price'");
    }

    const parsedStock = toFiniteNumber(stockQuantity);
    if (parsedStock === null) {
      return void badRequest(res, "Missing or invalid 'stockQuantity'");
    }

    const parsedRating =
      rating === undefined || rating === null || rating === ""
        ? undefined
        : toFiniteNumber(rating);

    if (rating !== undefined && rating !== null && parsedRating === null) {
      return void badRequest(res, "Invalid 'rating'");
    }

    const data: Prisma.ProductsCreateInput = {
      name,
      price: parsedPrice,
      stockQuantity: parsedStock,
      ...(parsedRating !== undefined ? { rating: parsedRating } : {}),
    };

    const product = await prisma.products.create({ data });
    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ message: "Error creating product" });
  }
}

/** PUT /products/:id  body: { name?, price?, stockQuantity?, rating? } */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, price, stockQuantity, rating } = (req.body ?? {}) as {
      name?: unknown;
      price?: unknown;
      stockQuantity?: unknown;
      rating?: unknown;
    };

    const data: Prisma.ProductsUpdateInput = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return void badRequest(res, "Invalid 'name'");
      }
      data.name = name;
    }

    if (price !== undefined) {
      const p = toFiniteNumber(price);
      if (p === null) return void badRequest(res, "Invalid 'price'");
      data.price = p;
    }

    if (stockQuantity !== undefined) {
      const s = toFiniteNumber(stockQuantity);
      if (s === null) return void badRequest(res, "Invalid 'stockQuantity'");
      data.stockQuantity = s;
    }

    if (rating !== undefined) {
      if (rating === null || rating === "") {
        data.rating = null;
      } else {
        const r = toFiniteNumber(rating);
        if (r === null) return void badRequest(res, "Invalid 'rating'");
        data.rating = r;
      }
    }

    if (Object.keys(data).length === 0) {
      return void badRequest(res, "No valid fields provided to update");
    }

    const updated = await prisma.products.update({
      where: { productId: id },
      data,
    });

    res.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return void res.status(404).json({ message: "Product not found" });
    }
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Error updating product" });
  }
}

/** DELETE /products/:id */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const deleted = await prisma.products.delete({
      where: { productId: id },
    });

    res.json({ message: "Product deleted successfully", deleted });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return void res.status(404).json({ message: "Product not found" });
    }
    console.error("deleteProduct error:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
}