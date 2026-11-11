"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Link2,
  Trash2,
  Upload,
} from "lucide-react";
import { isHttpImageUrl, uploadImageFile } from "@/lib/client-upload";

export type AdminImage = { url: string; alt: string };

type ImageListInputProps = {
  value: AdminImage[];
  onChange: (images: AdminImage[]) => void;
  max?: number;
  productName?: string;
};

export function ImageListInput({
  value,
  onChange,
  max = 10,
  productName = "",
}: ImageListInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    const next = [...value];
    try {
      for (const file of Array.from(files).slice(0, max - value.length)) {
        const result = await uploadImageFile(file);
        next.push({ url: result.url, alt: productName });
      }
      onChange(next);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addUrl = () => {
    if (!isHttpImageUrl(urlInput)) {
      setError("Informe uma URL https válida.");
      return;
    }
    if (value.length >= max) {
      setError(`Máximo de ${max} imagens.`);
      return;
    }
    onChange([...value, { url: urlInput, alt: productName }]);
    setUrlInput("");
    setError("");
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || value.length >= max}
          className="btn btn-outline btn-sm"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? "Enviando…" : "Enviar imagens"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <span className="self-center text-[10px] text-muted">
          JPG, PNG, WEBP ou AVIF · até 8 MB · máx. {max}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Link2
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            className="input h-10 min-h-10 pl-9 text-xs"
            placeholder="Ou cole uma URL https da imagem"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="btn btn-outline btn-sm h-10"
        >
          <ImagePlus size={14} />
          Adicionar
        </button>
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      {value.length === 0 ? (
        <div className="mt-4 flex min-h-[150px] flex-col items-center justify-center border border-dashed border-line bg-coal p-6 text-center">
          <ImagePlus size={20} className="text-line" />
          <p className="mt-2 text-[11px] text-muted">
            Nenhuma imagem adicionada ainda.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {value.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              className="border border-line bg-coal p-2.5"
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-line bg-raised">
                <Image
                  src={image.url}
                  alt={image.alt || `Imagem ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 90vw, 300px"
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute left-1.5 top-1.5 bg-black/70 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-white/80">
                  {index === 0 ? "Capa" : `0${index + 1}`}
                </span>
              </div>
              <input
                value={image.alt}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...next[index], alt: event.target.value };
                  onChange(next);
                }}
                className="input mt-2 h-8 min-h-8 text-[10px]"
                placeholder="Texto alternativo da imagem"
                aria-label={`Texto alternativo da imagem ${index + 1}`}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                    aria-label="Mover imagem para cima"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                    aria-label="Mover imagem para baixo"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="flex h-7 items-center gap-1 border border-line px-2 text-[8px] font-semibold uppercase tracking-[0.08em] text-muted transition hover:border-danger/40 hover:text-danger"
                >
                  <Trash2 size={11} />
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
