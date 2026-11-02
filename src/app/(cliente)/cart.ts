"use client";

import { useSyncExternalStore } from "react";

// Sacola do cliente, guardada no aparelho: { [productId]: quantidade }.
export type Cart = Record<string, number>;

const KEY = "palito:sacola";
const EMPTY: Cart = {};
let cache: Cart | null = null;
const listeners = new Set<() => void>();

function read(): Cart {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Cart;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Cart) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  // null até ler o aparelho, para não piscar "sacola vazia" na hidratação.
  const cart = useSyncExternalStore(subscribe, read, () => null);
  return {
    cart,
    ready: cart !== null,
    setQty(id: number, qty: number) {
      const next = { ...read() };
      if (qty > 0) next[id] = qty;
      else delete next[id];
      write(next);
    },
    clear() {
      write(EMPTY);
    },
  };
}

// Dados do cliente lembrados para o próximo pedido.
export type Customer = { customerName: string; whatsapp: string; address: string };
const CUSTOMER_KEY = "palito:cliente";

export function loadCustomer(): Partial<Customer> {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveCustomer(c: Customer) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
  } catch {}
}
