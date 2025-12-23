import { Tables } from "@/database.types";

import { useState, useEffect } from "react";
import { Scissors, MapPin, Clock, Star, ChevronRight, Phone, Instagram, Globe, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./bookingModal";

type Shop = Tables<'barber_shops'>

export default function ShopPage({ shop }: { shop: Shop | null }) {
  const [activeTab, setActiveTab] = useState('services');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock Services Data
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      
      {/* --- Sticky Navbar (Glass) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
          <div className={`font-bold text-xl tracking-tight flex items-center gap-2 ${isScrolled ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <span className="text-gold"><Scissors size={20} /></span>
            {shopName}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="relative h-[45vh] md:h-[50vh] w-full overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img 
            src={bgImage} 
            alt="Shop Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        {/* Content Positioned Bottom */}
        <div className="absolute bottom-0 left-0 w-full px-4 py-6 md:px-8 md:py-10 lg:px-12 z-10 fade-in-up">
          <div className="container mx-auto flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            
            {/* Logo Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-[var(--shadow-gold)] bg-card">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gold text-black text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star size={10} fill="currentColor" /> {rating}
              </div>
            </div>

            {/* Shop Details */}
            <div className="flex-1 space-y-2 md:space-y-3">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-shimmer leading-tight">
                {shopName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gold flex-shrink-0" /> 
                  <span>{shop?.city || "City"}, {shop?.state || "State"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gold flex-shrink-0" /> 
                  <span>Open Now</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" /> 
                  <span>Accepting Bookings</span>
                </span>
              </div>
            </div>

            {/* Desktop Booking CTA */}
            <div className="hidden md:block flex-shrink-0">
              <Button onClick={() => setIsBookingOpen(true)} className="px-6 py-2.5">
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 md:gap-8 border-b border-border mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
          {['Services', 'About', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 md:pb-4 text-sm md:text-base font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.toLowerCase() 
                  ? "text-gold border-b-2 border-gold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px] animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {services.map((service) => (
                <Card key={service.id} className="group cursor-pointer hover:border-gold/40 transition-all active:scale-[0.98] p-4 md:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base md:text-lg font-bold group-hover:text-gold transition-colors text-foreground leading-snug">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                      <Badge className="flex w-fit items-center gap-1.5 px-2.5 py-1">
                        <Clock size={12} /> {service.duration}
                      </Badge>
                    </div>
                    <div className="ml-3 flex items-center justify-center w-8 h-8 rounded-full bg-input text-muted-foreground group-hover:bg-gold group-hover:text-black transition-all flex-shrink-0">
                       <ChevronRight size={18} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4 md:space-y-6">
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

               {/* Simple Hours Display */}
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
            </div>
          )}

           {/* Reviews Tab */}
           {activeTab === 'reviews' && (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 p-4 md:p-6 glass-card bg-gold/5 border-gold/20 rounded-lg">
                 <div className="text-3xl md:text-4xl font-bold text-gold flex-shrink-0">{rating}</div>
                 <div className="flex-1">
                    <div className="flex text-gold mb-1.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">Based on {reviews} reviews</p>
                 </div>
              </div>

              {[1, 2, 3].map((review) => (
                <Card key={review} className="p-4 md:p-5">
                  <div className="flex justify-between items-start mb-2 md:mb-3 gap-2">
                    <div className="font-bold text-foreground text-sm md:text-base">Satisfied Client</div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">2 days ago</span>
                  </div>
                  <div className="flex text-gold mb-2 md:mb-3">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    "Great service! The barber really took his time and the atmosphere was amazing. Definitely coming back."
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Mobile Sticky Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 md:py-4 bg-background/90 backdrop-blur-xl border-t border-border md:hidden z-30 pb-safe">
        <div className="flex gap-3">
          <Button 
            className="w-full mobile-button shadow-[var(--shadow-gold-lg)] animate-pulse hover:animate-none h-12" 
            onClick={() => setIsBookingOpen(true)}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* --- Booking Modal Component --- */}
      <BookingModal
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        shopName={shopName}
        shopId={shop?.id}
      />
    </div>
  );
}