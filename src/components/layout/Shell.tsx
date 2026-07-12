"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { 
  Menu, Bell, Sun, Moon, LogOut, Settings, 
  ChevronLeft, ChevronRight, User, ShieldAlert,
  Search, Check, Trash2, Shield
} from "lucide-react";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ROLE_NAVIGATION } from "@/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import { useToast } from "@/contexts/ToastContext";

// Reusable NAVIX Premium Logo Component
export function NavixLogo({ 
  collapsed = false, 
  compact = false, 
  size = "md" 
}: { 
  collapsed?: boolean; 
  compact?: boolean; 
  size?: "sm" | "md" | "lg" 
}) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center space-x-2.5 shrink-0 select-none">
      <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 border border-primary/20 flex items-center justify-center">
        {/* Custom SVG logo representing a futuristic navigation compass and route paths */}
        <svg 
          viewBox="0 0 24 24" 
          className={iconSizes[size]} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polygon points="3 11 22 2 13 22 11 13 3 11" className="fill-primary/20" />
        </svg>
      </div>
      {!collapsed && !compact && (
        <span className={`font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-sans ${textSizes[size]}`}>
          NAVIX
        </span>
      )}
    </div>
  );
}

// Dynamically render Lucide Icon by name
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

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

  // Custom Splash Loader states
  const [showLoading, setShowLoading] = useState(false);
  const [loaderState, setLoaderState] = useState<"loading" | "transitioning" | "complete">("complete");
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing Fleet...");
  const [coords, setCoords] = useState({ x: 0, y: 0, scale: 1 });

  // Initial mount checks & session load detection
  useEffect(() => {
    setMounted(true);
    if (!currentUser) {
      router.push("/login");
    }

    const sessionLoaded = sessionStorage.getItem("navix_session_loaded");
    if (!sessionLoaded && currentUser) {
      setShowLoading(true);
      setLoaderState("loading");
    } else {
      setLoaderState("complete");
    }
  }, [currentUser, router]);

  // Handle route authorization
  useEffect(() => {
    if (!mounted || !currentUser) return;

    if (pathname === "/" || pathname === "/dashboard") {
      if (currentRole === "Safety Officer") {
        router.push("/drivers");
      } else {
        router.push("/dashboard");
      }
    }
  }, [pathname, currentRole, mounted, currentUser, router]);

  // Progress Bar filler loop
  useEffect(() => {
    if (loaderState !== "loading") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.4; // completes loading in ~2.1 seconds (100 / 1.4 * 30ms)
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoaderState("transitioning");
          }, 250);
          return 100;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [loaderState]);

  // Handle cycled loading text messages
  useEffect(() => {
    if (progress < 25) {
      setLoadingText("Initializing Fleet...");
    } else if (progress < 50) {
      setLoadingText("Connecting Vehicles...");
    } else if (progress < 75) {
      setLoadingText("Optimizing Routes...");
    } else {
      setLoadingText("Dashboard Ready...");
    }
  }, [progress]);

  // Coordinate Calculation & Logo flight triggers
  useEffect(() => {
    if (loaderState === "transitioning") {
      const isMobile = window.innerWidth < 768;
      const targetId = isMobile ? "navix-target-logo-mobile" : "navix-target-logo-desktop";
      
      const targetEl = document.getElementById(targetId);
      const sourceEl = document.getElementById("navix-source-logo");

      if (targetEl && sourceEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();

        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        setCoords({
          x: targetCenterX - sourceCenterX,
          y: targetCenterY - sourceCenterY,
          scale: targetRect.width / sourceRect.width,
        });
      }

      const timer = setTimeout(() => {
        setLoaderState("complete");
        setShowLoading(false);
        sessionStorage.setItem("navix_session_loaded", "true");
      }, 750); // transition runs in 600ms, hide loading screen at 750ms
      return () => clearTimeout(timer);
    }
  }, [loaderState]);

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access credentials...</p>
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

  // Extract breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(s => s);
    if (segments.length === 0) return [{ name: "NAVIX", path: "/" }];
    return segments.map((seg, idx) => {
      const path = `/${segments.slice(0, idx + 1).join("/")}`;
      const name = seg.charAt(0).toUpperCase() + seg.slice(1);
      return { name, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="relative min-h-screen">
      
      {/* 1. Splash Screen Overlay */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: loaderState === "transitioning" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden"
          >
            {/* Minimal Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F1F5F9] via-[#F8FAFC] to-white z-[-1]" />
            
            <div className="flex flex-col items-center max-w-sm w-full px-6 space-y-12">
              {/* Centered NAVIX Logo Source (visible only during progress bar phase) */}
              <div 
                id="navix-source-logo"
                className={`transition-opacity duration-300 ${loaderState === "transitioning" ? "opacity-0" : "opacity-100"}`}
              >
                <NavixLogo size="lg" />
              </div>

              {/* Progress Line & driving Truck Container */}
              <div className="w-full space-y-4">
                <div className="h-[2px] bg-[#E2E8F0] w-full relative rounded-full">
                  {/* Fills loading bar (0-100%) */}
                  <div 
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Truck icon coordinates mapped to fill width */}
                  <div 
                    className="absolute -top-4 -ml-3 transition-all duration-75"
                    style={{ left: `${progress}%` }}
                  >
                    <Icons.Truck className="h-5 w-5 text-[#2563EB]" />
                  </div>
                </div>

                {/* Loading Status Text & percent */}
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase h-4">
                    {loadingText}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Animated Logo (Flight Transition) */}
      <AnimatePresence>
        {loaderState === "transitioning" && (
          <motion.div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              zIndex: 100,
            }}
            animate={{
              x: `calc(-50% + ${coords.x}px)`,
              y: `calc(-50% + ${coords.y}px)`,
              scale: coords.scale,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1], // premium cubic ease-out curve
            }}
          >
            <NavixLogo size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Dashboard Shell Layout (Fades in during transition) */}
      <motion.div
        animate={{ opacity: loaderState === "loading" ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="min-h-screen flex bg-background/95"
      >
        
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden md:flex flex-col border-r border-border/40 bg-card/45 backdrop-blur-xl transition-all duration-300 relative z-20 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/40">
            {/* Target element for desktop flight animation */}
            <div 
              id="navix-target-logo-desktop" 
              className={`transition-opacity duration-300 ${loaderState === "complete" ? "opacity-100" : "opacity-0"}`}
            >
              <NavixLogo collapsed={sidebarCollapsed} />
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  }`}
                >
                  <DynamicIcon name={item.icon} className={`h-5 w-5 ${sidebarCollapsed ? "mx-auto" : "mr-3"}`} />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Toggle at Bottom */}
          <div className="p-4 border-t border-border/40">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-30 bg-black md:hidden"
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border p-5 flex flex-col md:hidden"
              >
                <div className="flex items-center justify-between pb-6 border-b border-border/50">
                  <NavixLogo />
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-accent cursor-pointer">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                </div>

                <nav className="flex-1 py-6 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          router.push(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <DynamicIcon name={item.icon} className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-border/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-card/25 backdrop-blur-xl relative z-10">
            
            {/* Left section: Hamburger & Breadcrumbs */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-accent/40 hover:text-foreground md:hidden cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Target element for mobile flight animation */}
              <div 
                id="navix-target-logo-mobile" 
                className={`md:hidden transition-opacity duration-300 ${loaderState === "complete" ? "opacity-100" : "opacity-0"}`}
              >
                <NavixLogo compact={true} />
              </div>

              {/* Breadcrumb path */}
              <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
                <span className="hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push("/")}>
                  NAVIX
                </span>
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={bc.path}>
                    <span>/</span>
                    <span
                      className={
                        idx === breadcrumbs.length - 1
                          ? "text-foreground font-semibold"
                          : "hover:text-foreground transition-colors cursor-pointer"
                      }
                      onClick={() => idx < breadcrumbs.length - 1 && router.push(bc.path)}
                    >
                      {bc.name}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Right section: Actions (Search, Theme, Alerts, User Profile) */}
            <div className="flex items-center space-x-3">
              {/* Mock Global Search */}
              <div className="relative hidden lg:block w-48 xl:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Global tracking lookup..."
                  className="pl-8 h-9 text-xs bg-muted/40"
                  id="global-search"
                  onChange={(e) => {
                    if (e.target.value.trim().length > 3) {
                      toast(`Simulated Search for: ${e.target.value}`, "info");
                    }
                  }}
                />
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-accent/40 cursor-pointer"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 rounded-lg hover:bg-accent/40 relative cursor-pointer ${
                    notifDropdownOpen ? "bg-accent/40" : ""
                  }`}
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-3 shadow-lg glass-panel z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                          <span className="font-bold text-sm">System Alerts</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-muted-foreground hover:text-destructive flex items-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Clear</span>
                            </button>
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-2.5 rounded-lg border text-xs transition-colors flex items-start ${
                                  n.read
                                    ? "bg-muted/10 border-border/30"
                                    : "bg-primary/5 border-primary/20"
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center justify-between font-bold">
                                    <span className={n.type === "warning" ? "text-warning" : "text-foreground"}>
                                      {n.title}
                                    </span>
                                    {!n.read && (
                                      <button
                                        onClick={() => markNotificationAsRead(n.id)}
                                        className="text-[10px] text-primary hover:underline flex items-center space-x-0.5 cursor-pointer"
                                      >
                                        <Check className="h-3 w-3" />
                                        <span>Mark Read</span>
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground mt-1 leading-normal">{n.message}</p>
                                  <span className="text-[10px] text-muted-foreground/60 block mt-1">{n.timestamp}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-muted-foreground flex flex-col items-center space-y-1">
                              <Icons.CheckCircle2 className="h-8 w-8 text-success/50" />
                              <p className="font-semibold text-xs text-foreground/80">All clear</p>
                              <p className="text-[10px]">No pending operational alerts.</p>
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
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 h-9 py-1 px-2.5 rounded-lg hover:bg-accent/40 cursor-pointer"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                >
                  <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0 text-[10px] font-bold text-primary">
                    {currentUser.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-bold text-foreground leading-none">{currentUser.name}</span>
                    <span className="text-[9px] text-muted-foreground leading-none">{currentRole}</span>
                  </div>
                </Button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg glass-panel z-50"
                      >
                        <div className="px-3 py-2 border-b border-border/50 mb-1">
                          <span className="block text-xs font-bold text-foreground">{currentUser.name}</span>
                          <span className="block text-[10px] text-muted-foreground truncate">{currentUser.email}</span>
                          <div className="mt-1.5">
                            <Badge variant="primary" className="text-[9px] py-0 px-1.5">
                              {currentRole}
                            </Badge>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            router.push("/settings");
                          }}
                          className="w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </header>

          {/* Dynamic Route Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </motion.div>
    </div>
  );
}
