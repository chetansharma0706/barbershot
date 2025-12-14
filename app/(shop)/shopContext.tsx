"use client";

import { createContext, useContext } from "react";

import { Tables } from "@/database.types";

type Shop = Tables<'barber_shops'>

const ShopContext = createContext<Shop | null>(null);

export function ShopProvider({
  shop,
  children,
}: {
  shop: Shop;
  children: React.ReactNode;
}) {
  return (
    <ShopContext.Provider value={shop}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
