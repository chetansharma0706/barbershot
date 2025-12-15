import { Tables } from "@/database.types";
import { useState, useEffect } from "react";
import {
  Scissors,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Phone,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./bookingModal";

type Shop = Tables<"barber_shops">;

export default function ShopPage({ shop }: { shop: Shop | null }) {
  const [activeTab, setActiveTab] = useState("services");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services = [
    { id: 1, name: "Signature Haircut", duration: "45 min", description: "Precision cut with hot towel finish." },
    { id: 2, name: "Beard Sculpting", duration: "30 min", description: "Razor line-up and beard oil treatment." },
    { id: 3, name: "The Royal Shave", duration: "60 min", description: "Full straight razor shave with facial massage." },
    { id: 4, name: "Kids Cut", duration: "30 min", description: "Gentle styling for the little gentlemen." },
    { id: 5, name: "Hair & Beard Combo", duration: "75 min", description: "Complete package for a fresh look." },
  ];

  const shopName = shop?.shop_name || "Premium Barber";
  const bgImage =
    shop?.cover_image_url ||
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";
  const logoImage =
    shop?.logo_url ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Barber";
  const address = shop?.address ? `${shop.address}, ${shop.city || ""}` : "Location pending";
  const rating = shop?.average_rating || 4.9;
  const reviews = shop?.total_reviews || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 md:pb-0">

      {/* Sticky Navbar */}
      <nav
        className={`fixed top-0 inset-x-0 z-40 transition-all ${
          isScrolled
            ? "bg-background/90 backdrop-blur border-b border-border py-3"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Scissors size={18} className="text-gold" />
            <span className={isScrolled ? "opacity-100" : "opacity-0"}>{shopName}</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] w-full">
        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="absolute bottom-0 inset-x-0">
          <div className="max-w-5xl mx-auto px-4 pb-6 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-5">

              {/* Logo */}
              <div className="relative self-start">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background">
                  <img src={logoImage} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gold text-black text-xs px-2 py-1 rounded-full flex gap-1 items-center">
                  <Star size={10} fill="currentColor" /> {rating}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold">{shopName}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {shop?.city}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> Open Now</span>
                </div>
              </div>

              <div className="hidden md:block">
                <Button onClick={() => setIsBookingOpen(true)}>Book Appointment</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border overflow-x-auto">
          {["Services", "About", "Reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 whitespace-nowrap ${
                activeTab === tab.toLowerCase()
                  ? "text-gold border-b-2 border-gold"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Services */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <Card key={service.id} className="p-4 md:p-5">
                <div className="flex justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <Badge className="flex w-fit gap-1">
                      <Clock size={12} /> {service.duration}
                    </Badge>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-input flex items-center justify-center">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* About */}
        {activeTab === "about" && (
          <div className="space-y-4">
            <Card className="p-4 md:p-5">
              <h3 className="text-xl font-semibold mb-2">About Us</h3>
              <p className="text-muted-foreground">{shop?.shop_description}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 flex gap-4">
                <MapPin />
                <div>
                  <p className="font-medium">Visit Us</p>
                  <p className="text-sm text-muted-foreground">{address}</p>
                </div>
              </Card>

              <Card className="p-4 flex gap-4">
                <Phone />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{shop?.phone}</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4">
                <p className="font-medium">Satisfied Client</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Great service. Will come again.
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <Button variant="outline" size="icon">
            <Navigation size={18} />
          </Button>
          <Button className="flex-1" onClick={() => setIsBookingOpen(true)}>
            Book Appointment
          </Button>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        shopName={shopName}
      />
    </div>
  );
}
