// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

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

  // 🔥 "/" MUST be public
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback"];
  const isPublic = publicRoutes.includes(pathname);

  // NOT LOGGED IN → redirect only if private route
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // LOGGED IN → now fetch profile
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_step, onboarding_completed, user_role")
      .eq("id", user.id)
      .single();

    const step = profile?.onboarding_step || "role_selection";
    const dashboard = profile?.user_role === "barber" ? "/dashboard" : "/search";

    // Logged in + visiting public route
    if (isPublic) {
      // Onboarding not done → go to onboarding
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL(`/onboarding/${step}`, request.url));
      }
      // Onboarding done → go to dashboard/search
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Private routes:
    // If onboarding incomplete and route is NOT onboarding
    if (!profile?.onboarding_completed && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(`/onboarding/${step}`, request.url));
    }

    // If onboarding completed but trying to access onboarding
    if (profile?.onboarding_completed && pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
