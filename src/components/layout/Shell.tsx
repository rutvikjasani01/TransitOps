"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { 
  Menu, Bell, Sun, Moon, LogOut, Settings, 
  ChevronLeft, ChevronRight, Check, Trash2,
  Search, X, Zap
} from "lucide-react";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ROLE_NAVIGATION } from "@/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

const notifColors = {
  warning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  error: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const { 
    currentRole, 
    currentUser, 
    logout,
    notifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useTransitState();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentUser) router.push("/login");
  }, [currentUser, router]);

  useEffect(() => {
    if (!mounted || !currentUser) return;
    const activeRoutes = ROLE_NAVIGATION[currentRole].map(nav => nav.path);
    if (pathname === "/" || pathname === "/dashboard") {
      if (currentRole === "Safety Officer") router.push("/drivers");
      else router.push("/dashboard");
    }
  }, [pathname, currentRole, mounted, currentUser, router]);

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.Truck className="h-5 w-5 text-primary opacity-60" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Verifying access credentials...</p>
        </div>
      </div>
    );
  }

  const navItems = ROLE_NAVIGATION[currentRole] || [];
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    toast("Logged out successfully.", "info");
    router.push("/login");
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(s => s);
    if (segments.length === 0) return [{ name: "TransitOps", path: "/" }];
    return segments.map((seg, idx) => {
      const path = `/${segments.slice(0, idx + 1).join("/")}`;
      const name = seg.charAt(0).toUpperCase() + seg.slice(1);
      return { name, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const roleColors: Record<string, string> = {
    "Fleet Manager": "from-blue-500 to-indigo-600",
    "Dispatcher": "from-orange-400 to-amber-500",
    "Safety Officer": "from-emerald-500 to-teal-500",
    "Financial Analyst": "from-purple-500 to-violet-600",
  };

  const roleGradient = roleColors[currentRole] || "from-blue-500 to-indigo-600";
  const initials = currentUser.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Sidebar Desktop ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 transition-all duration-300 ease-in-out relative z-20 shrink-0",
          "bg-card/80 dark:bg-card/60 backdrop-blur-xl",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border/40 shrink-0",
          sidebarCollapsed ? "justify-center px-3" : "px-5 space-x-3"
        )}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-400/20 border border-primary/25 shrink-0">
            <Icons.Truck className="h-5 w-5 text-primary" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="font-black text-lg tracking-tight gradient-text whitespace-nowrap">
                  TransitOps
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 py-5 space-y-1 overflow-y-auto", sidebarCollapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                title={sidebarCollapsed ? item.name : undefined}
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer relative",
                  sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5 space-x-3",
                  isActive
                    ? "sidebar-item-active text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 sidebar-item-hover"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl sidebar-item-active"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <DynamicIcon
                  name={item.icon}
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 relative z-10 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : ""
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="relative z-10">{item.name}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto relative z-10 h-1.5 w-1.5 rounded-full bg-white/80"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Role pill & collapse toggle */}
        <div className={cn("p-3 border-t border-border/40 space-y-2")}>
          {!sidebarCollapsed && (
            <div className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold",
              "bg-gradient-to-r", roleGradient, "bg-opacity-10",
              "border border-white/10"
            )}>
              <div className={cn("h-2 w-2 rounded-full bg-gradient-to-r shrink-0", roleGradient)} />
              <span className="text-white/80 truncate">{currentRole}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
          >
            {sidebarCollapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border backdrop-blur-xl flex flex-col md:hidden"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Icons.Truck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-black text-lg gradient-text">TransitOps</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer",
                        isActive
                          ? "sidebar-item-active text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <DynamicIcon name={item.icon} className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50 space-y-2">
                <div className="px-3 py-2 rounded-xl bg-muted/50 text-xs font-semibold text-muted-foreground">
                  {currentUser.name} · {currentRole}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-card/60 backdrop-blur-xl relative z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground md:hidden cursor-pointer transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
              <button
                className="hover:text-foreground transition-colors font-semibold"
                onClick={() => router.push("/")}
              >
                TransitOps
              </button>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={bc.path}>
                  <span className="text-border">/</span>
                  <span
                    className={cn(
                      "transition-colors",
                      idx === breadcrumbs.length - 1
                        ? "text-foreground font-bold"
                        : "hover:text-foreground cursor-pointer"
                    )}
                    onClick={() => idx < breadcrumbs.length - 1 && router.push(bc.path)}
                  >
                    {bc.name}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Global Search */}
            <div className="relative hidden lg:block w-48 xl:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Quick lookup..."
                className="pl-9 h-9 text-xs bg-muted/40 border-border/50 rounded-xl"
                id="global-search"
                onChange={(e) => {
                  if (e.target.value.trim().length > 3) {
                    toast(`Searching: ${e.target.value}`, "info");
                  }
                }}
              />
            </div>

            {/* Theme Toggle */}
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer relative",
                  notifDropdownOpen && "bg-accent/50 text-foreground"
                )}
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-xl glass-panel z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm">Alerts</span>
                          {unreadNotifsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                              {unreadNotifsCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-muted-foreground hover:text-rose-400 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear all</span>
                        </button>
                      </div>

                      <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "p-3 rounded-xl border text-xs transition-all",
                                n.read
                                  ? "bg-muted/20 border-border/30"
                                  : "bg-primary/5 border-primary/15"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                                      notifColors[n.type]
                                    )}>
                                      {n.type}
                                    </span>
                                    <span className="font-bold text-foreground truncate">{n.title}</span>
                                  </div>
                                  <p className="text-muted-foreground leading-normal">{n.message}</p>
                                  <span className="text-[10px] text-muted-foreground/50 mt-1 block">{n.timestamp}</span>
                                </div>
                                {!n.read && (
                                  <button
                                    onClick={() => markNotificationAsRead(n.id)}
                                    className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center flex flex-col items-center space-y-2">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                              <Icons.CheckCircle2 className="h-7 w-7 text-emerald-500" />
                            </div>
                            <p className="font-bold text-sm text-foreground/80">All clear</p>
                            <p className="text-[11px] text-muted-foreground">No pending operational alerts.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className={cn(
                  "flex items-center space-x-2 h-9 pl-2 pr-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer",
                  profileDropdownOpen && "bg-accent/50"
                )}
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
              >
                <div className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0",
                  "bg-gradient-to-br", roleGradient
                )}>
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-bold text-foreground leading-none">{currentUser.name.split(" ")[0]}</span>
                  <span className="text-[9px] text-muted-foreground leading-none">{currentRole}</span>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card shadow-xl glass-panel z-50 overflow-hidden"
                    >
                      {/* Profile header */}
                      <div className={cn("px-4 py-3 bg-gradient-to-br", roleGradient, "bg-opacity-10 border-b border-border/50")}>
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0",
                            "bg-gradient-to-br", roleGradient
                          )}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-bold text-foreground truncate">{currentUser.name}</span>
                            <span className="block text-[10px] text-muted-foreground truncate">{currentUser.email}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="primary" className="text-[9px] py-0 px-2 font-bold">
                            {currentRole}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => { setProfileDropdownOpen(false); router.push("/settings"); }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings & Preferences</span>
                        </button>
                        <div className="my-1 h-px bg-border/50" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
