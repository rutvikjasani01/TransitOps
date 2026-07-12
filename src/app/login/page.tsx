"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Shield, Navigation, Key, Mail, Lock, UserCheck, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Switch, Label, Select } from "@/components/ui/FormElements";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { UserRole } from "@/types";

type ViewMode = "signIn" | "signUp" | "forgotPassword";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useTransitState();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("signIn");
  
  // Sign In states
  const [email, setEmail] = useState("manager@navix.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<UserRole>("Fleet Manager");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Sign Up states
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("Fleet Manager");
  
  // Forgot Password states
  const [resetEmail, setResetEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuickSelect = (selectedRole: UserRole, mockEmail: string) => {
    setRole(selectedRole);
    setEmail(mockEmail);
    setPassword("password123");
    setError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

    try {
      const success = await login(email, password, role);
      if (success) {
        toast(`Successfully logged in as ${role}!`, "success");
        if (role === "Safety Officer") {
          router.push("/drivers");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to log in to platform.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!signUpName.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }
    if (!signUpEmail || !signUpEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(signUpName, signUpEmail, signUpPassword, signUpRole);
      if (success) {
        toast(`Account registered successfully as ${signUpRole}!`, "success");
        if (signUpRole === "Safety Officer") {
          router.push("/drivers");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!resetEmail || !resetEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Simulate reset email
    setTimeout(() => {
      setIsLoading(false);
      toast(`Password reset instructions sent to ${resetEmail}!`, "success");
      setViewMode("signIn");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Brand Side (Left on Desktop) */}
        <div className="md:col-span-6 space-y-6 text-left hidden md:block pr-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary shrink-0 backdrop-blur-md">
              <Navigation className="h-8 w-8 fill-primary rotate-[45deg]" />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              NAVIX
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Smart Fleet Management Platform
            </h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Real-time fleet utilization, dynamic trip scheduling, safety scoring, fuel logs, and expense tracking in one unified interface.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl border border-slate-200/50 bg-white/70 dark:border-white/5 dark:bg-white/5 backdrop-blur-sm shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">99.8%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Fleet Uptime</span>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200/50 bg-white/70 dark:border-white/5 dark:bg-white/5 backdrop-blur-sm shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">2.4M+</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Miles Dispatched</span>
            </div>
          </div>
        </div>

        {/* Login Card Side (Right on Desktop) */}
        <div className="md:col-span-6 w-full max-w-md mx-auto">
          <Card className="glass-panel border-slate-200/80 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-slate-900/75">
            <CardHeader className="space-y-1 relative">
              <div className="flex items-center space-x-2 md:hidden mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                  <Navigation className="h-5 w-5 fill-primary rotate-[45deg]" />
                </div>
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">NAVIX</span>
              </div>
              
              <AnimatePresence mode="wait">
                {viewMode === "signIn" && (
                  <motion.div
                    key="signin-header"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
                      Enter your credentials or select a simulator role.
                    </CardDescription>
                  </motion.div>
                )}

                {viewMode === "signUp" && (
                  <motion.div
                    key="signup-header"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
                      Register to simulate fleet operations metrics.
                    </CardDescription>
                  </motion.div>
                )}

                {viewMode === "forgotPassword" && (
                  <motion.div
                    key="forgot-header"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
                      We will send recovery instructions to your email.
                    </CardDescription>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Error Banner */}
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive-foreground font-semibold flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-destructive shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* 1. SIGN IN VIEW */}
                {viewMode === "signIn" && (
                  <motion.div
                    key="signin-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@navix.com"
                            className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold">Password</Label>
                          <button
                            type="button"
                            onClick={() => setViewMode("forgotPassword")}
                            className="text-xs text-primary hover:underline cursor-pointer font-semibold"
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
                            className="pl-9 pr-10 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
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
                          className="border-slate-300 dark:border-white/20"
                        />
                        <div className="flex items-center space-x-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Role: {role}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-md py-6 rounded-xl font-bold transition-all transform hover:scale-[1.01]"
                        isLoading={isLoading}
                      >
                        Access Platform
                      </Button>
                    </form>

                    <div className="text-center pt-2">
                      <span className="text-xs text-slate-550 dark:text-slate-400 font-medium">Don't have an account? </span>
                      <button
                        onClick={() => setViewMode("signUp")}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-2 py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-white/5"></div>
                      </div>
                      <span className="relative px-3 text-xs uppercase bg-white dark:bg-slate-900 text-slate-500 font-bold tracking-wider rounded">
                        Simulator Quick Logins
                      </span>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickSelect("Fleet Manager", "manager@navix.com")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          role === "Fleet Manager"
                            ? "border-primary bg-primary/15 text-primary shadow-sm font-bold"
                            : "border-slate-200/60 bg-white/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        }`}
                      >
                        <span className="block font-bold">Fleet Manager</span>
                        <span className="text-[10px] opacity-70">Full Access</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect("Dispatcher", "driver@navix.com")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          role === "Dispatcher"
                            ? "border-primary bg-primary/15 text-primary shadow-sm font-bold"
                            : "border-slate-200/60 bg-white/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        }`}
                      >
                        <span className="block font-bold">Dispatcher</span>
                        <span className="text-[10px] opacity-70">Trips & Drivers</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect("Safety Officer", "safety@navix.com")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          role === "Safety Officer"
                            ? "border-primary bg-primary/15 text-primary shadow-sm font-bold"
                            : "border-slate-200/60 bg-white/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        }`}
                      >
                        <span className="block font-bold">Safety Officer</span>
                        <span className="text-[10px] opacity-70">Drivers & Audits</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect("Financial Analyst", "finance@navix.com")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          role === "Financial Analyst"
                            ? "border-primary bg-primary/15 text-primary shadow-sm font-bold"
                            : "border-slate-200/60 bg-white/60 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        }`}
                      >
                        <span className="block font-bold">Financial Analyst</span>
                        <span className="text-[10px] opacity-70">Expenses & Fuel</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. SIGN UP VIEW */}
                {viewMode === "signUp" && (
                  <motion.div
                    key="signup-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-name" className="text-slate-700 dark:text-slate-300 font-semibold">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-name"
                            type="text"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300 font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            placeholder="name@navix.com"
                            className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-pass" className="text-slate-700 dark:text-slate-300 font-semibold">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                              id="signup-pass"
                              type="password"
                              value={signUpPassword}
                              onChange={(e) => setSignUpPassword(e.target.value)}
                              className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="signup-confirm" className="text-slate-700 dark:text-slate-300 font-semibold">Confirm</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input
                              id="signup-confirm"
                              type="password"
                              value={signUpConfirmPassword}
                              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                              className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Simulator Role</Label>
                        <Select
                          value={signUpRole}
                          onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                          className="bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                        >
                          <option value="Fleet Manager">Fleet Manager</option>
                          <option value="Dispatcher">Dispatcher</option>
                          <option value="Safety Officer">Safety Officer</option>
                          <option value="Financial Analyst">Financial Analyst</option>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-md py-6 rounded-xl font-bold"
                        isLoading={isLoading}
                      >
                        Create Account
                      </Button>
                    </form>

                    <div className="text-center pt-4">
                      <button
                        onClick={() => setViewMode("signIn")}
                        className="text-xs text-slate-550 dark:text-slate-400 font-semibold hover:text-primary flex items-center justify-center mx-auto space-x-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 3. FORGOT PASSWORD VIEW */}
                {viewMode === "forgotPassword" && (
                  <motion.div
                    key="forgot-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="forgot-email" className="text-slate-700 dark:text-slate-300 font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            id="forgot-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="name@navix.com"
                            className="pl-9 bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-md py-6 rounded-xl font-bold"
                        isLoading={isLoading}
                      >
                        Send Reset Instructions
                      </Button>
                    </form>

                    <div className="text-center pt-4">
                      <button
                        onClick={() => setViewMode("signIn")}
                        className="text-xs text-slate-550 dark:text-slate-400 font-semibold hover:text-primary flex items-center justify-center mx-auto space-x-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
