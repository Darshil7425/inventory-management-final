"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSave: (values: ProductFormData) => void | Promise<void>;
  saving?: boolean;
}

export default function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
  saving,
}: Props) {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: null,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        stockQuantity: product.stockQuantity,
        rating:
          typeof product.rating === "number" ? Number(product.rating) : null,
      });
    }
  }, [product]);

  const handleChange =
    (key: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (key === "price" || key === "stockQuantity") {
        setForm((s) => ({ ...s, [key]: Number(v) }));
      } else if (key === "rating") {
        setForm((s) => ({ ...s, rating: v === "" ? null : Number(v) }));
      } else {
        setForm((s) => ({ ...s, name: v }));
      }
    };

  const submit = async () => {
    await onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-lg rounded-2xl shadow-2xl
          !bg-white !text-zinc-900 !border !border-zinc-200
          dark:!bg-white dark:!text-zinc-900 dark:!border-zinc-200
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-900">
            Edit product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-zinc-800">Name</Label>
            <Input
              value={form.name}
              onChange={handleChange("name")}
              className="
                !bg-white !text-zinc-900
                !border-zinc-300 focus-visible:!ring-2 focus-visible:!ring-blue-500
              "
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label className="text-zinc-800">Price</Label>
            <Input
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange("price")}
              className="
                !bg-white !text-zinc-900
                !border-zinc-300 focus-visible:!ring-2 focus-visible:!ring-blue-500
              "
            />
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <Label className="text-zinc-800">Stock Quantity</Label>
            <Input
              type="number"
              value={form.stockQuantity}
              onChange={handleChange("stockQuantity")}
              className="
                !bg-white !text-zinc-900
                !border-zinc-300 focus-visible:!ring-2 focus-visible:!ring-blue-500
              "
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-zinc-800">Rating (optional)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating ?? ""}
              onChange={handleChange("rating")}
              placeholder="e.g. 4.5"
              className="
                !bg-white !text-zinc-900
                !border-zinc-300 focus-visible:!ring-2 focus-visible:!ring-blue-500
              "
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="
              !border-zinc-300 !text-zinc-700 hover:!bg-zinc-50
              dark:!border-zinc-300 dark:!text-zinc-700 dark:hover:!bg-zinc-50
            "
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="
              !bg-blue-600 hover:!bg-blue-700 !text-white
              disabled:opacity-60 transition-all
            "
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}