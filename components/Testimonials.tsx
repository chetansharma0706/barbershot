"use client";
import { Quote } from "lucide-react";
// Images are served from `public/` — reference them by path (e.g. `/barber-1.jpg`).
import Image from "next/image";

const testimonials = [
  {
    name: "Arjun Mehta",
    shop: "Royal Cuts, Mumbai",
    text: "My clients love the convenience. I love not managing a register. This app elevated my whole business.",
    rating: 5,
    image: "/barber-1.jpg",
  },
  {
    name: "Vikram Singh",
    shop: "The Gentleman's Den, Delhi",
    text: "Setup took 90 seconds. First booking came in 10 minutes. Never going back to pen and paper.",
    rating: 5,
    image: "/barber-2.jpg",
  },
  {
    name: "Rahul Sharma",
    shop: "Style Studio, Bangalore",
    text: "My shop link looks more professional than shops 10x my size. Feels good to show off.",
    rating: 5,
    image: "/barber-3.jpg",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div
        
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold">
            <span className="text-foreground">Loved by </span>
            <span className="text-shimmer">Master Barbers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            Real feedback from professionals who chose pride over paperwork.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
            
              className="group"
            >
              <div className="glass-card p-8 rounded-2xl hover:border-gold/40 transition-all duration-300 h-full flex flex-col">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-gold/30 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-gold text-lg">★</span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground leading-relaxed mb-6 flex-grow font-inter">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    width={512}
                    height={512}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold/20"
                  />
                  <div>
                    <p className="font-playfair font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground font-inter">{testimonial.shop}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
