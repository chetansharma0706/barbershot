"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";



export function ResponsiveOverlay({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed w-full bg-background ${
          isDesktop
            ? "left-1/2 top-1/2 max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl p-6"
            : "bottom-0 rounded-t-2xl p-5"
        }`}
      >
        {!isDesktop && (
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {isDesktop && (
            <button onClick={onClose}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}
