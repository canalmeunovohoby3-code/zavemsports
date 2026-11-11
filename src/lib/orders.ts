import { randomBytes, randomInt } from "node:crypto";
import type { OrderStatus, PaymentMethod } from "@/config/site";
import { getDb } from "@/lib/db";
import { onlyDigits } from "@/lib/format";

export class OrderError extends Error {
  code: string;
  constructor(message: string, code = "ORDER_ERROR") {
    super(message);
    this.name = "OrderError";
    this.code = code;
  }
}

export type PlaceOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressCep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: Array<{ variantId: number; quantity: number }>;
  expectedSubtotalCents: number;
};

type VariantProductRow = {
  variantId: number;
  productId: number;
  size: string;
  stock: number;
  productName: string;
  productSlug: string;
  priceCents: number;
  productActive: number;
  categoryActive: number;
  imageUrl: string | null;
};

function generateOrderNumber() {
  const db = getDb();
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = String(randomInt(1000, 10000));
    const candidate = `ZV-${stamp}-${suffix}`;
    const exists = db
      .prepare("SELECT id FROM orders WHERE order_number = ?")
      .get(candidate);
    if (!exists) return candidate;
  }

  return `ZV-${stamp}-${Date.now().toString().slice(-6)}`;
}

export function placeOrder(input: PlaceOrderInput) {
  const db = getDb();

  const run = db.transaction(() => {
    const rows: VariantProductRow[] = [];

    for (const item of input.items) {
      const row = db
        .prepare(
          `SELECT
            v.id AS variantId,
            v.product_id AS productId,
            v.size,
            v.stock,
            p.name AS productName,
            p.slug AS productSlug,
            p.price_cents AS priceCents,
            p.is_active AS productActive,
            c.is_active AS categoryActive,
            (
              SELECT i.url FROM product_images i
              WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1
            ) AS imageUrl
           FROM product_variants v
           JOIN products p ON p.id = v.product_id
           JOIN categories c ON c.id = p.category_id
           WHERE v.id = ?`,
        )
        .get(item.variantId) as VariantProductRow | undefined;

      if (!row) {
        throw new OrderError(
          "Um dos itens não está mais disponível. Volte ao carrinho e revise sua seleção.",
          "ITEM_UNAVAILABLE",
        );
      }

      if (!row.productActive || !row.categoryActive) {
        throw new OrderError(
          `O produto "${row.productName}" não está mais disponível.`,
          "PRODUCT_INACTIVE",
        );
      }

      if (item.quantity > row.stock) {
        throw new OrderError(
          row.stock === 0
            ? `"${row.productName}" (${row.size}) esgotou.`
            : `Restam apenas ${row.stock} unidade(s) de "${row.productName}" (${row.size}).`,
          "INSUFFICIENT_STOCK",
        );
      }

      rows.push({ ...row, stock: item.quantity });
    }

    const subtotalCents = rows.reduce(
      (total, row, index) =>
        total + row.priceCents * input.items[index].quantity,
      0,
    );

    if (subtotalCents !== input.expectedSubtotalCents) {
      throw new OrderError(
        "Os preços dos produtos foram atualizados. Volte ao carrinho para revisar antes de finalizar.",
        "PRICE_CHANGED",
      );
    }

    let customer = db
      .prepare("SELECT id FROM customers WHERE email = ? COLLATE NOCASE")
      .get(input.customerEmail) as { id: number } | undefined;

    const now = new Date().toISOString();

    if (customer) {
      db.prepare(
        "UPDATE customers SET name = ?, phone = ? WHERE id = ?",
      ).run(input.customerName, input.customerPhone, customer.id);
    } else {
      const result = db
        .prepare(
          "INSERT INTO customers (name, email, phone, document, created_at) VALUES (?, ?, ?, '', ?)",
        )
        .run(
          input.customerName,
          input.customerEmail,
          input.customerPhone,
          now,
        );
      customer = { id: Number(result.lastInsertRowid) };
    }

    const orderNumber = generateOrderNumber();
    const publicToken = randomBytes(24).toString("hex");

    const orderResult = db
      .prepare(
        `INSERT INTO orders
          (order_number, public_token, customer_id, status, payment_method,
           shipping_method, shipping_cents, subtotal_cents, total_cents,
           customer_name, customer_email, customer_phone, address_cep,
           address_street, address_number, address_complement,
           address_neighborhood, address_city, address_state, notes,
           created_at, updated_at)
         VALUES (?, ?, ?, 'pending_payment', ?, 'a_calcular', NULL, ?, ?,
           ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        orderNumber,
        publicToken,
        customer.id,
        input.paymentMethod,
        subtotalCents,
        subtotalCents,
        input.customerName,
        input.customerEmail,
        onlyDigits(input.customerPhone),
        onlyDigits(input.addressCep),
        input.addressStreet,
        input.addressNumber,
        input.addressComplement,
        input.addressNeighborhood,
        input.addressCity,
        input.addressState,
        input.notes,
        now,
        now,
      );

    const orderId = Number(orderResult.lastInsertRowid);
    const insertItem = db.prepare(
      `INSERT INTO order_items
        (order_id, product_id, variant_id, product_name, product_slug,
         image_url, size, unit_price_cents, quantity, line_total_cents)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const decrementStock = db.prepare(
      "UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?",
    );

    rows.forEach((row, index) => {
      const quantity = input.items[index].quantity;
      const lineTotal = row.priceCents * quantity;
      insertItem.run(
        orderId,
        row.productId,
        row.variantId,
        row.productName,
        row.productSlug,
        row.imageUrl ?? "",
        row.size,
        row.priceCents,
        quantity,
        lineTotal,
      );
      const result = decrementStock.run(quantity, row.variantId, quantity);
      if (result.changes !== 1) {
        throw new OrderError(
          `O estoque de "${row.productName}" (${row.size}) foi alterado. Revise o carrinho.`,
          "STOCK_CHANGED",
        );
      }
    });

    return { orderNumber, publicToken, orderId, subtotalCents };
  });

  return run.immediate();
}

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["confirmed", "canceled"],
  confirmed: ["processing", "canceled"],
  processing: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

export function updateOrderStatus(orderId: number, nextStatus: OrderStatus) {
  const db = getDb();
  const order = db
    .prepare("SELECT id, status FROM orders WHERE id = ?")
    .get(orderId) as { id: number; status: OrderStatus } | undefined;

  if (!order) {
    return { ok: false as const, error: "Pedido não encontrado." };
  }

  if (order.status === nextStatus) {
    return { ok: true as const };
  }

  if (!orderStatusTransitions[order.status].includes(nextStatus)) {
    return {
      ok: false as const,
      error: "Essa alteração de status não é permitida.",
    };
  }

  const run = db.transaction(() => {
    if (nextStatus === "canceled") {
      const items = db
        .prepare(
          "SELECT variant_id AS variantId, quantity FROM order_items WHERE order_id = ?",
        )
        .all(orderId) as Array<{
        variantId: number | null;
        quantity: number;
      }>;
      const restore = db.prepare(
        "UPDATE product_variants SET stock = stock + ? WHERE id = ?",
      );
      for (const item of items) {
        if (item.variantId) {
          restore.run(item.quantity, item.variantId);
        }
      }
    }

    db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(
      nextStatus,
      new Date().toISOString(),
      orderId,
    );
  });

  run.immediate();
  return { ok: true as const };
}
