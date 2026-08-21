import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/config";

/* Magic-link landing: exchanges the auth code for a session cookie,
   then forwards to the requested (whitelisted) destination. */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/admin/workshops";
  const next = nextParam.startsWith("/admin") ? nextParam : "/admin/workshops";
  const dest = new URL(next, url.origin);

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(dest);
  }

  const response = NextResponse.redirect(dest);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (all) =>
          all.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );
  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
