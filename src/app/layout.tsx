import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MilestonePay — Pay-to-Unlock for Freelancers",
  description: "Lock your project deliverables behind a paywall. Get paid before clients download.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}