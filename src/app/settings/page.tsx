"use client";

import React, { useState } from "react";
import { 
  Settings, User, ShieldCheck, Globe, Bell, 
  Save, Eye, EyeOff, Key, Sparkles
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Switch } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  const { currentUser, currentRole } = useTransitState();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Profile forms state
  const [profileName, setProfileName] = useState(currentUser?.name || "Administrator");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "admin@navix.com");

  // Password state
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Localization state
  const [lang, setLang] = useState("EN");

  // Notifications toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintAlerts, setMaintAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Simulated Profile Changes saved successfully!", "success");
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      toast("Please enter your current password.", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }

    toast("Password updated successfully!", "success");
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
            <Settings className="h-8 w-8 text-primary shrink-0" />
            <span>Platform Configurations</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage user profiles, password controls, local languages, and alert thresholds.
          </p>
        </div>

        {/* Configurations Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Settings & Security */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* PROFILE DETAILS CARD */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Security File Details</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">Manage credentials details and user access parameters.</CardDescription>
                  </div>
                  <Badge variant="primary" className="text-[10px] uppercase font-bold py-0.5 px-2">
                    {currentRole}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="s-name">Display Name</Label>
                      <Input
                        id="s-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="s-email">Email Address</Label>
                      <Input
                        id="s-email"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="john@navix.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" type="submit" className="text-xs gap-1.5 py-4 px-4 font-bold">
                      <Save className="h-4 w-4" /> Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* PASSWORD SECURITY CARD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Password Authentication</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Edit password parameters. Minimum length is 6 characters.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePassword} className="space-y-4">
                  
                  <div className="space-y-1">
                    <Label htmlFor="s-curr">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="s-curr"
                        type={showPass ? "text" : "password"}
                        value={currPassword}
                        onChange={(e) => setCurrPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="s-new">New Password</Label>
                      <Input
                        id="s-new"
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="s-conf">Confirm New Password</Label>
                      <Input
                        id="s-conf"
                        type={showPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="outline" type="submit" className="text-xs gap-1.5 py-4 px-4 font-bold border-white/10 text-slate-300">
                      <Key className="h-4 w-4 text-primary" /> Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Preferences, Languages, Alerts settings */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* LOCALIZATION SETTINGS CARD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Regional Options</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Control layout languages and display modes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Language selection dropdown placeholder */}
                <div className="space-y-1">
                  <Label htmlFor="s-lang">Language Preference</Label>
                  <Select
                    id="s-lang"
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      toast(`Language layout switched to: ${e.target.value}`, "info");
                    }}
                  >
                    <option value="EN">English (US)</option>
                    <option value="ES">Español (ES)</option>
                    <option value="DE">Deutsch (DE)</option>
                    <option value="FR">Français (FR)</option>
                  </Select>
                </div>

                {/* Theme Selection */}
                <div className="space-y-2.5">
                  <Label>Platform Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => theme === "light" && toggleTheme()}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-center cursor-pointer transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-foreground"
                      }`}
                    >
                      Dark Mode
                    </button>
                    <button
                      onClick={() => theme === "dark" && toggleTheme()}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-center cursor-pointer transition-all ${
                        theme === "light"
                          ? "border-primary bg-primary/10 text-slate-950"
                          : "border-white/5 bg-slate-900/60 text-slate-400 hover:text-foreground"
                      }`}
                    >
                      Light Mode
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* NOTIFICATION SETTINGS CARD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">System Alert Controls</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Select what notifications you receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">System Notifications</span>
                    <span className="text-[10px] text-muted-foreground block">Receive logs for dispatches.</span>
                  </div>
                  <Switch
                    id="n-email"
                    checked={emailAlerts}
                    onChange={(e: any) => setEmailAlerts(e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">Maintenance Alerts</span>
                    <span className="text-[10px] text-muted-foreground block">Warn when vehicles enter workshop status.</span>
                  </div>
                  <Switch
                    id="n-maint"
                    checked={maintAlerts}
                    onChange={(e: any) => setMaintAlerts(e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-foreground">Compliance Alerts</span>
                    <span className="text-[10px] text-muted-foreground block">Warn when CDL expiries occur.</span>
                  </div>
                  <Switch
                    id="n-exp"
                    checked={expiryAlerts}
                    onChange={(e: any) => setExpiryAlerts(e.target.checked)}
                  />
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </Shell>
  );
}
