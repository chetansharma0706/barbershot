"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, useToast } from "@/hooks/use-toast";
import { Scissors, Mail, Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up (creates user + session)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;
      console.log("👉 SIGNUP USER:", user);
      if (!user) throw new Error("Signup failed. No user returned.");

      // 2. Insert into profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email,
        user_role: null, // role added in onboarding
      }).eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Redirect
      router.push("/role-selection");
    } catch (error: any) {
      alert(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Gradient ambient light */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-accent/10 pointer-events-none" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 md:w-96 md:h-96 bg-gold/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
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
        <div className="glass-card p-6 md:p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
               <span className="text-2xl text-shimmer font-bold text-foreground">
              Barberbro.
            </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground text-base">Join the premium barbering platform</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="name" className="text-foreground text-base mb-2 block">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input"
                placeholder="Your name"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="email" className="text-foreground text-base mb-2 block">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input"
                placeholder="your@email.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="phone" className="text-foreground text-base mb-2 block">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input"
                placeholder="+1 (555) 000-0000"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="password" className="text-foreground text-base mb-2 block">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="glass-input"
                placeholder="Create a secure password"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={loading}
                className="mobile-button hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Creating Account..." : "Continue"}
              </Button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-accent font-medium cursor-pointer hover:underline"
            >
              Sign in
            </button>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
