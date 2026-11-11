type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-lime">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-[clamp(1.8rem,3.4vw,2.7rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[650px] text-xs leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
