"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTopListener() {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Global button click handler: when a button is clicked, scroll page to top
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest("button");
      if (button) {
        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    document.addEventListener("click", handleButtonClick, { passive: true });
    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, []);

  return null;
}
