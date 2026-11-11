export type UploadResult = { url: string; width: number; height: number };

export async function uploadImageFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  const data = (await response
    .json()
    .catch(() => ({}))) as UploadResult & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Falha ao enviar a imagem.");
  }
  return data;
}

export function isHttpImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
