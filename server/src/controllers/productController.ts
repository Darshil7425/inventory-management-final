import type { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/** GET /products?search=foo */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const search = (req.query.search ?? "").toString().trim();

    const where: Prisma.ProductsWhereInput | undefined = search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined;

    const products = await prisma.products.findMany({
      where,
      orderBy: { createdAt: "desc" }, // column exists now
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
    const { name, price, stockQuantity, rating } = req.body;

    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);
    const parsedRating =
      rating !== undefined && rating !== null ? Number(rating) : undefined;

    if (!name || !Number.isFinite(parsedPrice) || !Number.isFinite(parsedStock)) {
      res.status(400).json({ message: "Missing or invalid fields" });
      return;
    }

    // IMPORTANT: Do NOT set productId. Prisma will generate UUID (schema has @default(uuid()))
    const data: Prisma.ProductsCreateInput = {
      name: String(name),
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
