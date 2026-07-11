import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/authProvider";

export const metadata: Metadata = {
  title: {
    default: "Billing - JustSimple",
    template: "%s | JustSimple Billing",
  },
  description: "Simple and modern billing software for businesses.",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      // { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      // { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}