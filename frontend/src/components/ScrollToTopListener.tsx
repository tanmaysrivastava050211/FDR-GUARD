"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTopListener() {
  const pathname = usePathname();

  // Scroll to top only on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
