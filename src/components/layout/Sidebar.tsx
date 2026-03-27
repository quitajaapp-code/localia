import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Star,
  FileText,
  Megaphone,
  FolderOpen,
  BarChart3,
  Settings,
  Globe,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import localaiLogo from "@/assets/localai-logo.png";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/reviews", label: "Avaliações", icon: Star },
  { to: "/dashboard/posts", label: "Posts", icon: FileText },
  { to: "/dashboard/ads", label: "Anúncios", icon: Megaphone },
  { to: "/dashboard/materials", label: "Materiais", icon: FolderOpen },
  { to: "/dashboard/report", label: "Relatório", icon: BarChart3 },
  { to: "/dashboard/website", label: "Meu Site", icon: Globe, badge: "Novo" },
  { to: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin } = useAdmin();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b border-sidebar-border">
        <img src={localaiLogo} alt="LocalAI" className="h-8" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              isActive(item.to)
                ? "bg-sidebar-accent text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
            {'badge' in item && (item as any).badge && (
              <span className="ml-auto text-[10px] font-semibold bg-primary/20 text-primary px-1.5 py-0.5 rounded">{(item as any).badge}</span>
            )}
            {isActive(item.to) && !('badge' in item) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin Link */}
      {isAdmin && (
        <div className="px-3 py-2 border-t border-sidebar-border">
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-sidebar-accent/50 transition-colors"
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>Painel Admin</span>
          </NavLink>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">LocalAI v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-medium"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-foreground/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
