import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import OnboardingLayout from "./pages/onboarding/OnboardingLayout";
import ConnectGoogle from "./pages/onboarding/ConnectGoogle";
import BusinessInfo from "./pages/onboarding/BusinessInfo";
import MaterialsOnboarding from "./pages/onboarding/Materials";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Reviews from "./pages/dashboard/Reviews";
import Posts from "./pages/dashboard/Posts";
import Ads from "./pages/dashboard/Ads";
import MaterialsPage from "./pages/dashboard/MaterialsPage";
import Report from "./pages/dashboard/Report";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NewCampaign from "./pages/dashboard/ads/NewCampaign";
import CampaignDetail from "./pages/dashboard/ads/CampaignDetail";
import NotFound from "./pages/NotFound";
import WebsitePage from "./pages/dashboard/Website";
import PublicSite from "./pages/PublicSite";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingLayout />}>
                <Route path="connect" element={<ConnectGoogle />} />
                <Route path="business" element={<BusinessInfo />} />
                <Route path="materials" element={<MaterialsOnboarding />} />
              </Route>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="posts" element={<Posts />} />
                <Route path="ads" element={<Ads />} />
                <Route path="ads/new" element={<NewCampaign />} />
                <Route path="ads/:id" element={<CampaignDetail />} />
                <Route path="materials" element={<MaterialsPage />} />
                <Route path="report" element={<Report />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
