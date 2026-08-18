import { NextRequest, NextResponse } from "next/server";

/* Route-based locales without an /en prefix in public URLs:
   /            → rewritten internally to /en
   /es/...      → served by app/[lang] with lang=es
   /en/...      → redirected to the unprefixed URL (avoids duplicate content)
   /admin, /api and static files pass through untouched. */

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/uploads") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    // Admin is a single-locale surface.
    if (pathname.startsWith("/es/admin")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace(/^\/es/, "");
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
