import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useNegativeReviewAlert } from "@/hooks/useNegativeReviewAlert";

export function DashboardLayout() {
  const { negativeCount, clearCount } = useNegativeReviewAlert();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar negativeReviewCount={negativeCount} onReviewsSeen={clearCount} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
