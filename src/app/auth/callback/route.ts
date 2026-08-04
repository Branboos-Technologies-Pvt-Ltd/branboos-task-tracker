import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Prefer the canonical site URL over whatever host the request happened to hit,
// so cookies set on tasks.branboos.com stay valid across the redirect chain.
// Netlify occasionally proxies requests to internal aliases (e.g. main--*.netlify.app),
// which would break cookie-scoped auth if we followed the request URL blindly.
function canonicalOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return configured || request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const origin = canonicalOrigin(request);
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const error = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
