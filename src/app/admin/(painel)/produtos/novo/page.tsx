import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/queries";

export const metadata = { title: "Novo produto" };

export default function NewProductPage() {
  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Novo produto"
        description="Preencha os dados, adicione imagens e defina a grade de tamanhos com estoque individual."
        actions={
          <Link href="/admin/produtos" className="btn btn-outline btn-sm">
            <ArrowLeft size={13} />
            Voltar
          </Link>
        }
      />

      {categories.length === 0 ? (
        <AdminNotice tone="warning" title="Nenhuma categoria cadastrada">
          Crie uma categoria antes de cadastrar produtos.
        </AdminNotice>
      ) : null}

      <ProductForm categories={categories} />
    </div>
  );
}
