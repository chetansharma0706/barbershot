"use server";

import { createClient } from "@/utils/supabase/server";

type BookAppointmentInput = {
  shopId: string;
  stationId: string;
  customerName: string;
  customerPhone: string;
  startTimeISO: string;
  endTimeISO: string;
};

export async function bookAppointment(input: BookAppointmentInput) {
  const {
    shopId,
    stationId,
    customerName,
    customerPhone,
    startTimeISO,
    endTimeISO,
  } = input;

  // Basic validation. Never trust client.
  if (
    !shopId ||
    !stationId ||
    !customerName ||
    !customerPhone ||
    !startTimeISO ||
    !endTimeISO
  ) {
    throw new Error("Missing required booking data");
  }

  const supabase = await createClient();

  // Optional. Prevent double booking at DB level.
  // If you already handle this in RPC, even better.
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("station_id", stationId)
    .eq("start_time", startTimeISO)
    .eq("status", "booked")
    .maybeSingle();

  if (conflict) {
    throw new Error("This slot is already booked");
  }

  const { error } = await supabase.from("appointments").insert({
    barber_shop_id: shopId,
    station_id: stationId,
    customer_name: customerName.trim(),
    customer_phone: customerPhone.trim(),
    start_time: startTimeISO,
    end_time: endTimeISO,
    status: "booked",
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
