import type { Metadata } from "next";
import { Geist, Manrope , DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberBro - Next Gen Barber Booking",
  description: "Book your barber appointments with ease using BarberBro, the next generation barber booking platform.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
      suppressHydrationWarning={true}
        className={`
          ${geistSans.variable} 
          ${dmSans.variable} 
          ${manrope.variable}
          antialiased
        `}
      >
        {children}
        <Toaster position="bottom-right"/>
      </body>
    </html>
  );
}
