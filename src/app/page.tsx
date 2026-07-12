"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransitState } from "@/contexts/TransitStateContext";

export default function Home() {
  const router = useRouter();
  const { currentUser, currentRole } = useTransitState();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    } else {
      if (currentRole === "Safety Officer") {
        router.push("/drivers");
      } else {
        router.push("/dashboard");
      }
    }
  }, [currentUser, currentRole, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-slate-400 font-semibold">Redirecting to operations control...</p>
      </div>
    </div>
  );
}
