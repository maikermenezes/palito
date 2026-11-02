import type { Metadata } from "next";
import { getCatalog } from "@/lib/data";
import { Bag } from "./Bag";

export const metadata: Metadata = { title: "Sua sacola" };

export default async function BagPage() {
  const products = await getCatalog();
  return <Bag products={products} />;
}
