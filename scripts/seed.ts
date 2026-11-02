// Cadastra as categorias iniciais e os sabores do protótipo, cada um só se ainda não houver nenhum.
// Uso: npm run db:seed
import { eq } from "drizzle-orm";
import { categories, db, products } from "../src/db";

const STARTING_CATEGORIES = ["Sacolé Gourmet", "Picolé de Palito", "Dudu", "Cremosinho"];

async function main() {
  if ((await db.$count(categories)) === 0) {
    // Uma por vez para manter a ordem dos ids, que é a ordem no catálogo.
    for (const name of STARTING_CATEGORIES) await db.insert(categories).values({ name });
    console.log(`${STARTING_CATEGORIES.length} categorias cadastradas.`);
  } else {
    console.log("Já existem categorias; nada foi alterado.");
  }

  const existing = await db.$count(products);
  if (existing > 0) {
    console.log(`Já existem ${existing} sabores; nada foi alterado.`);
    process.exit(0);
  }

  const [palito] = await db.select().from(categories).where(eq(categories.name, "Picolé de Palito"));
  const categoryId = palito?.id ?? null;

  await db.insert(products).values(
    [
      { name: "Ninho com Nutella", description: "Creme de leite Ninho com recheio de Nutella.", priceCents: 900, stock: 12, color: "creme", tag: "Mais pedido" },
      { name: "Morango com leite condensado", priceCents: 800, stock: 4, color: "rosa" },
      { name: "Maracujá cremoso", priceCents: 800, stock: 9, color: "amarelo" },
      { name: "Açaí com Ninho", priceCents: 900, stock: 15, color: "roxo", tag: "Novo" },
      { name: "Coco queimado", priceCents: 700, stock: 0, color: "caramelo" },
      { name: "Limão siciliano", priceCents: 700, stock: 6, color: "verde", visible: false },
    ].map((p) => ({ ...p, categoryId })),
  );

  console.log("6 sabores de exemplo cadastrados.");
  process.exit(0);
}

main();
