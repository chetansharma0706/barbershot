"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Scissors, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
// Images are served from the `public/` folder; reference by path instead of importing

const Hero = () => {

  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Layered Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />
        
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 pt-20 pb-16">
        <div className="flex justify-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center max-w-3xl"
          >
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { icon: Calendar, text: "Smart Booking" },
                { icon: Scissors, text: "Your Brand" },
                { icon: TrendingUp, text: "Grow Fast" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 px-2 md:px-6 py-2 glass-card border border-gold/20 rounded-full"
                >
                  <item.icon className="w-3 h-3 md:h-4 md:w-4 text-gold" />
                  <span className="text-xs md:text-sm font-semibold text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Headline */}
            <div className="space-y-6 flex flex-col items-center">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-headline font-black leading-[0.95] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="block text-foreground">Digital Shops For Barbers</span>
              </motion.h1>
              
              <motion.p 
                className="text-md md:text-lg text-muted-foreground font-medium leading-relaxed max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                The premium booking platform built for{" "}
                <span className="text-gold font-bold">modern barbers</span> who refuse to be ordinary.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                className="group text-lg font-bold"
                onClick={() => router.push('/auth/signup')}
              >
                Start For Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="text-lg font-semibold">
                Watch Demo
              </Button>
            </motion.div>

          
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-2 bg-gold rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
