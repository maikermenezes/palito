import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategories, getVendorProduct } from "@/lib/data";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Editar sabor" };

export default function EditProductPage({ params }: PageProps<"/vendedor/produtos/[id]">) {
  return (
    <Suspense>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [product, categories] = await Promise.all([getVendorProduct(id), getCategories()]);
  if (!product) notFound();
  return <ProductForm product={product} categories={categories} />;
}
