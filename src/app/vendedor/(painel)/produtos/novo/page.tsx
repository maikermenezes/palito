import type { Metadata } from "next";
import { Suspense } from "react";
import { requireVendor } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Novo sabor" };

export default function NewProductPage() {
  return (
    <Suspense>
      <Guarded />
    </Suspense>
  );
}

async function Guarded() {
  await requireVendor();
  return <ProductForm categories={await getCategories()} />;
}
