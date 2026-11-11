import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { ProductGallery } from "@/components/store/product-gallery";
import { PurchasePanel } from "@/components/store/purchase-panel";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import {
  getStoreProductBySlug,
  getStoreRelatedProducts,
} from "@/lib/storefront";
import { siteConfig } from "@/config/site";
import { SHIPPING_NOTICE } from "@/lib/shipping";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };

  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} — ${product.categoryName} da ZEVEN SPORTS.`,
    openGraph: {
      title: product.name,
      description:
        product.description ||
        `${product.name} — ${product.categoryName} da ZEVEN SPORTS.`,
      images: product.images[0]?.url
        ? [{ url: product.images[0].url }]
        : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();

  const related = await getStoreRelatedProducts(
    product.categoryId,
    product.id,
    4,
  );
  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  );
  const absoluteImage = product.images[0]?.url
    ? product.images[0].url.startsWith("http")
      ? product.images[0].url
      : `${siteConfig.url}${product.images[0].url}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: absoluteImage ? [absoluteImage] : undefined,
    sku: product.variants[0]?.sku || undefined,
    brand: { "@type": "Brand", name: "ZEVEN SPORTS" },
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/produto/${product.slug}`,
    },
  };

  const jsonLdString = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <div className="shell py-7 md:py-10">
        <nav
          aria-label="Trilha de navegação"
          className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted"
        >
          <Link href="/" className="transition hover:text-ink">
            Início
          </Link>
          <span>/</span>
          <Link href="/catalogo" className="transition hover:text-ink">
            Produtos
          </Link>
          <span>/</span>
          <Link
            href={`/categoria/${product.categorySlug}`}
            className="transition hover:text-ink"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[#555]">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <ProductGallery
            images={product.images}
            productName={product.name}
            categoryName={product.categoryName}
          />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <Link
              href={`/categoria/${product.categorySlug}`}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-ink"
            >
              {product.categoryName}
            </Link>
            <h1 className="mt-2.5 font-display text-[clamp(1.9rem,3.5vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
              {product.name}
            </h1>

            {product.description ? (
              <p className="mt-3 max-w-[520px] text-sm leading-relaxed text-[#5d5d5d]">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6">
              <PurchasePanel
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  priceCents: product.priceCents,
                  compareAtCents: product.compareAtCents,
                  imageUrl: product.imageUrl,
                  categoryName: product.categoryName,
                }}
                variants={product.variants}
              />
            </div>

            <div className="mt-7 border-t border-line">
              <details className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink [&::-webkit-details-marker]:hidden">
                  Descrição
                  <Plus
                    size={15}
                    className="shrink-0 text-muted transition group-open:rotate-45"
                  />
                </summary>
                <div className="whitespace-pre-line pt-3 text-sm leading-relaxed text-muted">
                  {product.description ||
                    "A descrição deste produto será publicada em breve."}
                </div>
              </details>

              <details className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink [&::-webkit-details-marker]:hidden">
                  Composição e cuidados
                  <Plus
                    size={15}
                    className="shrink-0 text-muted transition group-open:rotate-45"
                  />
                </summary>
                <div className="whitespace-pre-line pt-3 text-sm leading-relaxed text-muted">
                  {product.details ||
                    "As informações de composição e cuidados serão publicadas pela loja."}
                </div>
              </details>

              <details className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink [&::-webkit-details-marker]:hidden">
                  Entrega e pagamento
                  <Plus
                    size={15}
                    className="shrink-0 text-muted transition group-open:rotate-45"
                  />
                </summary>
                <div className="space-y-2.5 pt-3 text-sm leading-relaxed text-muted">
                  <p>{SHIPPING_NOTICE}</p>
                  <p>
                    Pagamento por PIX ou cartão de crédito, com confirmação
                    feita pela loja. Nenhuma cobrança automática é realizada
                    neste site.
                  </p>
                </div>
              </details>

              <details className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink [&::-webkit-details-marker]:hidden">
                  Trocas e devoluções
                  <Plus
                    size={15}
                    className="shrink-0 text-muted transition group-open:rotate-45"
                  />
                </summary>
                <div className="pt-3 text-sm leading-relaxed text-muted">
                  As condições de troca e devolução serão publicadas pela loja
                  antes da abertura das vendas. Para dúvidas, utilize os canais
                  oficiais de atendimento.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-line bg-[#f7f7f5]">
          <div className="shell py-12 md:py-16">
            <SectionHeading
              eyebrow="Continue explorando"
              title="Você também pode gostar"
              href={`/categoria/${product.categorySlug}`}
              linkLabel={`Ver ${product.categoryName}`}
            />
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="shell flex justify-center py-10">
        <Link href="/catalogo" className="btn btn-outline">
          Voltar para o catálogo
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
