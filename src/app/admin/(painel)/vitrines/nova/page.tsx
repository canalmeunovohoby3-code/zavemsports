import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { SectionForm } from "@/components/admin/section-form";
import {
  getNextHomeSectionSortOrder,
  listAdminProducts,
  listCategories,
} from "@/lib/queries";

export const metadata = { title: "Nova vitrine" };

export default function NewHomeSectionPage() {
  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });
  const products = listAdminProducts();
  const nextSortOrder = getNextHomeSectionSortOrder();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Página inicial"
        title="Nova vitrine"
        description="Defina título, apresentação, modo de seleção e produtos. Você pode deixar a vitrine inativa enquanto monta."
        actions={
          <Link href="/admin/vitrines" className="btn btn-outline btn-sm">
            <ArrowLeft size={13} />
            Voltar
          </Link>
        }
      />

      {products.length === 0 ? (
        <AdminNotice tone="info" title="Ainda não há produtos">
          Você pode criar a vitrine agora e adicionar produtos depois. Para
          seleção manual, cadastre produtos em{" "}
          <Link href="/admin/produtos/novo" className="text-lime underline">
            Novo produto
          </Link>
          .
        </AdminNotice>
      ) : null}

      <SectionForm
        categories={categories}
        products={products}
        nextSortOrder={nextSortOrder}
      />
    </div>
  );
}
