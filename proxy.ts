// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static assets
  if (pathname.startsWith("/_next") || pathname.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  // Server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  console.log("👉 USER FROM PROXY:", user);

  const publicRoutes = ["/auth/login", "/auth/signup", "/auth/callback"];

  const isPublic = publicRoutes.some(r => pathname.startsWith(r));

  // Not logged in
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Logged in but visiting login/signup
  if (user && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
