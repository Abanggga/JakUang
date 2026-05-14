import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-surface">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col relative h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto mt-20 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
