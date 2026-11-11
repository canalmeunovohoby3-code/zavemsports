import type {
  Audience,
  CategoryKind,
  HomeSectionMode,
  OrderStatus,
  PaymentMethod,
} from "@/config/site";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  audience: Audience;
  kind: CategoryKind;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  compareAtCents: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryAudience: Audience;
  categoryKind: CategoryKind;
  imageUrl: string;
  totalStock: number;
  sizes: string[];
  createdAt: string;
};

export type ProductImage = {
  id: number;
  url: string;
  alt: string;
  sortOrder: number;
};

export type ProductVariant = {
  id: number;
  size: string;
  stock: number;
  sku: string;
  sortOrder: number;
};

export type ProductDetail = ProductSummary & {
  description: string;
  details: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type OrderItem = {
  id: number;
  productId: number | null;
  variantId: number | null;
  productName: string;
  productSlug: string;
  imageUrl: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderSummary = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
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

export type OrderDetail = OrderSummary & {
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
  items: OrderItem[];
  updatedAt: string;
};

export type CustomerSummary = {
  id: number;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
  createdAt: string;
};

export type AdminProduct = ProductSummary & {
  description: string;
  details: string;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type HomeSection = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  sourceMode: HomeSectionMode;
  sourceCategoryId: number | null;
  sourceCategorySlug: string | null;
  sourceAudience: Audience | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productIds: number[];
  products: ProductSummary[];
};

export type DashboardStats = {
  activeProducts: number;
  totalProducts: number;
  pendingOrders: number;
  totalOrders: number;
  lowStockVariants: number;
  customers: number;
  confirmedRevenueCents: number;
};
