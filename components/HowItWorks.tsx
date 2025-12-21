"use client";
import { UserPlus, Palette, Share2 } from "lucide-react";
// Images are now served from `public/` — reference them by path (e.g. `/step-signup.jpg`).
import Image from "next/image";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Quick registration with just your mobile number. OTP verified in seconds.",
    number: "01",
    image: "/step-signup.jpg",
  },
  {
    icon: Palette,
    title: "Create Your Shop Page",
    description: "Upload logo, choose your color theme, add services. Your brand, your way.",
    number: "02",
    image: "/step-customize.jpg",
  },
  {
    icon: Share2,
    title: "Share & Grow",
    description: "Get your personal link. Share it. Watch bookings roll in. That simple.",
    number: "03",
    image: "/step-share.jpg",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div
        
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold">
            <span className="text-foreground">Live in </span>
            <span className="text-shimmer">2 Minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            No complexity. No learning curve. Just three steps to your digital storefront.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector Line (not for last item on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
              )}

              {/* Card */}
              <div className="glass-card p-8 rounded-2xl relative overflow-hidden group-hover:border-gold/40 transition-all duration-300">
                {/* Number Background */}
                <div className="absolute -right-4 -top-4 text-8xl font-bold text-gold/5">
                  {step.number}
                </div>

                {/* Image */}
                <div className="relative mb-6 rounded-xl overflow-hidden">
                  <Image 
                    src={step.image} 
                    alt={step.title}
                    width={768}
                    height={512}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  
                  {/* Icon overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative space-y-3">
                  <h3 className="text-2xl font-playfair font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-inter">{step.description}</p>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
