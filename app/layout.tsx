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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", sizes: "512x512" },
      { url: "/favicon.ico" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
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
