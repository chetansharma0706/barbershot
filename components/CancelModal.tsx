"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  appointmentDate?: string;
}

export default function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Cancel Appointment?",
  description = "Are you sure you want to cancel? This action cannot be undone.",
  appointmentDate,
}: CancelModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle animation mounting
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Content */}
      <div 
        className={`
          relative w-[90%] max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden
          transform transition-all duration-300 ease-out
          ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5 pb-0">
           <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
             <AlertTriangle className="w-6 h-6 text-destructive" />
           </div>
           <button 
             onClick={onClose} 
             disabled={isLoading}
             className="text-muted-foreground hover:text-foreground p-1 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-2">
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            {description}
          </p>
          {appointmentDate && (
             <div className="mt-4 bg-muted/40 p-3 rounded-lg border border-border/50 text-sm font-medium flex items-center gap-2 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                {appointmentDate}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-4 flex gap-3 border-t border-border/50">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 h-11 border-transparent bg-background hover:bg-muted shadow-sm"
          >
            Keep it
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading}
            variant="destructive"
            className="flex-1 h-11 shadow-md hover:shadow-destructive/20 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Canceling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}