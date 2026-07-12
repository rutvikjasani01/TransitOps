"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Truck, Mail, Lock, UserCheck, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Switch, Label } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const roleConfig: Record<UserRole, { icon: string; desc: string; color: string; bg: string }> = {
  "Fleet Manager": {
    icon: "🚛",
    desc: "Full fleet access",
    color: "border-blue-500/40 bg-blue-500/8 hover:border-blue-500/60",
    bg: "from-blue-500 to-indigo-600",
  },
  "Dispatcher": {
    icon: "📡",
    desc: "Trips & Drivers",
    color: "border-amber-500/40 bg-amber-500/8 hover:border-amber-500/60",
    bg: "from-amber-400 to-orange-500",
  },
  "Safety Officer": {
    icon: "🛡️",
    desc: "Compliance audits",
    color: "border-emerald-500/40 bg-emerald-500/8 hover:border-emerald-500/60",
    bg: "from-emerald-500 to-teal-500",
  },
  "Financial Analyst": {
    icon: "💰",
    desc: "Expenses & Fuel",
    color: "border-purple-500/40 bg-purple-500/8 hover:border-purple-500/60",
    bg: "from-purple-500 to-violet-600",
  },
};

const roleEmails: Record<UserRole, string> = {
  "Fleet Manager": "manager@transitops.com",
  "Dispatcher": "dispatch@transitops.com",
  "Safety Officer": "safety@transitops.com",
  "Financial Analyst": "finance@transitops.com",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useTransitState();
  const { toast } = useToast();

  const [email, setEmail] = useState("manager@transitops.com");
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

      if (role === "Safety Officer") router.push("/drivers");
      else router.push("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  const currentRoleConfig = roleConfig[role];

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Ambient blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[65%] h-[65%] rounded-full bg-blue-600/12 blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-[20%] -right-[10%] w-[65%] h-[65%] rounded-full bg-indigo-600/12 blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-violet-500/8 blur-[120px] pointer-events-none"
      />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-10 items-center z-10">

        {/* Brand Side */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 space-y-8 hidden md:block pr-4"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/25">
                <Truck className="h-7 w-7 text-blue-400" />
              </div>
              <span className="text-3xl font-black tracking-tight gradient-text">TransitOps</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
                Smart Transport<br />
                <span className="gradient-text">Operations Platform</span>
              </h1>
              <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                Real-time fleet utilization, dynamic trip scheduling, safety scoring, fuel logs, and expense tracking in one unified interface.
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Fleet Uptime", value: "99.8%", color: "text-emerald-400", icon: "⚡" },
              { label: "Miles Dispatched", value: "2.4M+", color: "text-blue-400", icon: "🛣️" },
              { label: "Active Drivers", value: "1,200+", color: "text-amber-400", icon: "👷" },
              { label: "Cost Saved", value: "$480K", color: "text-purple-400", icon: "💰" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl border border-white/6 bg-white/4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{stat.icon}</span>
                  <span className={cn("text-xl font-black", stat.color)}>{stat.value}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-2">
            {[
              "Role-based access control with 4 operator levels",
              "Live vehicle tracking and cargo weight enforcement",
              "Automated compliance alerts & license monitoring",
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2.5 text-xs text-slate-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shrink-0" />
                {feat}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="md:col-span-6 w-full max-w-md mx-auto"
        >
          <div className="rounded-3xl border border-white/8 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Card top bar */}
            <div className={cn(
              "h-1 w-full bg-gradient-to-r",
              currentRoleConfig.bg
            )} />

            <div className="p-7 space-y-6">
              {/* Mobile logo */}
              <div className="flex items-center space-x-2 md:hidden">
                <Truck className="h-6 w-6 text-blue-400" />
                <span className="font-black text-xl gradient-text">TransitOps</span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white mb-1">Sign In</h2>
                <p className="text-sm text-slate-400">Select your role and access the platform.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 font-semibold flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-slate-400">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@transitops.com"
                      className="pl-10 bg-slate-800/60 border-white/8 text-white placeholder-slate-600 rounded-xl focus:border-blue-500/60"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400">Password</Label>
                    <button
                      type="button"
                      onClick={() => toast("Mock Password reset email initiated!", "info")}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-11 bg-slate-800/60 border-white/8 text-white placeholder-slate-600 rounded-xl focus:border-blue-500/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me + role indicator */}
                <div className="flex items-center justify-between py-0.5">
                  <Switch
                    id="remember"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e: any) => setRememberMe(e.target.checked)}
                    className="border-white/20"
                  />
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                    "bg-blue-500/10 text-blue-300 border-blue-500/20"
                  )}>
                    <UserCheck className="h-3 w-3" />
                    {role}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 font-bold text-sm rounded-xl gap-2",
                    "bg-gradient-to-r", currentRoleConfig.bg,
                    "hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-shadow"
                  )}
                  isLoading={isLoading}
                >
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                  Access Platform
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/6" />
                <span className="px-3 text-[10px] uppercase font-bold text-slate-600 tracking-widest bg-slate-900/80">
                  Quick Role Select
                </span>
                <div className="flex-1 border-t border-white/6" />
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleConfig) as UserRole[]).map((r) => {
                  const cfg = roleConfig[r];
                  const isSelected = role === r;
                  return (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleQuickSelect(r, roleEmails[r])}
                      className={cn(
                        "p-3 rounded-xl border text-left text-xs transition-all cursor-pointer",
                        isSelected
                          ? cn("border-blue-500/50 bg-blue-500/12 shadow-[0_0_16px_rgba(59,130,246,0.15)]")
                          : cn("border-white/6 bg-white/3 hover:bg-white/6", cfg.color)
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-base">{cfg.icon}</span>
                        <span className="font-bold text-white">{r.split(" ")[0]}</span>
                        {r.split(" ")[1] && (
                          <span className="font-bold text-white">{r.split(" ")[1]}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{cfg.desc}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
