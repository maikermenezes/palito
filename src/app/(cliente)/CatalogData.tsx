import { connection } from "next/server";
import { getCatalog, getCategories } from "@/lib/data";
import { Catalog } from "./Catalog";

// Lê o catálogo na hora do acesso, nunca no build: assim o build não depende do banco.
// O resultado continua em cache (getCatalog/getCategories) e é renovado quando o vendedor muda algo.
export async function CatalogData({ orderable = true }: { orderable?: boolean }) {
  await connection();
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  return <Catalog products={products} categories={categories} orderable={orderable} />;
}

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pt-2" aria-busy="true" aria-label="Carregando sabores">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[260px] rounded-[20px] border border-borda bg-white" />
      ))}
    </div>
  );
}
