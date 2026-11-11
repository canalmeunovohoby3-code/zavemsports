"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/cn";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  categoryName: string;
};

export function ProductGallery({
  images,
  productName,
  categoryName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto md:w-[82px] md:flex-col md:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagem ${index + 1} de ${productName}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative aspect-[4/5] w-[68px] shrink-0 overflow-hidden border bg-[#f4f4f1] transition md:w-full",
                index === activeIndex
                  ? "border-ink"
                  : "border-line hover:border-[#999]",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="82px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="product-media relative aspect-[4/5] flex-1 overflow-hidden">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
              ZEVEN SPORTS
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {categoryName}
              </p>
              <p className="mt-2 max-w-[460px] font-display text-[clamp(1.8rem,3.5vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink/60">
                {productName}
              </p>
              <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-muted">
                Imagem em breve
              </p>
            </div>
          </div>
        )}
        {active && images.length > 1 ? (
          <span className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-[8px] font-medium tracking-[0.08em] text-[#555]">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
