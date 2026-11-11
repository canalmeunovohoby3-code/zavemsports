import fs from "node:fs";
import { NextResponse } from "next/server";
import { getUploadedFilePath } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const filePath = getUploadedFilePath(filename);

  if (!filePath) {
    return new NextResponse("Imagem não encontrada.", { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(file.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
