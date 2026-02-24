import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./convex-provider";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Tars Chat | Lightning Fast Messaging",
  description:
    "Experience blazing-fast, secure, and zero-clutter messaging. Because another meeting could have just been a message.",

  keywords: [
    "chat app",
    "messaging",
    "secure chat",
    "team collaboration",
    "real-time messaging",
    "Tars Chat",
  ],

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-100% w-full bg-transparent">
        <ClerkProvider>
          <ConvexClientProvider>
            <Navbar />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
