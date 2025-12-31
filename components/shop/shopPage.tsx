"use client";

import { Tables } from "@/database.types";
import { useState, useEffect, useCallback } from "react";
import { Scissors, MapPin, Clock, Star, ChevronRight, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./bookingModal";
// Import our new Custom Modal
import CancelModal from "@/components/CancelModal"; 
import { createClient } from "@/utils/supabase/client";

type Shop = Tables<'barber_shops'>

export default function ShopPage({ shop, user }: { shop: Shop | null, user: any }) {
  const [activeTab, setActiveTab] = useState('services');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Appointment State
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [isLoadingAppt, setIsLoadingAppt] = useState(true);
  
  // New State for Custom Cancel Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkActiveAppointment = useCallback(async () => {
    if (!user || !shop) return;
    try {
      setIsLoadingAppt(true);
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!customerData) {
        setIsLoadingAppt(false);
        return;
      }

      const now = new Date().toISOString();
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`id, start_time, end_time, stations ( name )`)
        .eq('shop_id', shop.id)
        .eq('customer_id', customerData.id)
        .gt('end_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      setActiveAppointment(appointment || null);
    } catch (error) {
      console.error("Error fetching appointment", error);
    } finally {
      setIsLoadingAppt(false);
    }
  }, [user, shop, supabase]);

  useEffect(() => {
    checkActiveAppointment();
  }, [checkActiveAppointment]);

  // Updated to simply return a promise (handled inside CancelModal)
  const handleCancelAppointment = async () => {
    if (!activeAppointment) return;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', activeAppointment.id);

    if (error) throw error;
    
    // Update local state immediately
    setActiveAppointment(null);
  };

  const services = [
    { id: 1, name: "Signature Haircut", duration: "45 min", description: "Precision cut with hot towel finish." },
    { id: 2, name: "Beard Sculpting", duration: "30 min", description: "Razor line-up and beard oil treatment." },
    { id: 3, name: "The Royal Shave", duration: "60 min", description: "Full straight razor shave with facial massage." },
    { id: 4, name: "Kids Cut", duration: "30 min", description: "Gentle styling for the little gentlemen." },
    { id: 5, name: "Hair & Beard Combo", duration: "75 min", description: "Complete package for a fresh look." },
  ];

  const shopName = shop?.shop_name || "Premium Barber";
  const bgImage = shop?.cover_image_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";
  const logoImage = shop?.logo_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Barber";
  const address = shop?.address ? `${shop.address}, ${shop?.city || ''}` : "Location pending";
  const rating = shop?.average_rating || 4.9;
  const reviews = shop?.total_reviews || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 md:pb-0">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
          <div className={`font-bold text-xl tracking-tight flex items-center gap-2 ${isScrolled ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <span className="text-gold"><Scissors size={20} /></span>
            {shopName}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[45vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={bgImage} alt="Shop Interior" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        <div className="absolute bottom-0 left-0 w-full px-4 py-6 md:px-8 md:py-10 lg:px-12 z-10 fade-in-up">
          <div className="container mx-auto flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-[var(--shadow-gold)] bg-card">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gold text-black text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star size={10} fill="currentColor" /> {rating}
              </div>
            </div>

            <div className="flex-1 space-y-2 md:space-y-3">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-shimmer leading-tight">
                {shopName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" /> <span>{shop?.city || "City"}, {shop?.state || "State"}</span></span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> <span>Open Now</span></span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> <span>Accepting Bookings</span></span>
              </div>
            </div>

            {/* DESKTOP ACTION AREA */}
            <div className="hidden md:block flex-shrink-0 w-[300px]">
              {isLoadingAppt ? (
                <div className="h-10 bg-muted animate-pulse rounded-md w-full" />
              ) : activeAppointment ? (
                <div className="bg-card/90 backdrop-blur-md border border-gold/30 p-4 rounded-xl shadow-lg animate-in slide-in-from-right-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gold text-sm flex items-center gap-2"><Calendar size={14} /> Upcoming Visit</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activeAppointment.start_time)}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-gold text-gold bg-gold/10">Confirmed</Badge>
                  </div>
                  
                  <div className="text-sm font-medium mb-3">
                    {formatTime(activeAppointment.start_time)} <span className="text-muted-foreground mx-1">-</span> {formatTime(activeAppointment.end_time)}
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground truncate">w/ {activeAppointment.stations?.name || "Barber"}</div>
                    
                    {/* TRIGGER CUSTOM MODAL */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsCancelModalOpen(true)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive p-0 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setIsBookingOpen(true)} className="w-full px-6 py-2.5 shadow-lg">Book Appointment</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Tabs) - Keeping existing logic */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
        <div className="flex items-center gap-4 md:gap-8 border-b border-border mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
          {['Services', 'About', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 md:pb-4 text-sm md:text-base font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.toLowerCase() ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Placeholder (Shortened for brevity as it didn't change) */}
        <div className="min-h-[300px] animate-in slide-in-from-bottom-4 duration-500">
           {activeTab === 'services' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
               {services.map((service) => (
                 <Card key={service.id} className="group cursor-pointer hover:border-gold/40 transition-all active:scale-[0.98] p-4 md:p-5">
                   {/* ... service card content ... */}
                   <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-base font-bold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <Badge className="mt-2"><Clock size={12} className="mr-1"/>{service.duration}</Badge>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-gold"/>
                   </div>
                 </Card>
               ))}
             </div>
           )}
           {/* ... Other tabs ... */}
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 md:py-4 bg-background/95 backdrop-blur-xl border-t border-border md:hidden z-30 pb-safe">
        {isLoadingAppt ? (
          <div className="w-full h-12 bg-muted rounded-lg animate-pulse" />
        ) : activeAppointment ? (
          <div className="flex items-center justify-between gap-3 bg-card border border-gold/30 p-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                 <Calendar size={18} />
               </div>
               <div className="flex flex-col min-w-0">
                 <span className="text-xs font-bold text-gold uppercase tracking-wider">Booked</span>
                 <span className="text-sm font-semibold truncate text-foreground">
                   {formatDate(activeAppointment.start_time)}, {formatTime(activeAppointment.start_time)}
                 </span>
               </div>
            </div>

            {/* TRIGGER CUSTOM MODAL (MOBILE) */}
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsCancelModalOpen(true)}
                className="h-9 px-3 shrink-0"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button className="w-full mobile-button h-12" onClick={() => setIsBookingOpen(true)}>
              Book Appointment
            </Button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <BookingModal
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          checkActiveAppointment();
        }} 
        shopName={shopName}
        shopId={shop?.id}
        userId={user?.id}
      />

      {/* NEW CUSTOM CANCEL MODAL */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelAppointment}
        appointmentDate={activeAppointment ? `${formatDate(activeAppointment.start_time)} at ${formatTime(activeAppointment.start_time)}` : undefined}
      />
    </div>
  );
}