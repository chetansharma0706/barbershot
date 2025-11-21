"use client";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Bell, Settings, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: Calendar,
    title: "Smart Booking",
    description: "Real-time slot management with automatic confirmations and reminders.",
  },
  {
    icon: CreditCard,
    title: "Instant Payments",
    description: "Seamless Razorpay integration. Track earnings in real-time.",
  },
  {
    icon: Bell,
    title: "Auto Reminders",
    description: "SMS and push notifications keep your clients informed.",
  },
  {
    icon: Settings,
    title: "Full Control",
    description: "Customize your services, prices, and availability instantly.",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Beautiful charts showing your growth and peak hours.",
  },
  {
    icon: Shield,
    title: "Your Brand",
    description: "Custom logo, colors, and your personal shop URL.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold">
            <span className="text-foreground">Everything You Need.</span>
            <br />
            <span className="text-shimmer">Nothing You Don't.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            Built for Indian barbers who take pride in their craft.
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-4xl mx-auto"
        >
            <div className="relative rounded-2xl overflow-hidden">
            <Image 
              src="/features-hero.jpg" 
              alt="Barber viewing analytics dashboard"
              width={1024}
              height={640}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card p-6 rounded-xl hover:border-gold/40 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-gold" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-playfair font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-inter">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
