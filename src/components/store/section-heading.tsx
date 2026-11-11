import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todos",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 border-b border-ink pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink"
        >
          {linkLabel}
          <ArrowRight
            size={13}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      ) : null}
    </div>
  );
}

