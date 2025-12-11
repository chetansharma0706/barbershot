"use server";
import { createClient } from "@/utils/supabase/server";
import type { BusinessHoursPayload } from '@/types';


export async function createShop(data: {
    shop_name: string;
    shop_description: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    business_hours?: BusinessHoursPayload | Record<string, unknown> | null;
    cover_image_url?: string | null;
    logo_url?: string | null;
    cover_img?: string | null;
    logo_img?: string | null;

}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Unauthorized" };
        }
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return { error: "Profile not found" };
        }

        const { data: shop, error } = await supabase
            .from("barber_shops")   
            .insert({
                user_id: user.id,
                shop_name: data.shop_name,
                shop_description: data.shop_description || null,
                address: data.address,
                city: data.city,
                state: data.state,
                zip_code: data.zip_code,
                phone: profile.phone || null,
                business_hours: data.business_hours || null,
                cover_image_url: data.cover_img || null,
                logo_url: data.logo_img || null,
                
                

            })
            .select()
            .single();

        if (error || !shop) {
            throw error || new Error("Shop creation failed");
        }

        return { success: true, message:"Shop Created Successfully",shop };
    } catch (error) {
        console.error("Error creating shop:", error);
        return { error: "Failed to create shop" };
    }
}


