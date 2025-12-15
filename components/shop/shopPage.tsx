// shoppage.tsx
import { useEffect, useState } from "react";
import { Tables } from "@/database.types";
import {
  Scissors,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Phone,
  Instagram,
  Globe,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./bookingModal";

type Shop = Tables<"barber_shops">;

export default function ShopPage({ shop }: { shop: Shop | null }) {
  const [activeTab, setActiveTab] = useState<"services" | "about" | "reviews">(
    "services"
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener to toggle sticky navbar style.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mock services (replace with real data)
  const services = [
    {
      id: 1,
      name: "Signature Haircut",
      duration: "45 min",
      description: "Precision cut with hot towel finish.",
    },
    {
      id: 2,
      name: "Beard Sculpting",
      duration: "30 min",
      description: "Razor line-up and beard oil treatment.",
    },
    {
      id: 3,
      name: "The Royal Shave",
      duration: "60 min",
      description: "Full straight razor shave with facial massage.",
    },
    {
      id: 4,
      name: "Kids Cut",
      duration: "30 min",
      description: "Gentle styling for the little gentlemen.",
    },
    {
      id: 5,
      name: "Hair & Beard Combo",
      duration: "75 min",
      description: "Complete package for a fresh look.",
    },
  ];

  // Derived values with safe fallbacks.
  const shopName = shop?.shop_name || "Premium Barber";
  const bgImage =
    shop?.cover_image_url ||
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";
  const logoImage =
    shop?.logo_url ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Barber";
  const address = shop?.address ? `${shop.address}, ${shop.city || ""}` : "Location pending";
  const rating = typeof shop?.average_rating === "number" ? shop.average_rating : 4.9;
  const reviews = shop?.total_reviews ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-gold selection:text-black">
      {/* Sticky navbar. Mobile-first, translucent when scrolled. */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-200 ${
          isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border py-3" : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-card rounded-md">
              <Scissors size={18} className="text-gold" />
            </div>
            <div className={`font-semibold tracking-tight text-lg md:text-xl`}>
              {shopName}
            </div>
          </div>

          {/* Desktop CTA inside navbar */}
          <div className="hidden md:block">
            <Button onClick={() => setIsBookingOpen(true)}>Book</Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative w-full mt-14 md:mt-16"> 
        <div className="relative h-56 md:h-72 lg:h-96 w-full overflow-hidden rounded-b-lg">
          <img
            src={bgImage}
            alt={`${shopName} interior`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* single overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent" />
        </div>

        {/* Hero content - positioned overlapping bottom of image */}
        <div className="max-w-5xl mx-auto px-4 -mt-10 md:-mt-12">
          <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-background bg-input">
                <img src={logoImage} alt={`${shopName} logo`} className="w-full h-full object-cover" />
              </div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                  <Star size={12} /> {rating}
                </span>
              </div>
            </div>

            {/* Title and meta */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{shopName}</h1>
              <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> {shop?.city || "City"}, {shop?.state || "State"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} /> Open Now
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Accepting Bookings
                </span>
              </div>
            </div>

            {/* mobile CTA shown in card */}
            <div className="w-full md:w-auto md:pl-4">
              <div className="flex gap-2 items-center">
                <Button className="w-full md:w-auto" onClick={() => setIsBookingOpen(true)}>
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 mt-6 pb-36 md:pb-20">
        {/* Tabs */}
        <div className="overflow-x-auto">
          <div role="tablist" aria-label="Shop sections" className="flex gap-4 pb-3">
            {["Services", "About", "Reviews"].map((t) => {
              const key = t.toLowerCase() as "services" | "about" | "reviews";
              const active = activeTab === key;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap px-2 py-2 rounded-md text-sm font-medium transition ${
                    active ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-selected={active}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab panels */}
        <section className="mt-4 min-h-[220px]">
          {/* SERVICES */}
          {activeTab === "services" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{s.name}</h3>
                        <div className="text-sm text-muted-foreground">{s.duration}</div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                      <div className="mt-3">
                        <Badge className="inline-flex items-center gap-2">
                          <Clock size={12} /> {s.duration}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-2 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-bold text-gold mb-2">About Us</h3>
                <p className="text-sm text-muted-foreground">
                  {shop?.shop_description ||
                    "Welcome to our premium barbershop. We are dedicated to providing the best grooming experience using top-quality products and techniques."}
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Visit Us</h4>
                    <p className="text-sm text-muted-foreground">{address}</p>
                    <p className="text-sm text-muted-foreground">{shop?.zip_code}</p>
                  </div>
                </Card>

                <Card className="p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Contact</h4>
                    <p className="text-sm text-muted-foreground">{shop?.phone || "No phone listed"}</p>
                    <div className="mt-2 flex gap-3 text-muted-foreground">
                      <Instagram size={16} className="hover:text-gold" />
                      <Globe size={16} className="hover:text-gold" />
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Clock size={18} className="text-gold" /> Business Hours
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span>Mon - Fri</span>
                    <span>10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span>Saturday</span>
                    <span>09:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-destructive">Closed</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gold/5 border border-gold/20 flex items-center gap-4">
                <div className="text-2xl font-bold text-gold">{rating}</div>
                <div>
                  <div className="flex text-gold">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {reviews} reviews</p>
                </div>
              </div>

              {[1, 2, 3].map((r) => (
                <Card key={r} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">Satisfied Client</div>
                    <div className="text-xs text-muted-foreground">2 days ago</div>
                  </div>
                  <div className="flex text-gold mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Great service! The barber really took his time and the atmosphere was amazing. Definitely coming back."
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur py-3 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="aspect-square rounded-lg">
              <Navigation size={18} />
            </Button>
            <Button className="flex-1" onClick={() => setIsBookingOpen(true)}>
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} shopName={shopName} />
    </div>
  );
}
