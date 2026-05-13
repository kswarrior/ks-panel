import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
