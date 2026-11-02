import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconBack } from "@/components/icons";
import { getVendorCategories } from "@/lib/data";
import { CategoryManager } from "./CategoryManager";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return (
    <>
      <header className="flex items-center gap-2 p-4">
        <Link
          href="/vendedor/estoque"
          aria-label="Voltar ao estoque"
          className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
        >
          <IconBack />
        </Link>
        <h1 className="font-display text-[26px] font-semibold">Categorias</h1>
      </header>
      <Suspense fallback={<div className="mx-4 h-64 rounded-[20px] bg-white" />}>
        <Categories />
      </Suspense>
    </>
  );
}

async function Categories() {
  const categories = await getVendorCategories();
  return <CategoryManager categories={categories} />;
}
