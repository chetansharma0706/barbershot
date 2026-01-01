"use client";

import { Tables } from "@/database.types";
import { useState, useEffect, useCallback } from "react";
import { Scissors, MapPin, Clock, Star, ChevronRight, Phone, Calendar, User, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./bookingModal";
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

  // Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // New Details Modal
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

      const now = new Date().toISOString();
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
    id,
    start_time,
    end_time,
    stations!appointments_station_id_fkey (
      name
    ),
    status
  `)
        .eq('barber_shop_id', shop.id)
        .eq('customer_id', user.id)
        .eq('status', 'booked')
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

  const handleCancelAppointment = async () => {
    if (!activeAppointment) return;
    try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', activeAppointment.id)
  .eq('customer_id', user.id)
  .select()
  .single();


    if (error) throw error;
    } catch (error) {
      console.error("Error cancelling appointment", error);
    } finally {
    checkActiveAppointment();
    setActiveAppointment(null);
    setIsDetailsModalOpen(false); 
    }// Close details modal if open
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
  const reviewsCount = shop?.total_reviews || 0;

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
          <img src={bgImage} alt="Shop Interior" className="w-full h-full object-cover" />
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
                {!activeAppointment && (
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> <span>Accepting Bookings</span></span>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* DESKTOP ACTION AREA (Ticket Style)                   */}
            {/* ---------------------------------------------------- */}
            <div className="hidden md:block flex-shrink-0 w-[320px]">
              {isLoadingAppt ? (
                <div className="h-24 bg-muted/20 backdrop-blur-sm animate-pulse rounded-xl w-full border border-white/5" />
              ) : activeAppointment ? (
                <div className="relative overflow-hidden bg-zinc-950/80 backdrop-blur-xl border border-gold/40 rounded-xl shadow-2xl animate-in slide-in-from-right-4 group">

                  {/* Gold Glow Effect */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gold/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-gold/20 text-gold">
                          <Calendar size={14} />
                        </div>
                        <span className="text-xs font-bold text-gold tracking-wide uppercase">Upcoming</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400 bg-green-500/10 px-2">Confirmed</Badge>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                          {formatTime(activeAppointment.start_time)}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {formatDate(activeAppointment.start_time)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-muted-foreground mb-0.5">Barber</div>
                        <div className="text-xs font-semibold text-white bg-white/10 px-2 py-1 rounded">
                          {activeAppointment.stations?.name?.split(' ')[0] || "Staff"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashed Separator */}
                  <div className="relative w-full h-px">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-white/20"></div>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-r border-gold/40"></div>
                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-l border-gold/40"></div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-black/20 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Booking ID: #{activeAppointment.id.slice(0, 4)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="h-6 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive px-3 rounded-full uppercase tracking-wider font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setIsBookingOpen(true)} className="w-full h-12 text-base font-semibold shadow-xl shadow-gold/20 hover:shadow-gold/30 transition-all">
                  Book Appointment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Tabs) */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
        <div className="flex items-center gap-4 md:gap-8 border-b border-border mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
          {['Services', 'About', 'Reviews'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`pb-3 md:pb-4 text-sm md:text-base font-medium transition-all relative whitespace-nowrap ${activeTab === tab.toLowerCase() ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"}`}>{tab}</button>
          ))}
        </div>

        <div className="min-h-[300px] animate-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {services.map((service) => (
                <Card key={service.id} className="group cursor-pointer hover:border-gold/40 transition-all active:scale-[0.98] p-4 md:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2"><h3 className="text-base md:text-lg font-bold group-hover:text-gold transition-colors text-foreground leading-snug">{service.name}</h3></div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                      <Badge className="flex w-fit items-center gap-1.5 px-2.5 py-1"><Clock size={12} /> {service.duration}</Badge>
                    </div>
                    <div className="ml-3 flex items-center justify-center w-8 h-8 rounded-full bg-input text-muted-foreground group-hover:bg-gold group-hover:text-black transition-all flex-shrink-0"><ChevronRight size={18} /></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'about' &&
            (<div className="space-y-4 md:space-y-6">
              <Card className="p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gold">About Us</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {shop?.shop_description || "Welcome to our premium barbershop. We are dedicated to providing the best grooming experience using top-quality products and techniques. Sit back, relax, and let our master barbers take care of your style."}
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <Card className="flex items-start gap-3 md:gap-4 p-4 md:p-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-input flex items-center justify-center text-gold flex-shrink-0">
                    <MapPin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 text-sm md:text-base">Visit Us</h4>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words">{address}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{shop?.zip_code}</p>
                  </div>
                </Card>
                <Card className="flex items-start gap-3 md:gap-4 p-4 md:p-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-input flex items-center justify-center text-gold flex-shrink-0">
                    <Phone size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 text-sm md:text-base">Contact</h4>
                    <p className="text-xs md:text-sm text-muted-foreground break-words">{shop?.phone || "No phone listed"}</p>
                  </div>
                </Card>
              </div>

              <Card className="p-5 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground text-base md:text-lg">
                  <Clock size={18} className="text-gold" /> Business Hours
                </h3>
                <div className="space-y-2.5 md:space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center border-b border-border pb-2.5">
                    <span>Mon - Fri</span>
                    <span className="font-medium">10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2.5">
                    <span>Saturday</span>
                    <span className="font-medium">09:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sunday</span>
                    <span className="text-destructive font-medium">Closed</span>
                  </div>
                </div>
              </Card>
            </div>)}

          {activeTab === 'reviews' && (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 p-4 md:p-6 glass-card bg-gold/5 border-gold/20 rounded-lg">
                <div className="text-3xl md:text-4xl font-bold text-gold flex-shrink-0">{rating}</div>
                <div className="flex-1">
                  <div className="flex text-gold mb-1.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Based on {reviewsCount} reviews</p>
                </div>
              </div>

              {/* Mock Reviews List */}
              {[1, 2, 3].map((review) => (
                <Card key={review} className="p-4 md:p-5">
                  <div className="flex justify-between items-start mb-2 md:mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <div className="font-bold text-foreground text-sm md:text-base">Satisfied Client</div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">2 days ago</span>
                  </div>
                  <div className="flex text-gold mb-2 md:mb-3 pl-10">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pl-10">
                    "Great service! The barber really took his time and the atmosphere was amazing. Definitely coming back."
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MOBILE STICKY ACTION BAR                             */}
      {/* ---------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border md:hidden z-30 pb-[env(safe-area-inset-bottom,20px)]">
        {isLoadingAppt ? (
          <div className="w-full h-12 mb-2 bg-muted rounded-lg animate-pulse" />
        ) : activeAppointment ? (
          <div
            onClick={() => setIsDetailsModalOpen(true)}
            className="w-full bg-card mb-2 border border-gold/30 rounded-lg p-2.5 px-4 shadow-lg flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-card/80"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Confirmed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground leading-none">
                  {formatTime(activeAppointment.start_time)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDate(activeAppointment.start_time).split(',')[0]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right border-r border-border pr-3">
                <div className="text-[10px] text-muted-foreground">Barber</div>
                <div className="text-xs font-semibold">{activeAppointment.stations?.name?.split(' ')[0] || "Any"}</div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
          </div>
        ) : (
          <Button className="w-full h-12 text-base shadow-lg shadow-primary/20" onClick={() => setIsBookingOpen(true)}>
            Book Appointment
          </Button>
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

      {/* DETAILS MODAL (Inline Implementation) */}
      {isDetailsModalOpen && activeAppointment && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsDetailsModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* {header} */}
            <div className="p-6 flex justify-between items-start border-b">
              <div>
                <h3 className="text-xl font-bold">
                  Appointment Details
                </h3>
                <p className="text-sm text-muted-foreground mt-1">at {shopName}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-semibold">{formatDate(activeAppointment.start_time)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="font-semibold text-lg">{formatTime(activeAppointment.start_time)} - {formatTime(activeAppointment.end_time)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Specialist</span>
                  <span className="font-semibold">{activeAppointment.stations?.name || "Staff"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Confirmed</Badge>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground mb-4">
                  Need to change plans? You can cancel this appointment below.
                </p>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsCancelModalOpen(true);
                  }}
                  className="text-sm text-destructive mb-2 font-medium underline underline-offset-4 hover:text-destructive/80 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelAppointment}
        appointmentDate={activeAppointment ? `${formatDate(activeAppointment.start_time)} at ${formatTime(activeAppointment.start_time)}` : undefined}
      />
    </div>
  );
}