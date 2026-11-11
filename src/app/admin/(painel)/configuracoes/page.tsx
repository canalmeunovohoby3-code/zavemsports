import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings, isWhatsAppPending } from "@/lib/settings";
import { getPaymentProviderStatus } from "@/lib/payments";
import { SHIPPING_NOTICE } from "@/lib/shipping";

export const metadata = { title: "Configurações" };

export default function AdminSettingsPage() {
  const settings = getSettings();
  const payment = getPaymentProviderStatus();
  const whatsappPending = isWhatsAppPending(settings);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Loja"
        title="Configurações"
        description="Identidade, banner, contato e redes sociais. O telefone e o Instagram ficam centralizados aqui e alimentam toda a loja."
        actions={
          <Link href="/admin/conta" className="btn btn-outline btn-sm">
            <KeyRound size={13} />
            Conta e segurança
          </Link>
        }
      />

      {whatsappPending ? (
        <AdminNotice tone="warning" title="WhatsApp pendente de confirmação">
          O número informado não é um celular válido com DDD. Nenhum link de
          WhatsApp é gerado enquanto o número não for confirmado. Atualize o
          campo somente com o número oficial.
        </AdminNotice>
      ) : null}

      <AdminNotice tone="info" title="Pagamento e frete">
        O gateway está como <strong className="text-soft">{payment.label}</strong>
        {payment.configured
          ? " e possui credenciais configuradas no ambiente. A integração de cobrança ainda precisa ser concluída no código."
          : " e não processa cobranças. Os pedidos são registrados como aguardando pagamento e confirmados manualmente pela loja."}{" "}
        {SHIPPING_NOTICE}
      </AdminNotice>

      <SettingsForm
        settings={settings}
        paymentLabel={payment.label}
        paymentConfigured={payment.configured}
        shippingNote="cálculo manual/sob confirmação"
      />
    </div>
  );
}
