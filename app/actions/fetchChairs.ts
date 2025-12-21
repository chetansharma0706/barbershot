// lib/server/getChairs.ts
"use server"

import { createClient } from '@/utils/supabase/server'

export async function getChairs() {
    
    // Define how long this data stays fresh (matches your 30s logic)
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error("Failed to authenticate user");
    }

    // Assign a tag for manual revalidation (e.g., when adding a chair)
    const { data: shop } = await supabase
        .from("barber_shops")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!shop) {
        throw new Error("Failed to find shop for user");
    }

    const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: true })

    if (error) {
        throw new Error('Failed to load chairs')
    }

    return data.map(item => ({
        id: item.id,
        barberName: item.name,
        isAvailable: item.is_active,
        image: item.station_image_url,
    }));
}
