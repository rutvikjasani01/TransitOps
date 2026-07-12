"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Shield,
  Truck,
  Mail,
  Lock,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Switch, Label } from "@/components/ui/FormElements";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { UserRole } from "@/types";

const ROLES: { role: UserRole; email: string; label: string; desc: string }[] = [
  { role: "Fleet Manager", email: "manager@transitops.com", label: "Fleet Manager", desc: "Full Access" },
  { role: "Dispatcher", email: "dispatch@transitops.com", label: "Dispatcher", desc: "Trips & Drivers" },
  { role: "Safety Officer", email: "safety@transitops.com", label: "Safety Officer", desc: "Drivers & Audits" },
  { role: "Financial Analyst", email: "finance@transitops.com", label: "Financial Analyst", desc: "Expenses & Fuel" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useTransitState();
  const { toast } = useToast();

  const [email, setEmail] = useState("manager@navix.com");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState<UserRole>("Fleet Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickSelect = (selectedRole: UserRole, mockEmail: string) => {
    setRole(selectedRole);
    setEmail(mockEmail);
    setPassword("password123");
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }

      login(email, role);
      toast(`Successfully logged in as ${role}!`, "success");

      if (role === "Safety Officer") {
        router.push("/drivers");
      } else {
        router.push("/dashboard");
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden hud-grid-bg">
      {/* Ambient glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Brand Side */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="md:col-span-6 space-y-6 text-left hidden md:block pr-6"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md glow-primary">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <span className="text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
              NAVIX
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
              Smart Transport Operations Platform
            </h1>
            <p className="text-slate-400 leading-relaxed text-base max-w-md">
              Real-time fleet utilization, dynamic trip scheduling, safety scoring, fuel logs, and expense tracking in one unified interface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { value: "99.8%", label: "Fleet Uptime" },
              { value: "2.4M+", label: "Miles Dispatched" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm hover:border-primary/20 transition-colors"
              >
                <span className="block text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="md:col-span-6 w-full max-w-md mx-auto"
        >
          <Card className="glass-panel border-white/10 shadow-2xl hud-glow-primary">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2 md:hidden mb-4 text-primary">
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-6 w-6" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 22 11 13 3 11" className="fill-primary/20" />
                </svg>
                <span className="font-bold text-xl tracking-tight text-[#0F172A] dark:text-white">NAVIX</span>
              </div>
              <CardTitle className="text-2xl font-bold text-[#0F172A] dark:text-white">Sign In</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Enter your credentials or select a simulator role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-semibold flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4 text-destructive shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@transitops.com"
                      className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder-slate-500 focus-visible:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                    <button
                      type="button"
                      onClick={() => toast("Mock Password reset email initiated!", "info")}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 bg-slate-900/60 border-white/10 text-white placeholder-slate-500 focus-visible:border-primary/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <Switch
                    id="remember"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                    className="border-white/20"
                  />
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Role: {role}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-lg shadow-primary/20 py-6 rounded-lg font-semibold gap-2"
                  isLoading={isLoading}
                >
                  Access Platform
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="relative flex items-center justify-center my-4 py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <span className="relative px-3 text-xs uppercase bg-slate-950/80 text-slate-500 font-medium tracking-wider">
                  Simulator Quick Logins
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ role: r, email: e, label, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickSelect(r, e)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      role === r
                        ? "border-primary bg-primary/10 text-white shadow-sm shadow-primary/10"
                        : "border-white/5 bg-white/[0.03] text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/10"
                    }`}
                  >
                    <span className="block font-bold">{label}</span>
                    <span className="text-[10px] opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
