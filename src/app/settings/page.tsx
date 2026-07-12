"use client";

import React, { useState } from "react";
import { Settings, Save, Eye, EyeOff, Key, Sun, Moon, Bell, Shield, Globe } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Switch } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { currentUser, currentRole } = useTransitState();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [profileName, setProfileName] = useState(currentUser?.name || "Administrator");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "admin@transitops.com");
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [lang, setLang] = useState("EN");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintAlerts, setMaintAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Profile changes saved successfully!", "success");
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) { toast("Please enter your current password.", "error"); return; }
    if (newPassword.length < 6) { toast("New password must be at least 6 characters.", "error"); return; }
    if (newPassword !== confirmPassword) { toast("Passwords do not match.", "error"); return; }
    toast("Password updated successfully!", "success");
    setCurrPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const roleGradients: Record<string, string> = {
    "Fleet Manager": "from-blue-500 to-indigo-600",
    "Dispatcher": "from-amber-400 to-orange-500",
    "Safety Officer": "from-emerald-500 to-teal-500",
    "Financial Analyst": "from-purple-500 to-violet-600",
  };
  const gradient = roleGradients[currentRole] || "from-blue-500 to-indigo-600";
  const initials = currentUser?.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "U";

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Platform Configurations</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[52px]">Manage user profiles, security, localization, and alert controls.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-5">

            {/* Profile card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 bg-gradient-to-br", gradient)}>
                      {initials}
                    </div>
                    <div>
                      <CardTitle className="text-sm">Profile Details</CardTitle>
                      <CardDescription className="text-xs mt-0.5">Manage credentials and user access.</CardDescription>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-[9px] font-bold shrink-0">{currentRole}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-name">Display Name</Label>
                      <Input id="s-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-email">Email Address</Label>
                      <Input id="s-email" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} placeholder="john@transitops.com" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="primary" type="submit" size="sm" className="gap-2">
                      <Save className="h-3.5 w-3.5" /> Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <Shield className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Password Authentication</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Minimum 6 characters required.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-curr">Current Password</Label>
                    <div className="relative">
                      <Input id="s-curr" type={showPass ? "text" : "password"} value={currPassword} onChange={(e) => setCurrPassword(e.target.value)} placeholder="••••••••" className="pr-11" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="s-new">New Password</Label>
                      <Input id="s-new" type={showPass ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="s-conf">Confirm Password</Label>
                      <Input id="s-conf" type={showPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" type="submit" size="sm" className="gap-2">
                      <Key className="h-3.5 w-3.5 text-primary" /> Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-5">

            {/* Regional settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Globe className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Regional Options</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Language and display mode.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-lang">Language</Label>
                  <Select id="s-lang" value={lang} onChange={(e) => { setLang(e.target.value); toast(`Language switched to: ${e.target.value}`, "info"); }}>
                    <option value="EN">English (US)</option>
                    <option value="ES">Español (ES)</option>
                    <option value="DE">Deutsch (DE)</option>
                    <option value="FR">Français (FR)</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Platform Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Dark Mode", icon: Moon, active: theme === "dark", action: () => theme === "light" && toggleTheme() },
                      { label: "Light Mode", icon: Sun, active: theme === "light", action: () => theme === "dark" && toggleTheme() },
                    ].map(({ label, icon: Icon, active, action }) => (
                      <button key={label} onClick={action} className={cn(
                        "py-2.5 px-3 text-xs font-semibold rounded-xl border text-center cursor-pointer transition-all flex items-center justify-center gap-1.5",
                        active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                      )}>
                        <Icon className="h-3.5 w-3.5" />{label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Bell className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Alert Controls</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Choose which alerts you receive.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "n-email", label: "System Notifications", desc: "Logs for dispatches and actions", checked: emailAlerts, onChange: (v: boolean) => setEmailAlerts(v) },
                  { id: "n-maint", label: "Maintenance Alerts", desc: "Warn when vehicles enter shop", checked: maintAlerts, onChange: (v: boolean) => setMaintAlerts(v) },
                  { id: "n-exp", label: "Compliance Alerts", desc: "CDL expiry warnings", checked: expiryAlerts, onChange: (v: boolean) => setExpiryAlerts(v) },
                ].map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <span className="block text-xs font-semibold">{s.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{s.desc}</span>
                    </div>
                    <Switch id={s.id} checked={s.checked} onChange={(e: any) => s.onChange(e.target.checked)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
