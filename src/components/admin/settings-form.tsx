"use client";

import { useActionState, useState } from "react";
import {
  Asterisk,
  CheckCircle2,
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";
import { updateSettingsAction } from "@/app/admin/(painel)/configuracoes/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";
import type { StoreSettings } from "@/lib/settings";
import { SingleImageInput } from "@/components/admin/single-image-input";
import { isValidWhatsAppNumber } from "@/lib/format";

type SettingsFormProps = {
  settings: StoreSettings;
  paymentLabel: string;
  paymentConfigured: boolean;
  shippingNote: string;
};

const initialState: ActionState = { status: "idle" };

export function SettingsForm({
  settings,
  paymentLabel,
  paymentConfigured,
  shippingNote,
}: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initialState,
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [bannerImage, setBannerImage] = useState(settings.bannerImage);
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings.whatsappNumber,
  );
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [bannerTitle, setBannerTitle] = useState(settings.bannerTitle);
  const [bannerAccent, setBannerAccent] = useState(settings.bannerAccent);
  const [announcement, setAnnouncement] = useState(settings.announcement);

  const whatsappValid = isValidWhatsAppNumber(whatsappNumber);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
    >
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="bannerImage" value={bannerImage} />
      <input type="hidden" name="instagramUrl" value={instagramUrl} />

      {state.status === "error" ? (
        <div className="mb-6 border border-danger/35 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" ? (
        <div className="mb-6 border border-success/35 bg-success/5 px-4 py-3 text-xs leading-relaxed text-success">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Identidade e logo
              </h2>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <SingleImageInput
                value={logoUrl}
                onChange={setLogoUrl}
                label="Logo oficial"
                hint="Enquanto não houver logo, a loja exibe o nome ZEVEN SPORTS em tipografia. Formatos: JPG, PNG, WEBP ou AVIF."
                fit="contain"
              />
              <div className="space-y-5">
                <div>
                  <label htmlFor="announcement" className="field-label">
                    Barra de anúncio
                  </label>
                  <input
                    id="announcement"
                    name="announcement"
                    value={announcement}
                    onChange={(event) => setAnnouncement(event.target.value)}
                    className="input"
                    placeholder="Mensagem curta no topo da loja"
                  />
                  {state.fieldErrors?.announcement?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.announcement[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="contactEmail" className="field-label">
                    E-mail de contato (opcional)
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={settings.contactEmail}
                    className="input"
                    placeholder="contato@zevensports.com"
                  />
                  {state.fieldErrors?.contactEmail?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.contactEmail[0]}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Banner da página inicial
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <SingleImageInput
                value={bannerImage}
                onChange={setBannerImage}
                label="Imagem do banner (opcional)"
                hint="Sem imagem, a home usa uma foto editorial temporária. Ao enviar, a imagem oficial substitui a foto no painel direito do banner."
              />
              <div>
                <label htmlFor="bannerImageAlt" className="field-label">
                  Texto alternativo da imagem
                </label>
                <input
                  id="bannerImageAlt"
                  name="bannerImageAlt"
                  defaultValue={settings.bannerImageAlt}
                  className="input"
                  placeholder="Descrição da imagem para acessibilidade"
                />
                {state.fieldErrors?.bannerImageAlt?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.bannerImageAlt[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="bannerEyebrow" className="field-label">
                    Linha de apoio
                  </label>
                  <input
                    id="bannerEyebrow"
                    name="bannerEyebrow"
                    defaultValue={settings.bannerEyebrow}
                    className="input"
                  />
                  {state.fieldErrors?.bannerEyebrow?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerEyebrow[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="bannerTitle" className="field-label">
                    Título
                  </label>
                  <input
                    id="bannerTitle"
                    name="bannerTitle"
                    value={bannerTitle}
                    onChange={(event) => setBannerTitle(event.target.value)}
                    className="input"
                  />
                  {state.fieldErrors?.bannerTitle?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerTitle[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="bannerAccent" className="field-label">
                    Destaque em verde-limão
                  </label>
                  <input
                    id="bannerAccent"
                    name="bannerAccent"
                    value={bannerAccent}
                    onChange={(event) => setBannerAccent(event.target.value)}
                    className="input"
                  />
                  {state.fieldErrors?.bannerAccent?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerAccent[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="bannerText" className="field-label">
                    Texto
                  </label>
                  <input
                    id="bannerText"
                    name="bannerText"
                    defaultValue={settings.bannerText}
                    className="input"
                  />
                  {state.fieldErrors?.bannerText?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerText[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="bannerCtaLabel" className="field-label">
                    Texto do botão
                  </label>
                  <input
                    id="bannerCtaLabel"
                    name="bannerCtaLabel"
                    defaultValue={settings.bannerCtaLabel}
                    className="input"
                  />
                  {state.fieldErrors?.bannerCtaLabel?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerCtaLabel[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="bannerCtaHref" className="field-label">
                    Destino do botão
                  </label>
                  <input
                    id="bannerCtaHref"
                    name="bannerCtaHref"
                    defaultValue={settings.bannerCtaHref}
                    className="input"
                    placeholder="/catalogo"
                  />
                  {state.fieldErrors?.bannerCtaHref?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.bannerCtaHref[0]}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-muted">
                Use caminhos internos como <code>/catalogo</code> ou uma URL
                completa iniciada em https://.
              </p>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                WhatsApp e Instagram
              </h2>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <label htmlFor="whatsappDisplay" className="field-label">
                  Número exibido
                </label>
                <input
                  id="whatsappDisplay"
                  name="whatsappDisplay"
                  defaultValue={settings.whatsappDisplay}
                  className="input"
                  placeholder="(00) 00000-0000"
                />
                {state.fieldErrors?.whatsappDisplay?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.whatsappDisplay[0]}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="whatsappNumber" className="field-label">
                  Número somente dígitos
                </label>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  inputMode="tel"
                  value={whatsappNumber}
                  onChange={(event) =>
                    setWhatsappNumber(
                      event.target.value.replace(/\D+/g, "").slice(0, 13),
                    )
                  }
                  className="input"
                  placeholder="DDD + número"
                />
                {state.fieldErrors?.whatsappNumber?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.whatsappNumber[0]}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <div
                  className={
                    whatsappValid
                      ? "flex items-start gap-2 border border-success/25 bg-success/[0.04] px-4 py-3 text-[11px] leading-relaxed text-success"
                      : "flex items-start gap-2 border border-warning/25 bg-warning/[0.04] px-4 py-3 text-[11px] leading-relaxed text-warning"
                  }
                >
                  {whatsappValid ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  ) : (
                    <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                  )}
                  {whatsappValid
                    ? "Número válido. O link de WhatsApp será exibido na loja."
                    : "Como o número ainda não é um celular válido com DDD, o link permanece oculto. O número pode ser exibido como contato, marcado como pendente."}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="instagramUrl" className="field-label">
                  URL do Instagram (opcional)
                </label>
                <input
                  id="instagramUrl"
                  type="url"
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  className="input"
                  placeholder="https://instagram.com/…"
                />
                {state.fieldErrors?.instagramUrl?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.instagramUrl[0]}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="border border-line bg-surface p-5">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-lime btn-block"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Salvar configurações
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[10px] text-muted">
              As alterações aparecem imediatamente na loja.
            </p>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Prévia do banner
              </p>
            </div>
            <div className="bg-ink p-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted">
                {announcement || "Anúncio da loja"}
              </p>
              <h3 className="mt-8 font-display text-3xl font-bold uppercase leading-[0.85] tracking-[-0.055em]">
                {bannerTitle || "Título"}
                <br />
                <span className="text-lime">{bannerAccent || "destaque."}</span>
              </h3>
              <span className="mt-5 inline-flex bg-lime px-3 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-black">
                {settings.bannerCtaLabel}
              </span>
            </div>
          </section>

          <section className="border border-line bg-surface p-4">
            <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
              <Asterisk size={12} className="text-lime" />
              Integrações
            </p>
            <div className="mt-3 space-y-2 text-[10px] leading-relaxed text-muted">
              <p>
                Pagamento:{" "}
                <span className="text-soft">{paymentLabel}</span>{" "}
                {paymentConfigured ? (
                  <span className="text-success">(credenciais presentes)</span>
                ) : (
                  <span className="text-warning">(não processa cobranças)</span>
                )}
              </p>
              <p>Frete: {shippingNote}</p>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}



