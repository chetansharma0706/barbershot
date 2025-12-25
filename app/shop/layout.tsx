import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ShopProvider } from "./shopContext";

const ROOT_DOMAIN = "barberbro.shop";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host") || "";

  const subdomain = host.endsWith(ROOT_DOMAIN)
    ? host.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  const isShopSubdomain =
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "barberbro";

  if (!isShopSubdomain) {
    notFound();
  }

  const supabase = await createClient();

  // 1. get current user if exists
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let anonUser = user;
  console.log("Current user:", anonUser);

  // 2. if no user, sign in anonymously
  if (!anonUser) {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("Anonymous sign-in failed", error);
    } else {
      anonUser = data.user;
    }
  }

  // 3. Fetch shop record
  const { data: shop, error: shopError } = await supabase
    .from("barber_shops")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("is_active", true)
    .single();

  if (shopError || !shop) {
    notFound();
  }

  // 4. Optional: ensure entry in customers table exists
  if (anonUser) {
    await supabase
      .from("customers")
      .insert({
        auth_user_id: anonUser.id,
        shop_id: shop.id,
      })
  }

  return (
    <ShopProvider shop={shop} user={anonUser}>
      {children}
    </ShopProvider>
  );
}
