import { getCatalog, getCategories } from "@/lib/data";
import { Catalog } from "./Catalog";
import { CatalogHeader } from "./CatalogHeader";

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  return (
    <div className="flex flex-1 flex-col">
      <CatalogHeader
        title="Escolha seus sabores"
        subtitle="Você faz o pedido aqui e paga direto pra gente — Pix, cartão ou dinheiro."
      />
      <Catalog products={products} categories={categories} />
    </div>
  );
}
