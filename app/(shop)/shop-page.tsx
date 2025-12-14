import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ShopView from "./shopPage"; // UI component

const ROOT_DOMAIN = "barberbro.shop";

export default async function ShopRouter() {
  const host = (await headers()).get("host") || "";

  const subdomain = host.endsWith(ROOT_DOMAIN)
    ? host.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  const isShopSubdomain =
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "barberbro";

  // ❌ If someone somehow lands here without shop subdomain
  if (!isShopSubdomain) {
    notFound();
  }

  const supabase = await createClient();

  const { data: shop, error } = await supabase
    .from("barber_shops")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("is_active", true)
    .single();

  if (error || !shop) {
    notFound();
  }

  return <ShopView shop={shop} />;
}
