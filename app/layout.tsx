import React from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Inconsolata } from 'next/font/google'
import "./globals.css";

// Initialize fonts
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ["300","400","500","600","700","800","900"],
  variable: '--font-sans',
  display: 'swap',
})
const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ["400","500","600","700"],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "pal - Color Palette Generator",
  description:
    "Generate beautiful aesthetic color palettes for branding, UI design, interior design, and more",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "pal",
  },
  applicationName: "pal",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inconsolata.variable}`}>
      <body className="font-sans antialiased overscroll-none">
        {children}
      </body>
    </html>
  );
}
