"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, ShieldCheck, FileText, Clock, RefreshCw, 
  Send, History, LogOut, Lock, GraduationCap, 
  Home, HelpCircle, User
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) + " | " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "scrutiny_officer";

  const adminNav = [
    { name: "Executive Overview", href: "/admin/dashboard", icon: FileText },
    { name: "Master FDR Repository", href: "/admin/repository", icon: Building2 },
    { name: "Document Scrutiny Bureau", href: "/admin/scrutiny", icon: ShieldCheck },
    { name: "Deposit Clearances", href: "/admin/releases", icon: Send },
    { name: "Audit Ledger", href: "/admin/audit", icon: History },
  ];

  const instNav = [
    { name: "Compliance Overview", href: "/institution/dashboard", icon: FileText },
    { name: "Upload & Edit FDR", href: "/institution/submit-fdr", icon: ShieldCheck },
    { name: "Pledged Instruments", href: "/institution/my-fdrs", icon: Building2 },
    { name: "Renewal & Replacement", href: "/institution/renewals", icon: RefreshCw },
    { name: "Release Application", href: "/institution/release-request", icon: Send },
  ];

  const currentNav = isAdmin ? adminNav : instNav;

  const handleSignOut = () => {
    logout();
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/login");
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If user is not signed in, do not render the navbar
  if (!user) {
    return null;
  }

  const homeHref = isAdmin ? "/admin/dashboard" : "/institution/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs border-b border-slate-300">
      
      {/* 0. NATIONAL TRICOLOR TOP STRIP (Flag of India) */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white border-y border-slate-200" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* 1. CLEAN OFFICIAL GOVERNMENT UTILITY BAR */}
      <div className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Government of India Bilingual Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <span className="w-3.5 h-2.5 inline-flex flex-col border border-slate-300">
                <span className="h-1/3 bg-[#FF9933] w-full" />
                <span className="h-1/3 bg-white w-full" />
                <span className="h-1/3 bg-[#138808] w-full" />
              </span>
              <span>भारत सरकार</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-800">Government of India</span>
            </div>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-600 font-semibold text-xs">
              शिक्षा मंत्रालय (Ministry of Education)
            </span>
          </div>

          {/* Right: Date, Time & Clean User Status / Sign Out */}
          <div className="flex items-center gap-3 text-xs">
            
            {/* Live IST Clock */}
            <span className="hidden sm:inline text-slate-600 font-mono font-medium text-xs">
              {currentTime}
            </span>

            {/* Authenticated User Status & Direct Sign Out */}
            <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                isAdmin 
                  ? "bg-blue-50 text-blue-900 border-blue-200" 
                  : "bg-emerald-50 text-emerald-900 border-emerald-200"
              }`}>
                {isAdmin ? "COUNCIL ADMIN" : "INSTITUTION"}
              </span>

              <span className="text-slate-900 font-bold truncate max-w-[140px] sm:max-w-[200px]" title={user.user_name}>
                {user.user_name}
              </span>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 font-bold text-rose-800 text-[11px] shadow-2xs transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3 text-rose-700" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. OFFICIAL AUTHORITY BRANDING (National Emblem, AICTE Seal & Central Portal Title) */}
      <div className="bg-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* State Emblem of India + AICTE Seal + Bilingual Titles */}
          <Link 
            href={homeHref}
            onClick={handleNavClick}
            className="flex items-center gap-3.5 group select-none"
            title="Portal Gateway"
          >
            {/* National Emblem of India */}
            <div className="w-11 h-15 flex items-center justify-center shrink-0">
              <img 
                src="/emblem.png" 
                alt="State Emblem of India" 
                className="h-14 w-auto object-contain filter drop-shadow-xs" 
              />
            </div>

            <div className="h-11 w-[1.5px] bg-slate-300 hidden sm:block" />

            {/* AICTE Seal SVG */}
            <div className="w-13 h-13 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#0c2340]" aria-label="AICTE Seal">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#0c2340" strokeWidth="4" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="#0c2340" strokeWidth="2" />
                <circle cx="50" cy="14" r="14" fill="#0c2340" />
                <path d="M47 38 L53 38 L53 62 L47 62 Z" fill="#ffffff" />
                <circle cx="50" cy="35" r="4" fill="#d97706" />
              </svg>
            </div>

            <div>
              <div className="text-[13px] font-bold text-[#b45309] leading-tight">
                अखिल भारतीय तकनीकी शिक्षा परिषद
              </div>
              <div className="text-base sm:text-lg font-black text-[#0c2340] tracking-tight uppercase font-serif leading-snug group-hover:text-blue-900 transition-colors">
                All India Council for Technical Education
              </div>
              <div className="text-[11px] text-slate-600 font-semibold leading-tight">
                (A Statutory Body Under Ministry of Education, Government of India)
              </div>
            </div>
          </Link>

          {/* Portal Title & Active Status */}
          <div className="flex items-center gap-4">
            
            <Link 
              href={homeHref}
              onClick={handleNavClick}
              className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-amber-600 pl-3 md:pl-0 md:pr-4 block"
            >
              <div className="text-[11px] font-black uppercase text-[#b45309] tracking-wider">
                केन्द्रीय सावधि जमा रसीद एवं संयुक्त ग्रहणाधिकार पोर्टल
              </div>
              <div className="text-lg font-black tracking-tight text-[#0c2340] flex items-center md:justify-end gap-1.5">
                <span>AICTE FDR-GUARD</span>
                <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded shadow-2xs">
                  APH 2026-27
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                National Security Deposit Verification &amp; Oversight Gateway
              </div>
            </Link>

            {/* User Desk Identity */}
            {user && (
              <div className="hidden sm:block p-2 rounded-lg bg-slate-50 border border-slate-300 text-right min-w-[170px]">
                <div className="text-[10px] font-bold text-blue-900 flex items-center justify-end gap-1">
                  <Lock className="w-3 h-3 text-emerald-700" />
                  <span>{isAdmin ? "COUNCIL DIRECTORATE" : "INSTITUTION PORTAL"}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[190px]">
                  {user?.institution_name || user?.user_name}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  {user?.aicte_id || (isAdmin ? "AICTE-HQ-NEW-DELHI" : "ID: 1-10294821")}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 3. GOVERNMENT NAVIGATION BAR (Deep Navy Blue #0c2340 with Amber Accent) */}
      <nav className="bg-[#0c2340] border-b-2 border-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Nav Menu Links */}
            <div className="flex items-center overflow-x-auto scrollbar-none gap-1 py-0.5">
              
              {/* Navigation buttons for authenticated user */}
              {currentNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold tracking-wide transition-all whitespace-nowrap border-b-2 ${
                      active
                        ? "bg-[#163a66] text-amber-300 border-amber-400"
                        : "text-slate-200 hover:text-white hover:bg-[#122e54] border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-amber-400" : "text-slate-300"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

            </div>

            {/* Helpline */}
            <div className="hidden lg:flex items-center gap-3 text-xs pl-4 border-l border-slate-700 shrink-0 text-slate-300">
              <span className="flex items-center gap-1 text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Toll-Free Helpline:</span>
                <strong className="text-white font-mono font-bold">1800-11-2958 / 011-29581000</strong>
              </span>
            </div>

          </div>
        </div>
      </nav>

    </header>
  );
};
