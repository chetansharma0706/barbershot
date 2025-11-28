import React from 'react';

export default function Head() {
  return (
    <>
      {/* PWA primary meta tags */}
      <link rel="manifest" href="/manifest" />
      <meta name="theme-color" content="#000000" />

      {/* iOS meta tags for PWA */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="BarberBro" />

      {/* Touch icon to use on iOS */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Favicons */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

      {/* Microsoft tile color (Windows) */}
      <meta name="msapplication-TileColor" content="#000000" />

      {/* Prevent default iOS telephone styling */}
      <meta name="format-detection" content="telephone=no" />
    </>
  );
}
