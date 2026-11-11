import { CartProvider } from "@/components/store/cart-provider";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { getStoreCategories, getStoreSettings } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  const categories = await getStoreCategories();

  return (
    <CartProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-lime focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.12em] focus:text-black"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader
        categories={categories}
        logoUrl={settings.logoUrl}
        announcement={settings.announcement}
      />
      <main id="conteudo">{children}</main>
      <SiteFooter categories={categories} settings={settings} />
      <CartDrawer />
    </CartProvider>
  );
}
