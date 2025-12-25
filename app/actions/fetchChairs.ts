// lib/server/getChairs.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function getChairs() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: shop, error: shopError } = await supabase
    .from("barber_shops")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (shopError || !shop) {
    throw new Error("Shop not found");
  }

  const { data, error } = await supabase
    .from("stations")
    .select("id, name, is_active, station_image_url")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => ({
    id: item.id,
    barberName: item.name,
    isAvailable: item.is_active,
    image: item.station_image_url,
  }));
}
