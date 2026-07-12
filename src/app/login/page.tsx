"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Truck, Key, Mail, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Switch, Label } from "@/components/ui/FormElements";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { UserRole } from "@/types";

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

    // Simulate Network Request Delay
    setTimeout(() => {
      // Validation
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

      // Perform context login
      login(email, role);
      toast(`Successfully logged in as ${role}!`, "success");
      
      // Dynamic Role Redirect
      if (role === "Safety Officer") {
        router.push("/drivers");
      } else {
        router.push("/dashboard");
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Brand Side (Left on Desktop) */}
        <div className="md:col-span-6 space-y-6 text-left hidden md:block pr-6">
          <div className="flex items-center space-x-3 text-primary">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              TransitOps
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Smart Transport Operations Platform
            </h1>
            <p className="text-slate-400 leading-relaxed">
              Real-time fleet utilization, dynamic trip scheduling, safety scoring, fuel logs, and expense tracking in one unified interface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <span className="block text-2xl font-bold text-white">99.8%</span>
              <span className="text-xs text-slate-400">Fleet Uptime</span>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <span className="block text-2xl font-bold text-white">2.4M+</span>
              <span className="text-xs text-slate-400">Miles Dispatched</span>
            </div>
          </div>
        </div>

        {/* Login Card Side (Right on Desktop) */}
        <div className="md:col-span-6 w-full max-w-md mx-auto">
          <Card className="glass-panel border-white/10 shadow-2xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2 md:hidden mb-4 text-primary">
                <Truck className="h-6 w-6" />
                <span className="font-bold text-xl tracking-tight text-white">TransitOps</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials or select a simulator role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive-foreground font-semibold flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-destructive shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@transitops.com"
                      className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <button
                      type="button"
                      onClick={() => toast("Mock Password reset email initiated!", "info")}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 bg-slate-900/60 border-white/10 text-white placeholder-slate-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white cursor-pointer"
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
                    onChange={(e: any) => setRememberMe(e.target.checked)}
                    className="border-white/20"
                  />
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Role: {role}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-500 text-white shadow-md py-6 rounded-lg font-semibold"
                  isLoading={isLoading}
                >
                  Access Platform
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4 py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-3 text-xs uppercase bg-slate-950 text-slate-500 font-medium">
                  Simulator Quick Logins
                </span>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelect("Fleet Manager", "manager@transitops.com")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    role === "Fleet Manager"
                      ? "border-primary bg-primary/10 text-white shadow-sm"
                      : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-bold">Fleet Manager</span>
                  <span className="text-[10px] opacity-70">Full Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("Dispatcher", "dispatch@transitops.com")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    role === "Dispatcher"
                      ? "border-primary bg-primary/10 text-white shadow-sm"
                      : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-bold">Dispatcher</span>
                  <span className="text-[10px] opacity-70">Trips & Drivers</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("Safety Officer", "safety@transitops.com")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    role === "Safety Officer"
                      ? "border-primary bg-primary/10 text-white shadow-sm"
                      : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-bold">Safety Officer</span>
                  <span className="text-[10px] opacity-70">Drivers & Audits</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("Financial Analyst", "finance@transitops.com")}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    role === "Financial Analyst"
                      ? "border-primary bg-primary/10 text-white shadow-sm"
                      : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="block font-bold">Financial Analyst</span>
                  <span className="text-[10px] opacity-70">Expenses & Fuel</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
