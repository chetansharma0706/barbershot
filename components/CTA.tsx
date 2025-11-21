"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const benefits = [
  "No setup fees",
  "No monthly minimums",
  "Cancel anytime",
  "Your data stays yours",
];

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/cta-bg.jpg)` }}
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Background Effects */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, hsla(42, 100%, 55%, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, hsla(42, 100%, 55%, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, hsla(42, 100%, 55%, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 md:p-16 rounded-3xl border-gold/20 text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
            <span className="text-sm text-gold font-medium font-inter">Limited Time Offer</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold">
              <span className="text-foreground">Ready to </span>
              <span className="text-shimmer">Elevate Your Brand?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
              Join 500+ master barbers who transformed their business in 2 minutes.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 text-left"
              >
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-gold" />
                </div>
                <span className="text-foreground font-inter">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              className="group font-bold"
              onClick={() => window.location.href = '/signup'}
            >
              Start Your Free Trial
              <ArrowRight className ="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="font-bold glass-border glass-bg hover:text-foreground cursor-pointer border-gold" >
              Book a Demo
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-muted-foreground font-inter">
            No credit card required · Setup in 2 minutes · Free forever plan available
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
