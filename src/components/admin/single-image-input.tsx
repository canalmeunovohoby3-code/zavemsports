"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { isHttpImageUrl, uploadImageFile } from "@/lib/client-upload";
import { cn } from "@/lib/cn";

type SingleImageInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  fit?: "cover" | "contain";
};

export function SingleImageInput({
  value,
  onChange,
  label = "Imagem",
  hint,
  fit = "cover",
}: SingleImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await uploadImageFile(file);
      onChange(result.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Falha ao enviar a imagem.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="field-label">{label}</p>
      {value ? (
        <div className="relative overflow-hidden border border-line bg-coal">
          <div className="relative aspect-[16/7]">
            <Image
              src={value}
              alt=""
              fill
              sizes="500px"
              unoptimized
              className={cn(
                "bg-raised",
                fit === "contain" ? "object-contain p-4" : "object-cover",
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-white/20 bg-black/70 text-white transition hover:text-danger"
            aria-label="Remover imagem"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex aspect-[16/7] flex-col items-center justify-center border border-dashed border-line bg-coal text-center">
          <ImagePlus size={22} className="text-line" />
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted">
            Sem imagem
          </p>
        </div>
      )}

      {hint ? <p className="mt-2 text-[10px] text-muted">{hint}</p> : null}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn btn-outline btn-sm"
        >
          {uploading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          {uploading ? "Enviando…" : "Enviar imagem"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => handleFile(event.target.files)}
        />
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          className="input h-9 min-h-9 text-[11px]"
          placeholder="Ou cole uma URL https"
        />
        <button
          type="button"
          onClick={() => {
            if (!isHttpImageUrl(urlInput)) {
              setError("Informe uma URL https válida.");
              return;
            }
            onChange(urlInput);
            setUrlInput("");
            setError("");
          }}
          className="btn btn-outline btn-sm h-9 shrink-0"
        >
          Usar URL
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
