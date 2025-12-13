import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import ShopPage from "./shopPage";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";

const ROOT_DOMAIN = "barberbro.shop";

const Page = async () => {
  const host = (await headers()).get("host") || "";

  let subdomain: string | null = null;

  if (host.endsWith(ROOT_DOMAIN)) {
    subdomain = host.replace(`.${ROOT_DOMAIN}`, "");
  }

  const isShopSubdomain =
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "barberbro";

  // 🔹 CASE 1: SHOP SUBDOMAIN
  if (isShopSubdomain) {
    const supabase = createClient();

    const { data: shop, error } = await supabase
      .from("barber_shops")
      .select("*")
      .eq("subdomain", subdomain)
      .eq("is_active", true) // or is_published = true
      .single();

    // Shop does NOT exist → 404
    if (error || !shop) {
      notFound();
    }

    // Shop exists → render shop
    return <ShopPage subdomain={shop.subdomain} />;
  }

  // 🔹 CASE 2: MAIN DOMAIN
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Page;

