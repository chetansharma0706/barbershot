import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BarberShopSetup from "./BarberShopSetup";

export default async function ShopSetupPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_role !== "barber") {
    redirect("/dashboard");
  }

  return <BarberShopSetup userid={user.id} />;
}
