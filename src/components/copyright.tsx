"use client";

import { useEffect, useState } from "react";

export function Copyright() {
  // Match the server HTML before reading the visitor's local calendar.
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      const now = new Date();
      setYear(now.getFullYear());
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(update, midnight.getTime() - now.getTime());
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <p>© {year} shez.app. Crafted by Mohamed Shez, powered by AI.</p>;
}
