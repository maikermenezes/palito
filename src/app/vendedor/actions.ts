"use server";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { and, eq, inArray, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categories, db, orderItems, orders, products, users, type Photo } from "@/db";
import { createSession, deleteSession, requireVendor } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/data";
import { FLAVOR_COLORS } from "@/lib/flavors";
import { parseMoney } from "@/lib/format";

const UPLOAD_FOLDER = "palito";

function productsChanged() {
  updateTag(PRODUCTS_TAG);
  refresh();
}

// ---------- Sessão ----------

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou senha não conferem." };
  }
  await createSession(user.id);
  redirect("/vendedor/estoque");
}

export async function logout() {
  await deleteSession();
  redirect("/vendedor/login");
}

// ---------- Estoque ----------

export async function adjustStock(productId: number, delta: number) {
  await requireVendor();
  await db
    .update(products)
    .set({ stock: sql`greatest(${products.stock} + ${Math.trunc(delta)}, 0)`, updatedAt: new Date() })
    .where(eq(products.id, productId));
  productsChanged();
}

export async function setVisible(productId: number, visible: boolean) {
  await requireVendor();
  await db
    .update(products)
    .set({ visible, updatedAt: new Date() })
    .where(eq(products.id, productId));
  productsChanged();
}

// ---------- Produto ----------

const photoSchema = z.object({
  url: z.string().url().startsWith("https://res.cloudinary.com/"),
  publicId: z.string().min(1),
});

const productSchema = z.object({
  categoryId: z.number().int().positive().nullable(),
  name: z.string().trim().min(1, "Dê um nome ao sabor.").max(80),
  description: z.string().trim().max(300),
  priceCents: z.number({ error: "Preço inválido." }).int().min(0, "Preço inválido.").max(100000),
  stock: z.number().int().min(0).max(100000),
  lowStockAt: z.number().int().min(0).max(100000),
  visible: z.boolean(),
  tag: z.string().trim().max(20),
  color: z.enum(Object.keys(FLAVOR_COLORS) as [string, ...string[]]),
  photos: z.array(photoSchema).max(4),
});

export type ProductFormState = { error?: string } | undefined;

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireVendor();
  const id = Number(formData.get("id")) || null;
  const int = (k: string) => {
    const n = parseInt(String(formData.get(k) ?? ""), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  let photos: unknown = [];
  try {
    photos = JSON.parse(String(formData.get("photos") ?? "[]"));
  } catch {}

  const parsed = productSchema.safeParse({
    categoryId: Number(formData.get("categoryId")) || null,
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    priceCents: parseMoney(String(formData.get("price") ?? "")),
    stock: int("stock"),
    lowStockAt: int("lowStockAt"),
    visible: formData.get("visible") === "on",
    tag: formData.get("tag") ?? "",
    color: formData.get("color") ?? "creme",
    photos,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Confira os campos." };
  const data = parsed.data;
  if (data.categoryId) {
    const [cat] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, data.categoryId));
    if (!cat) data.categoryId = null;
  }

  if (id) {
    const [old] = await db.select({ photos: products.photos }).from(products).where(eq(products.id, id));
    if (!old) return { error: "Esse sabor não existe mais." };
    await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
    const kept = new Set(data.photos.map((p) => p.publicId));
    await destroyPhotos(old.photos.filter((p) => !kept.has(p.publicId)));
  } else {
    await db.insert(products).values(data);
  }
  updateTag(PRODUCTS_TAG);
  redirect("/vendedor/estoque");
}

export async function deleteProduct(productId: number) {
  await requireVendor();
  const [deleted] = await db.delete(products).where(eq(products.id, productId)).returning();
  if (deleted) await destroyPhotos(deleted.photos);
  updateTag(PRODUCTS_TAG);
  redirect("/vendedor/estoque");
}

// Assinatura para o navegador mandar a foto direto ao Cloudinary.
export async function signUpload() {
  await requireVendor();
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) throw new Error("CLOUDINARY_URL não está definido no .env");
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: UPLOAD_FOLDER, timestamp };
  const signature = cloudinary.utils.api_sign_request(params, api_secret);
  return { ...params, signature, apiKey: api_key, cloudName: cloud_name };
}

async function destroyPhotos(photos: Photo[]) {
  const ids = photos.map((p) => p.publicId).filter((id) => id.startsWith(UPLOAD_FOLDER + "/"));
  if (ids.length === 0) return;
  try {
    await cloudinary.api.delete_resources(ids);
  } catch (err) {
    console.error("Falha ao apagar fotos no Cloudinary", err);
  }
}

// ---------- Categorias ----------

export type CategoryFormState = { error?: string; ok?: number } | undefined;

export async function addCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireVendor();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  if (!name) return { error: "Dê um nome à categoria." };
  if (name.length > 40) return { error: "Use um nome mais curto (até 40 letras)." };
  const [taken] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(sql`lower(${categories.name}) = lower(${name})`);
  if (taken) return { error: `Já existe a categoria "${name}".` };
  await db.insert(categories).values({ name });
  productsChanged();
  return { ok: Date.now() };
}

// Os sabores da categoria não são apagados: ficam sem categoria ("Outros" no catálogo).
export async function deleteCategory(categoryId: number) {
  await requireVendor();
  await db.delete(categories).where(eq(categories.id, categoryId));
  productsChanged();
}

// ---------- Pedidos ----------

export async function confirmOrder(orderId: number) {
  await requireVendor();
  const units = await db.transaction(async (tx) => {
    const [order] = await tx
      .update(orders)
      .set({ status: "done", closedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
      .returning({ id: orders.id });
    if (!order) return 0;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.productId == null) continue;
      await tx
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)`, updatedAt: new Date() })
        .where(eq(products.id, item.productId));
    }
    return items.reduce((n, i) => n + i.qty, 0);
  });
  productsChanged();
  return { units };
}

export async function cancelOrder(orderId: number) {
  await requireVendor();
  await db
    .update(orders)
    .set({ status: "canceled", closedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
  refresh();
}

const walkInSchema = z
  .array(z.object({ productId: z.number().int(), qty: z.number().int().min(1).max(1000) }))
  .min(1);

// Venda feita na hora (sem pedido pelo app): já entra como vendida e baixa o estoque.
export async function registerWalkIn(input: { productId: number; qty: number }[]) {
  await requireVendor();
  const lines = walkInSchema.parse(input);
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, lines.map((l) => l.productId)));

  const items = lines.flatMap((l) => {
    const p = rows.find((r) => r.id === l.productId);
    return p ? [{ productId: p.id, name: p.name, unitPriceCents: p.priceCents, qty: l.qty }] : [];
  });
  if (items.length === 0) return;

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        customerName: "Venda avulsa",
        fulfillment: "balcao",
        status: "done",
        closedAt: new Date(),
        totalCents: items.reduce((s, i) => s + i.qty * i.unitPriceCents, 0),
      })
      .returning({ id: orders.id });
    await tx.insert(orderItems).values(items.map((i) => ({ ...i, orderId: order.id })));
    for (const item of items) {
      await tx
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)`, updatedAt: new Date() })
        .where(eq(products.id, item.productId));
    }
  });
  updateTag(PRODUCTS_TAG);
  redirect("/vendedor/pedidos");
}
