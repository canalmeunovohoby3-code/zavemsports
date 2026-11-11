import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isDemoMode() {
  return (
    process.env.STORE_DEMO_MODE === "true" &&
    process.env.STORE_DEMO_DISABLE !== "true"
  );
}

export function proxy(request: NextRequest) {
  if (!isDemoMode()) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      {
        error:
          "O painel administrativo não está disponível no modo de demonstração.",
      },
      { status: 403 },
    );
  }

  if (request.method !== "GET") {
    return new NextResponse(
      "O painel administrativo não está disponível no modo de demonstração.",
      {
        status: 403,
        headers: { "content-type": "text/plain; charset=utf-8" },
      },
    );
  }

  return NextResponse.rewrite(new URL("/admin-demo", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
