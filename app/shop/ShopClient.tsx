"use client";

import { useEffect, useState } from "react";
import ShopView from "@/components/shop/shopPage";
import { useShop } from "./shopContext";
import { createClient } from "@/utils/supabase/client";

export default function ShopClient() {
  const shop  = useShop();
  const supabase = createClient();
  const [anonUser, setAnonUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchAnonUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Fetched user:", user);
      if(!user){
        const { data: { user:anonUser } } = await supabase.auth.signInAnonymously();
        console.log("Created anonymous user:", anonUser);
        if(anonUser){
          setAnonUser(anonUser);
          await supabase.from("customers").insert({
            auth_user_id: anonUser.id,
            shop_id: shop.id,
          });
      
      }else{
        setAnonUser(user);
      }
    };
    fetchAnonUser();
  }, [supabase]);


  return <ShopView shop={shop} user={anonUser} />;
}
