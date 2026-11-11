import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Nova categoria" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Categorias"
        title="Nova categoria"
        description="Defina o público e o tipo de peça para que a categoria apareça corretamente no menu e nos filtros."
        actions={
          <Link href="/admin/categorias" className="btn btn-outline btn-sm">
            <ArrowLeft size={13} />
            Voltar
          </Link>
        }
      />
      <CategoryForm />
    </div>
  );
}
