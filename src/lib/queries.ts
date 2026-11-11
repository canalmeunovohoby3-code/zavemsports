import { getDb } from "@/lib/db";
import type {
  AdminProduct,
  Category,
  CustomerSummary,
  DashboardStats,
  OrderDetail,
  OrderItem,
  ProductDetail,
  ProductImage,
  ProductSummary,
  ProductVariant,
} from "@/lib/types";
import type { Audience, CategoryKind, OrderStatus } from "@/config/site";
import { slugify } from "@/lib/format";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  audience: Audience;
  kind: CategoryKind;
  imageUrl: string;
  sortOrder: number;
  isActive: number;
  productCount: number;
};

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  compareAtCents: number | null;
  isActive: number;
  isFeatured: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryAudience: Audience;
  categoryKind: CategoryKind;
  imageUrl: string | null;
  totalStock: number;
  sizesCsv: string | null;
  createdAt: string;
  description?: string;
  details?: string;
};

type ImageRow = {
  id: number;
  url: string;
  alt: string;
  sortOrder: number;
};

type VariantRow = {
  id: number;
  size: string;
  stock: number;
  sku: string;
  sortOrder: number;
};

const categorySelect = (countActiveOnly: boolean) => `
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.audience,
    c.kind,
    c.image_url AS imageUrl,
    c.sort_order AS sortOrder,
    c.is_active AS isActive,
    (
      SELECT COUNT(*) FROM products p
      WHERE p.category_id = c.id
      ${countActiveOnly ? "AND p.is_active = 1" : ""}
    ) AS productCount
  FROM categories c
`;

function mapCategory(row: CategoryRow): Category {
  return {
    ...row,
    isActive: Boolean(row.isActive),
    productCount: Number(row.productCount),
  };
}

export function listCategories(options?: {
  includeInactive?: boolean;
  countActiveOnly?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? false;
  const countActiveOnly = options?.countActiveOnly ?? !includeInactive;
  const where = includeInactive ? "" : "WHERE c.is_active = 1";
  const rows = getDb()
    .prepare(
      `${categorySelect(countActiveOnly)} ${where} ORDER BY c.sort_order, c.id`,
    )
    .all() as CategoryRow[];
  return rows.map(mapCategory);
}

export function getCategoryBySlug(slug: string, includeInactive = false) {
  const row = getDb()
    .prepare(
      `${categorySelect(true)} WHERE c.slug = ? ${
        includeInactive ? "" : "AND c.is_active = 1"
      }`,
    )
    .get(slug) as CategoryRow | undefined;
  return row ? mapCategory(row) : null;
}

export function getCategoryById(id: number) {
  const row = getDb()
    .prepare(`${categorySelect(false)} WHERE c.id = ?`)
    .get(id) as CategoryRow | undefined;
  return row ? mapCategory(row) : null;
}

function uniqueSlug(
  table: "products" | "categories",
  desired: string,
  excludeId?: number,
) {
  const db = getDb();
  const base = slugify(desired) || "item";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const row = excludeId
      ? (db
          .prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`)
          .get(candidate, excludeId) as { id: number } | undefined)
      : (db
          .prepare(`SELECT id FROM ${table} WHERE slug = ?`)
          .get(candidate) as { id: number } | undefined);
    if (!row) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export type CategoryInput = {
  name: string;
  description: string;
  audience: Audience;
  kind: CategoryKind;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export function createCategory(input: CategoryInput) {
  const db = getDb();
  const now = new Date().toISOString();
  const slug = uniqueSlug("categories", input.name);
  const result = db
    .prepare(
      `INSERT INTO categories
        (name, slug, description, audience, kind, image_url, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      slug,
      input.description,
      input.audience,
      input.kind,
      input.imageUrl,
      input.sortOrder,
      input.isActive ? 1 : 0,
      now,
    );
  return Number(result.lastInsertRowid);
}

export function updateCategory(id: number, input: CategoryInput) {
  const db = getDb();
  db.prepare(
    `UPDATE categories SET
      name = ?, description = ?, audience = ?, kind = ?,
      image_url = ?, sort_order = ?, is_active = ?
     WHERE id = ?`,
  ).run(
    input.name,
    input.description,
    input.audience,
    input.kind,
    input.imageUrl,
    input.sortOrder,
    input.isActive ? 1 : 0,
    id,
  );
}

export function deleteCategory(id: number) {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) AS count FROM products WHERE category_id = ?")
    .get(id) as { count: number };
  if (row.count > 0) {
    return {
      ok: false as const,
      error:
        "Esta categoria possui produtos vinculados. Mova ou exclua os produtos antes de removê-la.",
    };
  }
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return { ok: true as const };
}

export type ListProductsOptions = {
  categoryId?: number;
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  audience?: Audience;
  kind?: CategoryKind;
  includeInactive?: boolean;
  includeInactiveCategories?: boolean;
  size?: string;
  limit?: number;
  sort?: "recent" | "price-asc" | "price-desc" | "name";
};

function mapProduct(row: ProductRow): ProductSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceCents: Number(row.priceCents),
    compareAtCents:
      row.compareAtCents == null ? null : Number(row.compareAtCents),
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    categoryAudience: row.categoryAudience,
    categoryKind: row.categoryKind,
    imageUrl: row.imageUrl ?? "",
    totalStock: Number(row.totalStock ?? 0),
    sizes: row.sizesCsv ? row.sizesCsv.split("|").filter(Boolean) : [],
    createdAt: row.createdAt,
  };
}

const productSelect = `
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price_cents AS priceCents,
    p.compare_at_cents AS compareAtCents,
    p.is_active AS isActive,
    p.is_featured AS isFeatured,
    p.category_id AS categoryId,
    c.name AS categoryName,
    c.slug AS categorySlug,
    c.audience AS categoryAudience,
    c.kind AS categoryKind,
    (
      SELECT i.url FROM product_images i
      WHERE i.product_id = p.id
      ORDER BY i.sort_order, i.id
      LIMIT 1
    ) AS imageUrl,
    (
      SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v
      WHERE v.product_id = p.id
    ) AS totalStock,
    (
      SELECT GROUP_CONCAT(size, '|') FROM (
        SELECT v.size FROM product_variants v
        WHERE v.product_id = p.id AND v.stock > 0
        ORDER BY v.sort_order, v.id
      )
    ) AS sizesCsv,
    p.created_at AS createdAt
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

export function listProducts(options: ListProductsOptions = {}) {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (!options.includeInactive) {
    conditions.push("p.is_active = 1");
  }
  if (!options.includeInactiveCategories) {
    conditions.push("c.is_active = 1");
  }
  if (options.categoryId) {
    conditions.push("p.category_id = ?");
    params.push(options.categoryId);
  }
  if (options.categorySlug) {
    conditions.push("c.slug = ?");
    params.push(options.categorySlug);
  }
  if (options.featured) {
    conditions.push("p.is_featured = 1");
  }
  if (options.audience) {
    conditions.push("c.audience = ?");
    params.push(options.audience);
  }
  if (options.kind) {
    conditions.push("c.kind = ?");
    params.push(options.kind);
  }
  if (options.size) {
    conditions.push(
      "EXISTS (SELECT 1 FROM product_variants sv WHERE sv.product_id = p.id AND sv.size = ? AND sv.stock > 0)",
    );
    params.push(options.size);
  }
  if (options.query?.trim()) {
    const term = `%${options.query.trim()}%`;
    conditions.push(
      "(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)",
    );
    params.push(term, term, term);
  }

  const orderBy =
    options.sort === "price-asc"
      ? "p.price_cents ASC, p.id DESC"
      : options.sort === "price-desc"
        ? "p.price_cents DESC, p.id DESC"
        : options.sort === "name"
          ? "p.name COLLATE NOCASE ASC"
          : "p.created_at DESC, p.id DESC";

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options.limit ? `LIMIT ${Math.max(1, options.limit)}` : "";

  const rows = getDb()
    .prepare(`${productSelect} ${where} ORDER BY ${orderBy} ${limit}`)
    .all(...params) as ProductRow[];

  return rows.map(mapProduct);
}

export function getProductBySlug(slug: string, includeInactive = false) {
  const row = getDb()
    .prepare(
      `SELECT p.description, p.details, ${productSelect
        .replace("SELECT", "")
        .replace(/^\s*/, "")} WHERE p.slug = ? ${
        includeInactive ? "" : "AND p.is_active = 1 AND c.is_active = 1"
      }`,
    )
    .get(slug) as ProductRow | undefined;
  if (!row) return null;
  return hydrateProduct(row);
}

export function getProductById(id: number) {
  const row = getDb()
    .prepare(
      `SELECT p.description, p.details, ${productSelect
        .replace("SELECT", "")
        .replace(/^\s*/, "")} WHERE p.id = ?`,
    )
    .get(id) as ProductRow | undefined;
  if (!row) return null;
  return hydrateProduct(row);
}

function hydrateProduct(row: ProductRow): ProductDetail {
  const db = getDb();
  const images = db
    .prepare(
      `SELECT id, url, alt, sort_order AS sortOrder
       FROM product_images WHERE product_id = ? ORDER BY sort_order, id`,
    )
    .all(row.id) as ImageRow[];
  const variants = db
    .prepare(
      `SELECT id, size, stock, sku, sort_order AS sortOrder
       FROM product_variants WHERE product_id = ? ORDER BY sort_order, id`,
    )
    .all(row.id) as VariantRow[];

  return {
    ...mapProduct(row),
    description: row.description ?? "",
    details: row.details ?? "",
    images,
    variants: variants.map((variant) => ({
      ...variant,
      size: String(variant.size),
      stock: Number(variant.stock),
      sku: variant.sku ?? "",
    })),
  };
}

export function listAdminProducts(options?: {
  query?: string;
  categoryId?: number;
  status?: "active" | "inactive";
}) {
  const conditions: string[] = [];
  const params: string[] = [];

  if (options?.query?.trim()) {
    const term = `%${options.query.trim()}%`;
    conditions.push("(p.name LIKE ? OR p.slug LIKE ? OR c.name LIKE ?)");
    params.push(term, term, term);
  }
  if (options?.categoryId) {
    conditions.push("p.category_id = ?");
    params.push(String(options.categoryId));
  }
  if (options?.status === "active") conditions.push("p.is_active = 1");
  if (options?.status === "inactive") conditions.push("p.is_active = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(
      `${productSelect} ${where} ORDER BY p.updated_at DESC, p.id DESC LIMIT 500`,
    )
    .all(...params) as ProductRow[];

  return rows.map(mapProduct);
}

export type ProductInput = {
  name: string;
  categoryId: number;
  description: string;
  details: string;
  priceCents: number;
  compareAtCents: number | null;
  isActive: boolean;
  isFeatured: boolean;
  images: Array<{ url: string; alt: string }>;
  variants: Array<{ size: string; stock: number; sku: string }>;
};

export function createProduct(input: ProductInput) {
  const db = getDb();
  const now = new Date().toISOString();
  const slug = uniqueSlug("products", input.name);

  const run = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO products
          (name, slug, category_id, description, details, price_cents,
           compare_at_cents, is_active, is_featured, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.name,
        slug,
        input.categoryId,
        input.description,
        input.details,
        input.priceCents,
        input.compareAtCents,
        input.isActive ? 1 : 0,
        input.isFeatured ? 1 : 0,
        now,
        now,
      );
    const productId = Number(result.lastInsertRowid);

    const insertImage = db.prepare(
      "INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)",
    );
    input.images.forEach((image, index) => {
      insertImage.run(productId, image.url, image.alt, index);
    });

    const insertVariant = db.prepare(
      "INSERT INTO product_variants (product_id, size, stock, sku, sort_order) VALUES (?, ?, ?, ?, ?)",
    );
    input.variants.forEach((variant, index) => {
      insertVariant.run(
        productId,
        variant.size,
        variant.stock,
        variant.sku,
        index,
      );
    });

    return productId;
  });

  return run();
}

export function updateProduct(id: number, input: ProductInput) {
  const db = getDb();
  const now = new Date().toISOString();

  const run = db.transaction(() => {
    db.prepare(
      `UPDATE products SET
        name = ?, category_id = ?, description = ?, details = ?,
        price_cents = ?, compare_at_cents = ?, is_active = ?,
        is_featured = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      input.name,
      input.categoryId,
      input.description,
      input.details,
      input.priceCents,
      input.compareAtCents,
      input.isActive ? 1 : 0,
      input.isFeatured ? 1 : 0,
      now,
      id,
    );

    db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
    const insertImage = db.prepare(
      "INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)",
    );
    input.images.forEach((image, index) => {
      insertImage.run(id, image.url, image.alt, index);
    });

    const existing = db
      .prepare(
        "SELECT id, size FROM product_variants WHERE product_id = ? ORDER BY id",
      )
      .all(id) as Array<{ id: number; size: string }>;
    const existingBySize = new Map(
      existing.map((variant) => [variant.size.toLowerCase(), variant.id]),
    );
    const keepIds = new Set<number>();

    const updateVariant = db.prepare(
      "UPDATE product_variants SET size = ?, stock = ?, sku = ?, sort_order = ? WHERE id = ?",
    );
    const insertVariant = db.prepare(
      "INSERT INTO product_variants (product_id, size, stock, sku, sort_order) VALUES (?, ?, ?, ?, ?)",
    );

    input.variants.forEach((variant, index) => {
      const existingId = existingBySize.get(variant.size.toLowerCase());
      if (existingId) {
        updateVariant.run(
          variant.size,
          variant.stock,
          variant.sku,
          index,
          existingId,
        );
        keepIds.add(existingId);
      } else {
        const result = insertVariant.run(
          id,
          variant.size,
          variant.stock,
          variant.sku,
          index,
        );
        keepIds.add(Number(result.lastInsertRowid));
      }
    });

    const deleteVariant = db.prepare(
      "DELETE FROM product_variants WHERE id = ? AND product_id = ?",
    );
    for (const variant of existing) {
      if (!keepIds.has(variant.id)) deleteVariant.run(variant.id, id);
    }
  });

  run();
}

export function deleteProduct(id: number) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function listAvailableSizes() {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT v.size
       FROM product_variants v
       JOIN products p ON p.id = v.product_id AND p.is_active = 1
       JOIN categories c ON c.id = p.category_id AND c.is_active = 1
       WHERE v.stock > 0
       ORDER BY v.size`,
    )
    .all() as Array<{ size: string }>;
  return rows.map((row) => row.size);
}

export function listAvailableSizesByCategory(categoryId: number) {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT v.size
       FROM product_variants v
       JOIN products p ON p.id = v.product_id AND p.is_active = 1
       WHERE v.stock > 0 AND p.category_id = ?
       ORDER BY v.size`,
    )
    .all(categoryId) as Array<{ size: string }>;
  return rows.map((row) => row.size);
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const products = db
    .prepare(
      `SELECT
        COUNT(*) AS totalProducts,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS activeProducts
       FROM products`,
    )
    .get() as { totalProducts: number; activeProducts: number | null };

  const orders = db
    .prepare(
      `SELECT
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) AS pendingOrders,
        COALESCE(SUM(CASE WHEN status IN ('confirmed','processing','shipped','delivered')
          THEN total_cents ELSE 0 END), 0) AS confirmedRevenueCents
       FROM orders`,
    )
    .get() as {
    totalOrders: number;
    pendingOrders: number | null;
    confirmedRevenueCents: number;
  };

  const lowStock = db
    .prepare(
      `SELECT COUNT(*) AS count
       FROM product_variants v
       JOIN products p ON p.id = v.product_id AND p.is_active = 1
       WHERE v.stock <= 3`,
    )
    .get() as { count: number };

  const customers = db
    .prepare("SELECT COUNT(*) AS count FROM customers")
    .get() as { count: number };

  return {
    activeProducts: Number(products.activeProducts ?? 0),
    totalProducts: Number(products.totalProducts ?? 0),
    pendingOrders: Number(orders.pendingOrders ?? 0),
    totalOrders: Number(orders.totalOrders ?? 0),
    lowStockVariants: Number(lowStock.count ?? 0),
    customers: Number(customers.count ?? 0),
    confirmedRevenueCents: Number(orders.confirmedRevenueCents ?? 0),
  };
}

type OrderSummaryRow = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "pix" | "credit_card";
  totalCents: number;
  subtotalCents: number;
  shippingCents: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  state: string;
  itemCount: number;
  createdAt: string;
};

const orderSummarySelect = `
  SELECT
    o.id,
    o.order_number AS orderNumber,
    o.status,
    o.payment_method AS paymentMethod,
    o.total_cents AS totalCents,
    o.subtotal_cents AS subtotalCents,
    o.shipping_cents AS shippingCents,
    o.customer_name AS customerName,
    o.customer_email AS customerEmail,
    o.customer_phone AS customerPhone,
    o.address_city AS city,
    o.address_state AS state,
    (
      SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi
      WHERE oi.order_id = o.id
    ) AS itemCount,
    o.created_at AS createdAt
  FROM orders o
`;

export function listOrders(options?: {
  status?: OrderStatus;
  customerId?: number;
  query?: string;
  limit?: number;
}) {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (options?.status) {
    conditions.push("o.status = ?");
    params.push(options.status);
  }
  if (options?.customerId) {
    conditions.push("o.customer_id = ?");
    params.push(options.customerId);
  }
  if (options?.query?.trim()) {
    const term = `%${options.query.trim()}%`;
    conditions.push(
      "(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)",
    );
    params.push(term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options?.limit ?? 200;
  const rows = getDb()
    .prepare(
      `${orderSummarySelect} ${where} ORDER BY o.created_at DESC, o.id DESC LIMIT ${Math.max(1, limit)}`,
    )
    .all(...params) as OrderSummaryRow[];

  return rows.map((row) => ({
    ...row,
    shippingCents:
      row.shippingCents == null ? null : Number(row.shippingCents),
    itemCount: Number(row.itemCount),
  }));
}

function getOrderItems(orderId: number): OrderItem[] {
  const rows = getDb()
    .prepare(
      `SELECT
        id, product_id AS productId, variant_id AS variantId,
        product_name AS productName, product_slug AS productSlug,
        image_url AS imageUrl, size, unit_price_cents AS unitPriceCents,
        quantity, line_total_cents AS lineTotalCents
       FROM order_items WHERE order_id = ? ORDER BY id`,
    )
    .all(orderId) as OrderItem[];
  return rows.map((row) => ({
    ...row,
    unitPriceCents: Number(row.unitPriceCents),
    quantity: Number(row.quantity),
    lineTotalCents: Number(row.lineTotalCents),
  }));
}

function mapOrderDetail(
  row: OrderSummaryRow & {
    publicToken: string;
    addressCep: string;
    addressStreet: string;
    addressNumber: string;
    addressComplement: string;
    addressNeighborhood: string;
    addressCity: string;
    addressState: string;
    notes: string;
    shippingMethod: string;
    updatedAt: string;
  },
): OrderDetail {
  return {
    ...row,
    shippingCents: row.shippingCents == null ? null : Number(row.shippingCents),
    itemCount: Number(row.itemCount),
    items: getOrderItems(row.id),
  };
}

const orderDetailSelect = `
  SELECT
    o.id,
    o.order_number AS orderNumber,
    o.public_token AS publicToken,
    o.status,
    o.payment_method AS paymentMethod,
    o.total_cents AS totalCents,
    o.subtotal_cents AS subtotalCents,
    o.shipping_cents AS shippingCents,
    o.shipping_method AS shippingMethod,
    o.customer_name AS customerName,
    o.customer_email AS customerEmail,
    o.customer_phone AS customerPhone,
    o.address_cep AS addressCep,
    o.address_street AS addressStreet,
    o.address_number AS addressNumber,
    o.address_complement AS addressComplement,
    o.address_neighborhood AS addressNeighborhood,
    o.address_city AS addressCity,
    o.address_state AS addressState,
    o.notes,
    o.created_at AS createdAt,
    o.updated_at AS updatedAt,
    (
      SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi
      WHERE oi.order_id = o.id
    ) AS itemCount,
    o.address_city AS city,
    o.address_state AS state
  FROM orders o
`;

export function getOrderById(id: number) {
  const row = getDb()
    .prepare(`${orderDetailSelect} WHERE o.id = ?`)
    .get(id) as Parameters<typeof mapOrderDetail>[0] | undefined;
  return row ? mapOrderDetail(row) : null;
}

export function getOrderByToken(token: string) {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const row = getDb()
    .prepare(`${orderDetailSelect} WHERE o.public_token = ?`)
    .get(token) as Parameters<typeof mapOrderDetail>[0] | undefined;
  return row ? mapOrderDetail(row) : null;
}

export function findOrderForTracking(orderNumber: string, email: string) {
  const row = getDb()
    .prepare(
      `${orderDetailSelect}
       WHERE UPPER(o.order_number) = UPPER(?) AND LOWER(o.customer_email) = LOWER(?)`,
    )
    .get(orderNumber.trim(), email.trim()) as
    | Parameters<typeof mapOrderDetail>[0]
    | undefined;
  return row ? mapOrderDetail(row) : null;
}

export function listCustomers() {
  const rows = getDb()
    .prepare(
      `SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.created_at AS createdAt,
        COUNT(o.id) AS orderCount,
        COALESCE(SUM(CASE WHEN o.status != 'canceled' THEN o.total_cents ELSE 0 END), 0) AS totalSpentCents,
        MAX(o.created_at) AS lastOrderAt
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
    )
    .all() as Array<
    Omit<CustomerSummary, "orderCount" | "totalSpentCents"> & {
      orderCount: number;
      totalSpentCents: number;
    }
  >;
  return rows.map((row) => ({
    ...row,
    orderCount: Number(row.orderCount),
    totalSpentCents: Number(row.totalSpentCents),
  }));
}

export function listLowStock(limit = 8) {
  const rows = getDb()
    .prepare(
      `SELECT
        p.id AS productId, p.name AS productName, p.slug AS productSlug,
        v.id AS variantId, v.size, v.stock
       FROM product_variants v
       JOIN products p ON p.id = v.product_id AND p.is_active = 1
       WHERE v.stock <= 3
       ORDER BY v.stock ASC, p.name ASC
       LIMIT ?`,
    )
    .all(limit) as Array<{
    productId: number;
    productName: string;
    productSlug: string;
    variantId: number;
    size: string;
    stock: number;
  }>;
  return rows;
}

export function listBestSellers(limit = 8) {
  const rows = getDb()
    .prepare(
      `SELECT base.* FROM (
        ${productSelect} WHERE p.is_active = 1 AND c.is_active = 1
      ) base
      JOIN (
        SELECT oi.product_id AS productId, SUM(oi.quantity) AS sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND oi.product_id IS NOT NULL
        GROUP BY oi.product_id
      ) sales ON sales.productId = base.id
      ORDER BY sales.sold DESC, base.createdAt DESC
      LIMIT ?`,
    )
    .all(Math.max(1, limit)) as ProductRow[];

  return {
    hasSales: rows.length > 0,
    products: rows.map(mapProduct),
  };
}

export function getProductsForCategorySection(
  categorySlug: string,
  limit = 4,
) {
  return listProducts({ categorySlug, limit, sort: "recent" });
}

export function getRelatedProducts(
  categoryId: number,
  currentProductId: number,
  limit = 4,
) {
  return listProducts({ categoryId, limit: limit + 1 }).filter(
    (product) => product.id !== currentProductId,
  ).slice(0, limit);
}

export function getProductImages(productId: number): ProductImage[] {
  return getDb()
    .prepare(
      `SELECT id, url, alt, sort_order AS sortOrder
       FROM product_images WHERE product_id = ? ORDER BY sort_order, id`,
    )
    .all(productId) as ImageRow[];
}

export function getProductVariants(productId: number): ProductVariant[] {
  return getDb()
    .prepare(
      `SELECT id, size, stock, sku, sort_order AS sortOrder
       FROM product_variants WHERE product_id = ? ORDER BY sort_order, id`,
    )
    .all(productId) as VariantRow[];
}

export function countUsers() {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS count FROM users")
    .get() as { count: number };
  return Number(row.count);
}

export type AdminProductDetail = AdminProduct;

export function toAdminProduct(product: ProductDetail): AdminProductDetail {
  return product;
}
