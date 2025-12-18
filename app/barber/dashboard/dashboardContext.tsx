"use client";

import { Tables } from "@/database.types";
import { createContext, useContext } from "react";


type profileType = Tables<'profiles'>;
type shopType = Tables<'barber_shops'>;

type DashboardContextType = {
  profile: profileType;
  shop: shopType;
};

interface DashboardContextProviderProps {
  profile: profileType;
  shop: shopType;
  children: React.ReactNode;
}
const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardContextProvider({ profile, shop, children }:DashboardContextProviderProps) {
  return (
    <DashboardContext.Provider value={{ profile, shop }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside provider");
  return ctx;
};
