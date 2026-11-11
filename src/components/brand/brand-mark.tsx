import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  logoUrl?: string;
  className?: string;
  compact?: boolean;
  onDark?: boolean;
};

export function BrandMark({
  logoUrl,
  className,
  compact = false,
  onDark = false,
}: BrandMarkProps) {
  if (logoUrl) {
    return (
      <span
        className={cn(
          "inline-flex items-center",
          onDark && "bg-white px-2.5 py-1.5",
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt="ZEVEN SPORTS"
          width={790}
          height={286}
          unoptimized
          className={cn(
            "w-auto object-contain",
            compact ? "h-8" : "h-11 sm:h-12",
          )}
          priority
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 leading-none",
        className,
      )}
      aria-label="ZEVEN SPORTS"
    >
      <span
        className={cn(
          "font-display font-extrabold uppercase leading-none tracking-[-0.055em]",
          compact ? "text-2xl" : "text-[26px]",
        )}
      >
        ZEVEN
      </span>
      <span
        className={cn(
          "font-sans font-semibold uppercase leading-none tracking-[0.26em] text-lime",
          compact ? "text-[8px]" : "text-[9px]",
        )}
      >
        Sports
      </span>
    </span>
  );
}
