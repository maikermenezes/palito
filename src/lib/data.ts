import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { asc, count, desc, eq, inArray } from "drizzle-orm";
import { categories, db, orderItems, orders, products } from "@/db";
import { requireVendor } from "./auth";

export const PRODUCTS_TAG = "products";

const catalogColumns = {
  id: products.id,
  categoryId: products.categoryId,
  name: products.name,
  description: products.description,
  priceCents: products.priceCents,
  stock: products.stock,
  tag: products.tag,
  color: products.color,
  photos: products.photos,
};

export type CatalogProduct = Awaited<ReturnType<typeof getCatalog>>[number];

// Catálogo público: igual para todo mundo, invalidado pelas ações do vendedor.
export async function getCatalog() {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");
  return db
    .select(catalogColumns)
    .from(products)
    .where(eq(products.visible, true))
    .orderBy(asc(products.createdAt), asc(products.id));
}

export type Category = { id: number; name: string };

// Mesma tag do catálogo: mudar categorias muda o que o cliente vê.
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.id));
}

export async function getVendorCategories() {
  await requireVendor();
  return db
    .select({ id: categories.id, name: categories.name, productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.id));
}

export async function getVendorProducts() {
  await requireVendor();
  return db.select().from(products).orderBy(asc(products.createdAt), asc(products.id));
}

export async function getVendorProduct(id: number) {
  await requireVendor();
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product ?? null;
}

export async function getVendorOrders() {
  await requireVendor();
  const list = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(60);
  if (list.length === 0) return [];
  const items = await db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      name: orderItems.name,
      qty: orderItems.qty,
      unitPriceCents: orderItems.unitPriceCents,
      stock: products.stock,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(inArray(orderItems.orderId, list.map((o) => o.id)))
    .orderBy(asc(orderItems.id));
  return list.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }));
}

export async function getOrderByToken(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const [order] = await db.select().from(orders).where(eq(orders.token, token));
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));
  return { ...order, items };
}
