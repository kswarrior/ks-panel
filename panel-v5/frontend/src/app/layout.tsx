import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KS Panel v5",
  description: "Advanced Cyberpunk Cloud Control Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0c] text-white flex min-h-screen selection:bg-blue-500/30 selection:text-blue-200`}>
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
