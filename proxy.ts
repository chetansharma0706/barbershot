// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp)$/)
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // public routes
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback"];
  const isPublic = publicRoutes.includes(pathname);

  // not logged in
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // logged in
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_step, onboarding_completed, user_role")
      .eq("id", user.id)
      .single();

    const step = profile?.onboarding_step || "role_selection";
    const dashboard =
      profile?.user_role === "barber" ? "/dashboard" : "/search";

    // logged in + hits public
    if (isPublic) {
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(
          new URL(`/onboarding/${step}`, request.url)
        );
      }

      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // private + incomplete onboarding
    if (
      !profile?.onboarding_completed &&
      !pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(
        new URL(`/onboarding/${step}`, request.url)
      );
    }

    // onboarding completed but trying to access onboarding
    if (
      profile?.onboarding_completed &&
      pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|icons|favicon.ico|site.webmanifest|manifest.webmanifest|apple-touch-icon|sw.js|service-worker.js).*)"
  ]
};

