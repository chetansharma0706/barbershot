// app/shop/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchBookingModalData(shopId: string) {
  const supabase = await createClient();

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 4);

  const [bookedSlots, stations, shop] = await Promise.all([
    supabase.rpc("get_booked_slots", {
      target_shop_id: shopId,
      query_start_time: startDate.toISOString(),
      query_end_time: endDate.toISOString(),
    }),
    supabase
      .from("stations")
      .select("id, name, station_image_url, is_active")
      .eq("shop_id", shopId)
      .eq("is_active", true),
    supabase.from("barber_shops").select("id , business_hours").eq("id", shopId).single(),
  ]);

  if (bookedSlots.error) throw bookedSlots.error;
  if (stations.error) throw stations.error;
  if (shop.error) throw shop.error;

  return {
    bookedSlots: bookedSlots.data ?? [],
    stations: stations.data ?? [],
    businessHours: shop.data?.business_hours || null,
  };
}
