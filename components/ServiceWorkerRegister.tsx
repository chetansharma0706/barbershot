'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production
    // If you want to enable in dev, remove the NODE_ENV check
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service Worker registered:', reg);
      }).catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }, []);
  return null;
}
