import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/ui/navigation";
import { getUserServer } from "@/lib/auth-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Accountment CRM",
  description: "Система управління обліковими звітами",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServer();

  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {user && <Navigation user={user} />}
        <main className={user ? "min-h-screen bg-gray-50" : "min-h-screen"}>
          {children}
        </main>
      </body>
    </html>
  );
}
