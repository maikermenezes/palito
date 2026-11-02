import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

const PUBLIC_VENDOR_PAGES = ["/vendedor/login", "/vendedor/esqueci"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_VENDOR_PAGES.includes(pathname);

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/vendedor/login", request.url));
  }
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/vendedor/estoque", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/vendedor/:path*",
};
