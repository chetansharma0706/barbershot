// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROOT_DOMAIN = "barberbro.shop";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1️⃣ Ignore static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Detect subdomain
  const subdomain = host.endsWith(ROOT_DOMAIN)
    ? host.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  const isShopSubdomain =
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "barberbro";

  const isMainDomain = !isShopSubdomain;

  // 3️⃣ BLOCK direct access to /shop on main domain
  if (isMainDomain && pathname.startsWith("/shop")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4️⃣ SHOP SUBDOMAIN → rewrite to /shop
  if (isShopSubdomain) {
    return NextResponse.rewrite(
      new URL(`/shop${pathname}`, request.url)
    );
  }

  // 5️⃣ MAIN DOMAIN → auth logic
  let response = NextResponse.next({
    request: { headers: request.headers }
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

  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback"];
  const isPublic = publicRoutes.includes(pathname);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_step, onboarding_completed, user_role")
      .eq("id", user.id)
      .single();

    const step = profile?.onboarding_step || "role_selection";
    const dashboard =
      profile?.user_role === "barber" ? "/barber/dashboard" : "/search";

    if (isPublic) {
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(
          new URL(`/onboarding/${step}`, request.url)
        );
      }
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    if (
      !profile?.onboarding_completed &&
      !pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(
        new URL(`/onboarding/${step}`, request.url)
      );
    }

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
    "/((?!_next|favicon.ico|icons|site.webmanifest|manifest.webmanifest|apple-touch-icon|sw.js|service-worker.js).*)"
  ]
};
