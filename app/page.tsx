import { headers } from "next/headers";
import AppPage from "./(app)/app-page";
import ShopRouter from "./(shop)/shop-page";

const ROOT_DOMAIN = "barberbro.shop";

export default async function Page() {
  const host = (await headers()).get("host") || "";

  const subdomain = host.endsWith(ROOT_DOMAIN)
    ? host.replace(`.${ROOT_DOMAIN}`, "")
    : null;

  const isShop =
    subdomain &&
    subdomain !== "www" &&
    subdomain !== "barberbro";

  if (isShop) {
    return <ShopRouter />;
  }

  return <AppPage />;
}
