"use client";
import { motion } from "framer-motion";
import { Scissors, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/use-onboarding";
export default function RoleSelection() {
  const router = useRouter();


  const { setUserRole, updateOnboardingStep } = useOnboarding()

  const handleRoleSelect = async (role: 'barber' | 'customer') => {
    await setUserRole(role)
    
    if (role === 'barber') {
      await updateOnboardingStep('barber_setup')
      router.push('/onboarding/barber_setup')
    } else {
      await updateOnboardingStep('customer_preferences')
      router.push('/onboarding/customer_preferences')
    }
  }


  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-accent/10 pointer-events-none" />
      
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-shimmer">Choose Your Path</h1>
          <p className="text-muted-foreground text-base md:text-lg">How would you like to use our platform?</p>
        </motion.div>

        <div className="space-y-4">
          {/* Barber Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleRoleSelect("barber")}
            className="w-full glass-card p-6 md:p-8 hover:bg-card/60 transition-all duration-300 group mobile-touch-target"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                <Scissors className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">I'm a Barber</h2>
                <p className="text-muted-foreground text-sm md:text-base">Create my digital shop</p>
              </div>
            </div>
          </motion.button>

          {/* Customer Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleRoleSelect("customer")}
            className="w-full glass-card p-6 md:p-8 hover:bg-card/60 transition-all duration-300 group mobile-touch-target"
          >
            <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">I Need a Haircut</h2>
                <p className="text-muted-foreground text-sm md:text-base">Find barbers near me</p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
