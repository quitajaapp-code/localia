import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import Landing from "./pages/Landing";

/* ── Lazy-loaded routes (code-split) ── */
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const SeoLocal = lazy(() => import("./pages/SeoLocal"));
const Blog = lazy(() => import("./pages/Blog"));
const Demos = lazy(() => import("./pages/Demos"));
const PublicSite = lazy(() => import("./pages/PublicSite"));

/* Blog articles */
const SeoLocal2026 = lazy(() => import("./pages/blog/SeoLocal2026"));
const IaAvaliacoesNegativas = lazy(() => import("./pages/blog/IaAvaliacoesNegativas"));
const MiniSiteGratis = lazy(() => import("./pages/blog/MiniSiteGratis"));
const ErrosGoogleAds = lazy(() => import("./pages/blog/ErrosGoogleAds"));
const ChecklistGMN = lazy(() => import("./pages/blog/ChecklistGMN"));
const CasoReal40Porcento = lazy(() => import("./pages/blog/CasoReal40Porcento"));
const Postar4Vezes = lazy(() => import("./pages/blog/Postar4Vezes"));
const LgpdSeguranca = lazy(() => import("./pages/blog/LgpdSeguranca"));

/* Protected routes */
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute").then(m => ({ default: m.ProtectedRoute })));
const ProtectedAdminRoute = lazy(() => import("./components/ProtectedAdminRoute").then(m => ({ default: m.ProtectedAdminRoute })));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout").then(m => ({ default: m.AdminLayout })));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout").then(m => ({ default: m.DashboardLayout })));

/* Admin */
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminBusinesses = lazy(() => import("./pages/admin/AdminBusinesses"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminCRM = lazy(() => import("./pages/admin/AdminCRM"));
const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"));
const AdminWorkflows = lazy(() => import("./pages/admin/AdminWorkflows"));
const AdminTemplates = lazy(() => import("./pages/admin/AdminTemplates"));

/* Onboarding */
const OnboardingLayout = lazy(() => import("./pages/onboarding/OnboardingLayout"));
const ConnectGoogle = lazy(() => import("./pages/onboarding/ConnectGoogle"));
const BusinessInfo = lazy(() => import("./pages/onboarding/BusinessInfo"));
const MaterialsOnboarding = lazy(() => import("./pages/onboarding/Materials"));

/* Dashboard */
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Reviews = lazy(() => import("./pages/dashboard/Reviews"));
const Posts = lazy(() => import("./pages/dashboard/Posts"));
const Ads = lazy(() => import("./pages/dashboard/Ads"));
const MaterialsPage = lazy(() => import("./pages/dashboard/MaterialsPage"));
const Report = lazy(() => import("./pages/dashboard/Report"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const NewCampaign = lazy(() => import("./pages/dashboard/ads/NewCampaign"));
const CampaignDetail = lazy(() => import("./pages/dashboard/ads/CampaignDetail"));
const WebsitePage = lazy(() => import("./pages/dashboard/Website"));
const AiOptimizer = lazy(() => import("./pages/dashboard/AiOptimizer"));
const Agents = lazy(() => import("./pages/dashboard/Agents"));
const AlertHistory = lazy(() => import("./pages/dashboard/AlertHistory"));

const queryClient = new QueryClient();

const isSubdomainSite = () => {
  const h = window.location.hostname;
  return h.endsWith('.localai.app.br') && h !== 'localai.app.br' && h !== 'www.localai.app.br';
};

/* Minimal loading fallback */
function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020817" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/seo-local" element={<SeoLocal />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/estrategias-seo-local-2026" element={<SeoLocal2026 />} />
              <Route path="/blog/ia-responde-avaliacoes-negativas" element={<IaAvaliacoesNegativas />} />
              <Route path="/blog/mini-site-gratis-negocios-locais" element={<MiniSiteGratis />} />
              <Route path="/blog/erros-google-ads-restaurantes-2026" element={<ErrosGoogleAds />} />
              <Route path="/blog/checklist-google-meu-negocio" element={<ChecklistGMN />} />
              <Route path="/blog/caso-real-40-porcento-ligacoes" element={<CasoReal40Porcento />} />
              <Route path="/blog/postar-4-vezes-por-semana" element={<Postar4Vezes />} />
              <Route path="/blog/lgpd-seguranca-google-meu-negocio" element={<LgpdSeguranca />} />

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
                  <Route path="templates" element={<AdminTemplates />} />
                </Route>
              </Route>

              <Route path="/site/:slug" element={<PublicSite />} />
              <Route path="/" element={isSubdomainSite() ? <PublicSite /> : <Landing />} />
              <Route path="*" element={isSubdomainSite() ? <PublicSite /> : <NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;