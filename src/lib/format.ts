const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatPrice(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

export function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

export function formatCep(digits: string) {
  const clean = onlyDigits(digits).slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function formatPhone(digits: string) {
  const clean = onlyDigits(digits).slice(0, 11);
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return clean;
}

export function normalizeWhatsAppNumber(value: string) {
  const digits = onlyDigits(value);
  if (digits.length === 13 && digits.startsWith("55")) {
    return digits;
  }
  if (digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function isValidWhatsAppNumber(value: string) {
  const normalized = normalizeWhatsAppNumber(value);
  if (normalized.length !== 13 || !normalized.startsWith("55")) return false;
  const local = normalized.slice(2);
  const ddd = Number(local.slice(0, 2));
  return (
    ddd >= 11 &&
    ddd <= 99 &&
    local.length === 11 &&
    local.startsWith("9", 2)
  );
}

export function buildWhatsAppLink(value: string, message?: string) {
  if (!isValidWhatsAppNumber(value)) return null;
  const number = normalizeWhatsAppNumber(value);
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}

export function parsePriceToCents(value: string) {
  const clean = value
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  if (!clean) return null;
  const parsed = Number(clean);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
) {
  return count === 1 ? singular : plural;
}
