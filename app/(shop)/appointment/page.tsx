import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

const ROOT_DOMAIN = "barberbro.shop";

export default async function AppointmentPage() {
  const host = (await headers()).get("host") || "";

  const subdomain = host.endsWith(ROOT_DOMAIN)
    ? host.replace(`.${ROOT_DOMAIN}`, "")
    : null;

   const isShopSubdomain =
      subdomain &&
      subdomain !== "www" &&
      subdomain !== "barberbro";
  
    // ❌ If someone somehow lands here without shop subdomain
    if (!isShopSubdomain) {
      notFound();
    }
  
    const supabase = await createClient();
  
    const { data: shop, error } = await supabase
      .from("barber_shops")
      .select("*")
      .eq("subdomain", subdomain)
      .eq("is_active", true)
      .single();
  
    if (error || !shop) {
      notFound();
    }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">
          Book Appointment
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          Booking for shop: <span className="font-medium">{shop.name}</span>
        </p>

        <form className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm mb-1">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 9XXXXXXXXX"
              className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm mb-1">Select Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm mb-1">Select Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 bg-yellow-500 text-black py-2 rounded-md font-medium hover:bg-yellow-400 transition"
          >
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
}
