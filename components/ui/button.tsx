import { ButtonProps } from "@/types";
import { Loader2 } from "lucide-react";


export const Button: React.FC<ButtonProps> = ({ variant = "primary", size = "default", loading, children, className = "", ...props }) => {
  // Mapping variants to the new CSS classes
  const baseStyles = "mobile-button gap-2 rounded inline-flex items-center justify-center whitespace-nowrap transition-all duration-300 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--gold-light))] gold-glow font-bold",
    outline: "border border-[hsl(var(--input))] bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
    ghost: "hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
    destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
  };

  const sizes = {
    default: "", // Size handled by .mobile-button class
    sm: "h-10 text-xs",
    icon: "w-12 h-12 p-0",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={loading}
      {...props}
    >
      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      {children}
    </button>
  );
};
