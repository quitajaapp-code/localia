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
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminInbox from "./pages/admin/AdminInbox";
import AdminWorkflows from "./pages/admin/AdminWorkflows";
import AdminTemplates from "./pages/admin/AdminTemplates";
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
import AiOptimizer from "./pages/dashboard/AiOptimizer";
import PublicSite from "./pages/PublicSite";
import Demos from "./pages/Demos";
import Agents from "./pages/dashboard/Agents";
import AlertHistory from "./pages/dashboard/AlertHistory";

const queryClient = new QueryClient();

const isSubdomainSite = () => {
  const h = window.location.hostname;
  return h.endsWith('.localai.app.br') && h !== 'localai.app.br' && h !== 'www.localai.app.br';
};

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
            <Route path="/demos" element={<Demos />} />

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
                <Route path="website" element={<WebsitePage />} />
                <Route path="ai-optimizer" element={<AiOptimizer />} />
                <Route path="agents" element={<Agents />} />
                <Route path="agents/alerts" element={<AlertHistory />} />
              </Route>
            </Route>

            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="crm" element={<AdminCRM />} />
                <Route path="inbox" element={<AdminInbox />} />
                <Route path="workflows" element={<AdminWorkflows />} />
              </Route>
            </Route>

            <Route path="/site/:slug" element={<PublicSite />} />
            <Route path="/" element={isSubdomainSite() ? <PublicSite /> : <Landing />} />
            <Route path="*" element={isSubdomainSite() ? <PublicSite /> : <NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
