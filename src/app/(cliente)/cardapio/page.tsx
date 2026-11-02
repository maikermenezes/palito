import type { Metadata } from "next";
import { getCatalog, getCategories } from "@/lib/data";
import { Catalog } from "../Catalog";
import { CatalogHeader } from "../CatalogHeader";

export const metadata: Metadata = { title: "Cardápio" };

// Só para ver os sabores: sem sacola nem pedido.
export default async function MenuPage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  return (
    <div className="flex flex-1 flex-col pb-safe">
      <CatalogHeader title="Nossos sabores" subtitle="Veja o que tem hoje e quantos ainda restam de cada sabor." />
      <Catalog products={products} categories={categories} orderable={false} />
    </div>
  );
}
