import { Router } from "express";
import {
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct, 
} from "../controllers/productController";

const router = Router();

// Routes
router.get("/", getProducts);             // fetch all products
router.post("/", createProduct);          // create a product
router.put("/:id", updateProduct);        //  edit/update product
router.delete("/:id", deleteProduct);     // delete product by id

export default router;