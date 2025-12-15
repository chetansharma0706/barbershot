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
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 font-sans selection:bg-gold selection:text-black">
      
      {/* --- Sticky Navbar (Glass) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
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
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-10 fade-in-up">
          <div className="container mx-auto flex flex-col md:flex-row md:items-end gap-6">
            
            {/* Logo Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-[var(--shadow-gold)] bg-card">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star size={10} fill="currentColor" /> {rating}
              </div>
            </div>

            {/* Shop Details */}
            <div className="flex-1 space-y-2 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight text-shimmer">
                {shopName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-gold" /> {shop?.city || "City"}, {shop?.state || "State"}</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-gold" /> Open Now</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Accepting Bookings</span>
              </div>
            </div>

            {/* Desktop Booking CTA */}
            <div className="hidden md:block pb-2">
              <Button onClick={() => setIsBookingOpen(true)}>Book Appointment</Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
          {['Services', 'About', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 text-sm md:text-base font-medium transition-all relative whitespace-nowrap ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="group cursor-pointer hover:border-gold/40 transition-all active:scale-[0.98]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold group-hover:text-gold transition-colors text-foreground">{service.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <Badge className="flex w-fit items-center gap-1">
                        <Clock size={12} /> {service.duration}
                      </Badge>
                    </div>
                    <div className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-input text-muted-foreground group-hover:bg-gold group-hover:text-black transition-all">
                       <ChevronRight size={18} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-xl font-bold mb-4 text-gold">About Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {shop?.shop_description || "Welcome to our premium barbershop. We are dedicated to providing the best grooming experience using top-quality products and techniques. Sit back, relax, and let our master barbers take care of your style."}
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center text-gold">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Visit Us</h4>
                    <p className="text-sm text-muted-foreground">{address}</p>
                    <p className="text-sm text-muted-foreground">{shop?.zip_code}</p>
                  </div>
                </Card>
                
                <Card className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center text-gold">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Contact</h4>
                    <p className="text-sm text-muted-foreground">{shop?.phone || "No phone listed"}</p>
                    <div className="flex gap-3 mt-1 text-muted-foreground">
                      <Instagram size={16} className="hover:text-gold" />
                      <Globe size={16} className="hover:text-gold" />
                    </div>
                  </div>
                </Card>
              </div>

               {/* Simple Hours Display */}
               <Card>
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-foreground"><Clock size={18} className="text-gold" /> Business Hours</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between border-b border-border pb-2"><span>Mon - Fri</span> <span>10:00 AM - 8:00 PM</span></div>
                    <div className="flex justify-between border-b border-border pb-2"><span>Saturday</span> <span>09:00 AM - 6:00 PM</span></div>
                    <div className="flex justify-between"><span>Sunday</span> <span className="text-destructive">Closed</span></div>
                  </div>
               </Card>
            </div>
          )}

           {/* Reviews Tab */}
           {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6 p-4 glass-card bg-gold/5 border-gold/20">
                 <div className="text-4xl font-bold text-gold">{rating}</div>
                 <div>
                    <div className="flex text-gold">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on {reviews} reviews</p>
                 </div>
              </div>

              {[1, 2, 3].map((review) => (
                <Card key={review}>
                  <div className="flex justify-between mb-2">
                    <div className="font-bold text-foreground">Satisfied Client</div>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex text-gold mb-2">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-sm text-muted-foreground">"Great service! The barber really took his time and the atmosphere was amazing. Definitely coming back."</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Mobile Sticky Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border md:hidden z-30 pb-safe">
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="shrink-0 aspect-square rounded-xl">
             <Navigation size={20} />
          </Button>
          <Button 
            className="w-full mobile-button shadow-[var(--shadow-gold-lg)] animate-pulse hover:animate-none" 
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
      />
    </div>
  );
}