"use server";

import { createClient } from "@/utils/supabase/server";


export async function checkSubdomainAvailability(
  subdomain: string
): Promise<{ available: boolean }> {
  if (!subdomain) {
    return { available: false };
  }

  const supabase = await createClient();

  const cleaned = subdomain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

  const { data, error } = await supabase
    .from("barber_shops")
    .select("id")
    .eq("subdomain", cleaned)
    .maybeSingle();

  if (error) {
    console.error("Subdomain check error:", error);
    return { available: false };
  }

  return {
    available: !data
  };
}
