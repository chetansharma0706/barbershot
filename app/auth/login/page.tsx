"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {  ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Unified redirect function
  const redirectToDashboard = (role: string | null) => {
    if (role === "barber") {
      router.push("/barber-dashboard");
    } else {
      router.push("/find-barbers");
    }
  };

  // Check auth on mount ONLY
  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || ignore) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_role")
        .eq("user_id", session.user.id)
        .single();

      redirectToDashboard(profile?.user_role || null);
    }

    checkAuth();

    return () => {
      ignore = true;
    };
  }, []);

  // LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch profile ONE time
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_role")
        .eq("user_id", data.user.id)
        .single();

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      redirectToDashboard(profile?.user_role || null);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-transparent to-accent/10 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
               <span className="text-2xl text-shimmer font-bold text-foreground">
              Barberbro.
            </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to continue to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="mobile-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="mobile-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mobile-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="text-accent font-medium cursor-pointer hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
