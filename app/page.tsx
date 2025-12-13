import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import ShopPage from "./shopPage";

const page = async () => {

  const host = (await headers()).get("host") || "";
  const ROOT_DOMAIN = "barberbro.shop";

  let subdomain: string | null = null;

  if (host.endsWith(ROOT_DOMAIN)) {
    subdomain = host.replace(`.${ROOT_DOMAIN}`, "");
  }

  const isShop =
    subdomain && subdomain !== "www" && subdomain !== "barberbro";

  if (isShop) {
    return <ShopPage subdomain={subdomain} />
  }
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

export default page;
