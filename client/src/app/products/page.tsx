"use client";

import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/state/api";
import { PlusCircleIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import EditProductDialog from "./EditProductDialog";
import Image from "next/image";
import ConfirmDelete from "@/app/products/ConfirmDelete";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating?: number | null;
};

type Product = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  rating?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

const hashToImageIndex = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 3) + 1; // 1..3
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // edit state
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  // queries & mutations
  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => setSelected(null), 150);
  };

  const handleEditSave = async (values: ProductFormData) => {
    if (!selected) return;
    try {
      await updateProduct({
        id: selected.productId,
        body: values,
      }).unwrap();
      closeEdit();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (isLoading) return <div className="py-4">Loading...</div>;

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border rounded-lg border-zinc-200 bg-white">
          <SearchIcon className="w-5 h-5 text-zinc-500 m-2" />
          <input
            className="w-full py-2 px-2 rounded-r-lg bg-transparent outline-none"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Product
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imgIdx = hashToImageIndex(product.productId);
          return (
            <div
              key={product.productId}
              role="button"
              tabIndex={0}
              onClick={() => openEdit(product)}
              onKeyDown={(e) => e.key === "Enter" && openEdit(product)}
              className="border shadow-sm rounded-xl p-4 bg-white transition hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex flex-col items-center">
                <Image
                  src={`https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/product${imgIdx}.png`}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mb-3 rounded-2xl w-36 h-36 object-cover"
                />
                <h3 className="text-lg text-zinc-900 font-semibold text-center">
                  {product.name}
                </h3>
                <p className="text-zinc-800">${product.price.toFixed(2)}</p>
                <div className="text-sm text-zinc-600 mt-1">
                  Stock: {product.stockQuantity}
                </div>
                {typeof product.rating === "number" && (
                  <div className="flex items-center mt-2">
                    <Rating rating={product.rating} />
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-center mt-4">
                <ConfirmDelete
                  title={`Delete "${product.name}"?`}
                  description="This action cannot be undone. The product will be permanently removed."
                  onConfirm={() => handleDelete(product.productId)}
                  trigger={
                    <button
                      onClick={(e) => e.stopPropagation()}
                      disabled={isDeleting}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2Icon className="w-4 h-4" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProduct}
      />

      {/* EDIT */}
      <EditProductDialog
        open={editOpen}
        onOpenChange={(o) => (o ? setEditOpen(true) : closeEdit())}
        product={selected ?? undefined}
        onSave={handleEditSave}
        saving={isUpdating}
      />
    </div>
  );
};

export default Products;