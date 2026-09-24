"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// No repository payload or client data transformation. Refresh server-rendered
// content once per day, preserving the directory's local controls and theme.
export function DailyRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, 86_400_000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
