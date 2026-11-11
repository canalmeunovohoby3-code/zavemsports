import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function getUploadDir() {
  const dir = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.UPLOAD_DIR ?? path.join("data", "uploads"),
  );
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveUploadedImage(file: File) {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("A imagem deve ter no máximo 8 MB.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Formato não aceito. Use JPG, PNG, WEBP ou AVIF.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input, { failOn: "error" });
  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Arquivo de imagem inválido.");
  }

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.webp`;
  const outputPath = path.join(getUploadDir(), filename);

  await pipeline
    .rotate()
    .resize({
      width: 2000,
      height: 2600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84 })
    .toFile(outputPath);

  return {
    url: `/api/media/${filename}`,
    width: metadata.width,
    height: metadata.height,
  };
}

export function getUploadedFilePath(filename: string) {
  if (!/^[a-zA-Z0-9-]+\.webp$/.test(filename)) return null;
  const filePath = path.join(
    /* turbopackIgnore: true */ getUploadDir(),
    filename,
  );
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

export function isValidImageReference(value: string) {
  if (!value) return true;
  if (value.startsWith("/api/media/")) return true;
  if (value.startsWith("/")) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
