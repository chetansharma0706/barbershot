"use client";

import { createContext, useContext } from "react";

import { Tables } from "@/database.types";

type Shop = Tables<'barber_shops'>

type ShopContextType = {
  shop: Shop;
  user: any;
};

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({
  shop,
  user,
  children,
}: {
  shop: Shop;
  user: any;
  children: React.ReactNode;
}) {
  return (
    <ShopContext.Provider value={{ shop , user}}>
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
