import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type Photo = { url: string; publicId: string };

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  // Sem categoria (null) aparece em "Outros" no catálogo.
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  lowStockAt: integer("low_stock_at").notNull().default(5),
  visible: boolean("visible").notNull().default(true),
  tag: text("tag").notNull().default(""),
  // Chave de um sabor em src/lib/flavors.ts, usada quando não há foto.
  color: text("color").notNull().default("creme"),
  photos: jsonb("photos").$type<Photo[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderStatus = "pending" | "done" | "canceled";
// "" quando o checkout não pergunta como o cliente quer receber.
export type Fulfillment = "entrega" | "retirada" | "balcao" | "";
export type PaymentMethod = "pix" | "cartao" | "dinheiro" | "";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Usado na URL de confirmação do cliente, para não expor ids sequenciais.
  token: uuid("token").notNull().unique().defaultRandom(),
  customerName: text("customer_name").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  fulfillment: text("fulfillment").$type<Fulfillment>().notNull().default(""),
  paymentMethod: text("payment_method").$type<PaymentMethod>().notNull().default(""),
  address: text("address").notNull().default(""),
  note: text("note").notNull().default(""),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  // Nome e preço copiados no momento do pedido.
  name: text("name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  qty: integer("qty").notNull(),
});
