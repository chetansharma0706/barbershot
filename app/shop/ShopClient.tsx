"use client";

import ShopView from "@/components/shop/shopPage";
import { useShop } from "./shopContext";

export default function ShopClient() {
  const shop = useShop();
  return <ShopView shop={shop} />;
}
