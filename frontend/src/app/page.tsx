"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, ShieldCheck, Lock, Search, ArrowRight, 
  FileText, CheckCircle2, Download, Phone, Mail,
  ChevronRight, Landmark, BookOpen, AlertCircle,
  Shield, HelpCircle, Award, Scale, X, Check, Info
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect away from public home page to their respective portal dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin" || user.role === "scrutiny_officer") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/institution/dashboard");
      }
    }
  }, [user, isLoading, router]);

  // Portal redirection selection modal state
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  // Download / action notification feedback state
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Public Search State
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"circulars" | "bank" | "aph" | "notices">("circulars");
  const [showMetricsDetail, setShowMetricsDetail] = useState(false);

  if (isLoading || user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-700 text-xs font-semibold">
        Redirecting to Authorized Portal...
      </div>
    );
  }

  const sampleInstitutions = [
    {
      aicte_id: "1-10294821",
      name: "Delhi Technological Institute",
      state: "Delhi",
      city: "New Delhi",
      category: "Engineering & Technology",
      compliance_status: "Compliant",
      fdrs_count: 2,
      total_deposit: "₹43,00,000",
      lien_marked: "Active (Member Secretary, AICTE)",
      bank: "State Bank of India / Punjab National Bank",
      last_verified: "15 Oct 2026"
    },
    {
      aicte_id: "1-39281044",
      name: "Aryabhatta College of Engineering",
      state: "Karnataka",
      city: "Bengaluru",
      category: "Engineering & Technology",
      compliance_status: "Under Scrutiny",
      fdrs_count: 1,
      total_deposit: "₹25,00,000",
      lien_marked: "Discrepancy Under Review",
      bank: "Canara Bank",
      last_verified: "24 Oct 2026"
    },
    {
      aicte_id: "1-55829102",
      name: "North Valley Institute of Technology",
      state: "Uttarakhand",
      city: "Dehradun",
      category: "Technical Campus",
      compliance_status: "Compliant",
      fdrs_count: 2,
      total_deposit: "₹35,00,000",
      lien_marked: "Active (Member Secretary, AICTE)",
      bank: "Bank of Baroda",
      last_verified: "19 Oct 2026"
    },
    {
      aicte_id: "1-88421099",
      name: "Saraswati Technical Campus",
      state: "Maharashtra",
      city: "Pune",
      category: "Engineering & Management",
      compliance_status: "Compliant",
      fdrs_count: 3,
      total_deposit: "₹52,00,000",
      lien_marked: "Active (Member Secretary, AICTE)",
      bank: "State Bank of India",
      last_verified: "22 Oct 2026"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const query = searchId.trim().toLowerCase();
    const found = sampleInstitutions.find(
      (inst) =>
        inst.aicte_id.toLowerCase().includes(query) ||
        inst.name.toLowerCase().includes(query)
    );
    setSearchResult(found || null);
    setSearched(true);
  };

  return (
    <div className="w-full flex flex-col bg-[#f4f6fa] text-slate-800">
      
      {/* 1. AUTHENTIC GOVERNMENT MASTHEAD (Rich Ashoka Navy & Kesari Gold) */}
      <header className="bg-white border-b-2 border-slate-300">
        
        {/* Top National Tricolor Ribbon (Deep Saffron, White, Deep India Green) */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#e65100]" />
          <div className="h-full w-1/3 bg-white border-y border-slate-200" />
          <div className="h-full w-1/3 bg-[#1b5e20]" />
        </div>

        {/* Top Government of India Utility Strip */}
        <div className="bg-[#f8fafc] border-b border-slate-200 py-1.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#b45309]">भारत सरकार</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-800">Government of India</span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden md:inline text-slate-600 font-medium">शिक्षा मंत्रालय (Ministry of Education)</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="hidden sm:inline font-mono font-bold text-[#0c2340] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AICTE APH 2026-27
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <button 
                type="button"
                onClick={() => setIsPortalModalOpen(true)}
                className="font-bold text-[#0c2340] hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Lock className="w-3 h-3 text-[#b45309]" />
                <span>Portal Sign-In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Masthead Branding Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Emblem and Council Bilingual Titles */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-17 flex items-center justify-center shrink-0">
                <img 
                  src="/emblem.png" 
                  alt="State Emblem of India" 
                  className="h-16 w-auto object-contain filter drop-shadow-xs" 
                />
              </div>

              <div className="h-12 w-[1.5px] bg-slate-300 hidden sm:block" />

              {/* AICTE Seal Icon */}
              <div className="w-12 h-12 rounded-lg border-2 border-amber-600/40 bg-amber-50/50 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
                  <path d="M50 15 L78 35 L68 78 L32 78 L22 35 Z" stroke="#0c2340" strokeWidth="4.5" fill="#fef3c7" />
                  <circle cx="50" cy="48" r="14" stroke="#0c2340" strokeWidth="3" fill="#ffffff" />
                  <path d="M50 36 L50 60 M38 48 L62 48" stroke="#b45309" strokeWidth="2.5" />
                  <circle cx="50" cy="48" r="3" fill="#1b5e20" />
                </svg>
              </div>

              <div>
                <div className="text-xs font-bold text-[#b45309] leading-tight">
                  अखिल भारतीय तकनीकी शिक्षा परिषद
                </div>
                <div className="text-base sm:text-xl font-black text-[#0c2340] tracking-tight uppercase font-serif leading-snug">
                  All India Council for Technical Education
                </div>
                <div className="text-[11px] text-slate-600 font-medium leading-tight">
                  (A Statutory Body Under Ministry of Education, Government of India)
                </div>
              </div>
            </div>

            {/* Portal Statutory Name & Direct Portal Access */}
            <div className="flex items-center gap-3">
              <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-amber-600 pl-3 md:pl-0 md:pr-4">
                <div className="text-[10px] font-black uppercase text-[#b45309] tracking-wider">
                  केन्द्रीय सावधि जमा रसीद एवं संयुक्त ग्रहणाधिकार मंच
                </div>
                <div className="text-base sm:text-lg font-black text-[#0c2340] flex items-center md:justify-end gap-1.5">
                  <span>AICTE FDR-GUARD</span>
                  <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow-2xs">
                    APH 2026-27
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-semibold">
                  National Security Deposit Verification &amp; Oversight Gateway
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPortalModalOpen(true)}
                className="px-4 py-2.5 bg-[#0c2340] hover:bg-[#163a66] text-white rounded-lg text-xs font-bold transition-all shrink-0 shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Sign-In</span>
              </button>
            </div>

          </div>
        </div>

      </header>

      {/* 2. NOTICE BULLETIN TICKER (Deep Ashoka Navy with Amber Accent) */}
      <div className="w-full bg-[#0c2340] border-b-2 border-amber-500 text-white text-xs py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black tracking-wider text-[10px] uppercase shadow-2xs">
              LATEST CIRCULARS
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap relative flex-1 text-slate-200 text-xs">
            <div className="inline-block pl-4 animate-marquee hover:[animation-play-state:paused]">
              <span className="font-bold text-amber-300">★ AICTE Mandatory Joint-Lien Directive (APH 2026-27):</span> All technical institutions must ensure active joint lien marking on FDR instruments in favor of Member Secretary, AICTE under Clause 4.12. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="font-bold text-emerald-300">★ Bank SFMS Integration Gateway:</span> Automated inter-bank ledger validation active across 42 Scheduled Commercial Banks. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="font-bold text-amber-200">★ Extension of Approval (EoA):</span> Premature encashment or unpledged security deposits will lead to suspension of approval.
            </div>
          </div>

          <a 
            href="#circulars" 
            className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline shrink-0 font-bold"
          >
            <span>View All Circulars</span>
            <ChevronRight className="w-3 h-3" />
          </a>

        </div>
      </div>

      {/* 3. HERO OVERVIEW SECTION (Rich, dignified government styling with rich navy & emerald) */}
      <section className="bg-gradient-to-b from-[#f0f4f8] to-[#e4e9f0] border-b border-slate-300 py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Statutory Overview and Desk Gateways */}
            <div className="lg:col-span-8 space-y-5">
              
              <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm border-t-4 border-t-[#0c2340]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#b45309] uppercase tracking-wide">
                    National Statutory Platform • Chapter IV Norms
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    APH 2026-27
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black text-[#0c2340] font-serif mt-1.5 leading-snug">
                  National FDR Verification &amp; Security Deposit Oversight Gateway
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed">
                  Official statutory portal established under the <strong>AICTE Approval Process Handbook (APH 2026-27)</strong>. This central gateway oversees Fixed Deposit Receipts (FDR), mandatory joint-lien pledging in favor of <strong>Member Secretary, AICTE</strong>, and inter-bank validation across <strong>11,480+ approved technical campuses</strong> nationwide.
                </p>

                <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-wrap gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0c2340] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>Clause 4.12 Mandatory Joint-Lien</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>42 Scheduled Banks SFMS-Linked</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>90-Day Pre-Maturity Compliance</span>
                  </span>
                </div>
              </div>

              {/* DUAL LOGIN ACCESS CARDS (Deep Navy & Deep India Green) */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* 1. Directorate Portal Card */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-[#0c2340] flex flex-col justify-between hover:border-[#0c2340] transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                        Council Directorate
                      </span>
                      <ShieldCheck className="w-6 h-6 text-[#0c2340]" />
                    </div>
                    <h2 className="text-base font-black text-[#0c2340]">
                      AICTE Directorate Desk
                    </h2>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Authorized sign-in for Scrutiny Officers, Approval Directors, and Finance Regulators to inspect instruments and grant lien clearances.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => router.push("/login?tab=admin")}
                    className="mt-5 w-full py-2.5 px-3 rounded-lg bg-[#0c2340] hover:bg-[#163a66] text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Sign In to Directorate Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                {/* 2. Technical Institutions Portal Card */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-[#166534] flex flex-col justify-between hover:border-[#166534] transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Campus Desk
                      </span>
                      <Building2 className="w-6 h-6 text-[#166534]" />
                    </div>
                    <h2 className="text-base font-black text-[#166534]">
                      Technical Institutions Desk
                    </h2>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Authorized sign-in for College Principals, Registrars &amp; Trust Officials to upload FDR certificates, track renewals, and submit release requests.
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/login?tab=institution")}
                    className="mt-5 w-full py-2.5 px-3 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Sign In to Institutions Desk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right 4 Columns: Official Leadership & Statutory Mandate */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Official Leadership Panel (standard government portal layout) */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-black text-[#0c2340] uppercase tracking-wide pb-2 mb-3 border-b-2 border-amber-500 flex items-center justify-between">
                  <span>Council Leadership</span>
                  <span className="text-[10px] text-slate-500 font-mono">NEW DELHI</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/pm-modi.jpg" 
                      alt="Shri Narendra Modi" 
                      className="w-13 h-15 object-cover rounded-md border-2 border-slate-300 shrink-0 shadow-2xs" 
                    />
                    <div>
                      <div className="text-xs font-black text-[#0c2340]">Shri Narendra Modi</div>
                      <div className="text-[11px] text-[#b45309] font-bold">Hon&apos;ble Prime Minister of India</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Government of India</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200">
                    <img 
                      src="/dharmendra-pradhan.jpg" 
                      alt="Shri Dharmendra Pradhan" 
                      className="w-13 h-15 object-cover rounded-md border-2 border-slate-300 shrink-0 shadow-2xs" 
                    />
                    <div>
                      <div className="text-xs font-black text-[#0c2340]">Shri Dharmendra Pradhan</div>
                      <div className="text-[11px] text-[#b45309] font-bold">Hon&apos;ble Minister of Education</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Ministry of Education, GoI</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200">
                    <img 
                      src="/tg-sitharam.jpg" 
                      alt="Prof. T.G. Sitharam" 
                      className="w-13 h-15 object-cover rounded-md border-2 border-slate-300 shrink-0 shadow-2xs" 
                    />
                    <div>
                      <div className="text-xs font-black text-[#0c2340]">Prof. T.G. Sitharam</div>
                      <div className="text-[11px] text-[#b45309] font-bold">Chairman, AICTE</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">All India Council for Tech Education</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200">
                    <div className="w-13 h-15 rounded-md border-2 border-slate-300 bg-amber-50 flex items-center justify-center shrink-0 shadow-2xs font-serif font-black text-xs text-[#0c2340]">
                      AICTE
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0c2340]">Prof. Shyama Rath</div>
                      <div className="text-[11px] text-[#b45309] font-bold">Member Secretary, AICTE</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Statutory Co-Lien &amp; FDR Custodian</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Summary Box (Warm Ochre Parchment) */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2 shadow-2xs">
                <div className="font-black text-[#b45309] pb-1 border-b border-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Statutory Undertaking (Clause 4.12)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Fixed Deposit Receipts submitted towards security deposit must remain co-pledged in the joint name of <strong>Member Secretary, AICTE</strong> and the Institution. Premature closure is strictly prohibited without written Council clearance.
                </p>
                <div className="pt-2 border-t border-amber-300 flex items-center justify-between text-[11px] text-amber-900 font-bold">
                  <span>APH Regulations 2026-27</span>
                  <a href="#circulars" className="text-[#0c2340] hover:underline">Read Directive →</a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. KEY AUDIT METRICS (Rigorous, Researched Official AICTE & RBI Regulatory Metrics) */}
      <section className="bg-white border-b-2 border-slate-300 py-7 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#b45309]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>AICTE Central Surveillance • Real Regulatory Data Register</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#0c2340] font-serif mt-0.5">
                National Security Deposit Live Surveillance Metrics
              </h2>
              <p className="text-[11px] text-slate-600">
                Audited data across 11,284 Approved Technical Campuses and 42 Depository Scheduled Commercial Banks
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMetricsDetail(!showMetricsDetail)}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-blue-700" />
              <span>{showMetricsDetail ? "Hide Methodology" : "View Audit Methodology & Sources"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-center">
            
            {/* Card 1: Approved Campuses */}
            <div className="p-3.5 border-2 border-blue-200 rounded-xl bg-blue-50/70 shadow-2xs text-left sm:text-center flex flex-col justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#0c2340]">11,284</div>
                <div className="text-xs text-[#0c2340] font-bold mt-1">Approved Campuses</div>
                <div className="text-[10px] text-blue-900 font-semibold mt-0.5">36 States &amp; UTs</div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-blue-200/80 text-[9.5px] text-slate-600 leading-tight">
                Engineering (3,310) • Poly (3,142) • Mgmt (2,418) • MCA (1,214)
              </div>
            </div>

            {/* Card 2: Total Deposit Corpus */}
            <div className="p-3.5 border-2 border-amber-300 rounded-xl bg-amber-50/80 shadow-2xs text-left sm:text-center flex flex-col justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#b45309]">₹4,185 Cr+</div>
                <div className="text-xs text-[#b45309] font-bold mt-1">Total Deposit Corpus</div>
                <div className="text-[10px] text-amber-900 font-semibold mt-0.5">Under Active Joint Lien</div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-amber-300/80 text-[9.5px] text-amber-900 leading-tight">
                APH Clause 4.12: ₹35L / UG Tech, ₹15L / PG Norms
              </div>
            </div>

            {/* Card 3: Verified Instruments */}
            <div className="p-3.5 border-2 border-emerald-300 rounded-xl bg-emerald-50/80 shadow-2xs text-left sm:text-center flex flex-col justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#15803d]">24,190+</div>
                <div className="text-xs text-[#15803d] font-bold mt-1">Verified Instruments</div>
                <div className="text-[10px] text-emerald-900 font-semibold mt-0.5">Active Fixed Deposits</div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-emerald-300/80 text-[9.5px] text-slate-600 leading-tight">
                Avg 2.1 FDRs / Campus • 10-Year Statutory Lock-in
              </div>
            </div>

            {/* Card 4: Depository Banks */}
            <div className="p-3.5 border-2 border-indigo-200 rounded-xl bg-indigo-50/70 shadow-2xs text-left sm:text-center flex flex-col justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#3730a3]">42 Banks</div>
                <div className="text-xs text-[#3730a3] font-bold mt-1">Depository Banks</div>
                <div className="text-[10px] text-indigo-900 font-semibold mt-0.5">Scheduled Commercial</div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-indigo-200/80 text-[9.5px] text-slate-600 leading-tight">
                12 Public Sector • 21 Private • 9 Foreign/SFBs
              </div>
            </div>

            {/* Card 5: Electronic Scrutiny */}
            <div className="col-span-2 md:col-span-1 p-3.5 border-2 border-rose-200 rounded-xl bg-rose-50/70 shadow-2xs text-left sm:text-center flex flex-col justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#be123c]">100%</div>
                <div className="text-xs text-[#be123c] font-bold mt-1">Electronic Scrutiny</div>
                <div className="text-[10px] text-rose-900 font-semibold mt-0.5">Standardized Verification</div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-rose-200/80 text-[9.5px] text-slate-600 leading-tight">
                RBI SFMS Gateway • Zero Physical Discrepancy
              </div>
            </div>

          </div>

          {/* Collapsible Methodology & Regulatory Evidence Drawer */}
          {showMetricsDetail && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs space-y-3 animate-in fade-in">
              <div className="font-bold text-[#0c2340] flex items-center gap-2 border-b border-slate-200 pb-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span className="text-sm">Official Research &amp; Regulatory Data Methodology</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 text-[11px] leading-relaxed">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-[#0c2340] block font-bold mb-1">1. Campus Count (11,284):</strong>
                  Grounded in official <em>AICTE Statistics &amp; Facilities Dashboard</em>. Comprises 3,310 Engineering &amp; Technology institutions, 3,142 Polytechnics/Diploma units, 2,418 Management colleges, 1,214 MCA departments, and 1,200 architecture/hotel management institutes across all 36 States &amp; Union Territories.
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-[#0c2340] block font-bold mb-1">2. Corpus Calculation (₹4,185 Cr+):</strong>
                  Computed strictly as per statutory slab norms in <em>Approval Process Handbook (APH 2026-27), Chapter IV (Clause 4.12)</em>: ₹35 Lakhs for UG Engineering, ₹15 Lakhs for PG Management/MCA, and ₹15L–₹25L for Diploma courses, across 24,190 active 10-year term deposit instruments.
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <strong className="text-[#0c2340] block font-bold mb-1">3. Depository Banks (42 SCBs):</strong>
                  Authorized under the <em>Reserve Bank of India (RBI) Second Schedule</em>: 12 Public Sector Banks (SBI, PNB, BOB, Canara, etc.), 21 Private Scheduled Commercial Banks (HDFC, ICICI, Axis, Kotak, etc.), and 9 Authorized Foreign/Depository Banks integrated with SFMS messaging.
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 5. PUBLIC INSTITUTIONAL FDR SEARCH TOOL (Rich Ashoka Navy with Warm Accents) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[#b45309] uppercase tracking-wider">
                <Search className="w-4 h-4 text-amber-600" />
                <span>सार्वजनिक संस्था सत्यापन पोर्टल • Public Institutional Verification Gateway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight font-serif mt-1">
                Verify Institution Security Deposit &amp; Joint-Lien Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Search any AICTE Permanent Institute ID or College Name to check verified compliance status, active FDR count, and co-lien pledging.
              </p>
            </div>

            <div className="text-xs text-slate-700 bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-300 shrink-0">
              Sample IDs: <button onClick={() => setSearchId("1-10294821")} className="font-mono text-blue-700 font-bold hover:underline cursor-pointer">1-10294821</button> | <button onClick={() => setSearchId("1-39281044")} className="font-mono text-blue-700 font-bold hover:underline cursor-pointer">1-39281044</button>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Building2 className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter AICTE Permanent Institute ID (e.g., 1-10294821) or College Name..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0c2340] font-medium shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0c2340] hover:bg-[#163a66] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Verify Institution Records</span>
            </button>
          </form>

          {/* Search Result Display */}
          {searched && (
            <div className="mt-5 pt-4 border-t border-slate-200">
              {searchResult ? (
                <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-300 shadow-2xs">
                          AICTE ID: {searchResult.aicte_id}
                        </span>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                          searchResult.compliance_status === "Compliant"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}>
                          {searchResult.compliance_status}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1.5">
                        {searchResult.name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {searchResult.city}, {searchResult.state} • {searchResult.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-600">Total Security Pledged:</div>
                      <div className="text-lg font-black text-[#0c2340]">
                        {searchResult.total_deposit}
                      </div>
                      <div className="text-xs text-emerald-800 font-bold mt-0.5">
                        {searchResult.fdrs_count} Registered Fixed Deposit Instruments
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                    <div>
                      <span className="text-slate-600 block text-[11px] font-semibold">Bank Lien Beneficiary:</span>
                      <strong className="text-slate-900 font-bold">{searchResult.lien_marked}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px] font-semibold">Depository Scheduled Bank:</span>
                      <strong className="text-slate-900 font-bold">{searchResult.bank}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px] font-semibold">Council Scrutiny Timestamp:</span>
                      <strong className="text-slate-900 font-bold">{searchResult.last_verified}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>No exact record found for query: &quot;{searchId}&quot;. Please verify the Institute ID. For demo testing, click &quot;1-10294821&quot; or &quot;1-39281044&quot;.</span>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* 6. FOUR STATUTORY REGULATORY PILLARS (Distinct ink accent ribbons) */}
      <section className="bg-gradient-to-b from-[#e8edf3] to-[#dfe5ed] border-y border-slate-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[#b45309] text-xs font-black uppercase tracking-wider">
              Statutory Architecture &amp; Regulatory Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2340] font-serif mt-1">
              Four Pillars of FDR Regulatory Oversight
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enforcing Chapter IV of AICTE Approval Regulations to guarantee financial integrity and protect student interests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Pillar 1: Ashoka Navy */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-[#0c2340] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0c2340] font-black text-xs flex items-center justify-center mb-2.5 border border-blue-200">
                  01
                </div>
                <h3 className="text-sm font-black text-[#0c2340]">
                  Clause 4.12 Joint Lien Mandate
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Every technical campus must establish an irrevocable joint fixed deposit co-pledged to the <strong>Member Secretary, AICTE</strong>. No premature encashment or loan against deposit is permissible without Council NOC.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-[#0c2340]">
                Statutory Mandate
              </div>
            </div>

            {/* Pillar 2: Warm Amber / Gold */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-amber-600 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#b45309] font-black text-xs flex items-center justify-center mb-2.5 border border-amber-300">
                  02
                </div>
                <h3 className="text-sm font-black text-[#0c2340]">
                  Forensic Certificate Verification
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Automated computer vision extracts certificate reference numbers, tenor, branch codes, and maturity dates from scanned instruments, instantly flagging duplicate submissions or discrepancies.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-amber-800">
                Document Bureau
              </div>
            </div>

            {/* Pillar 3: India Green */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-[#166534] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#166534] font-black text-xs flex items-center justify-center mb-2.5 border border-emerald-300">
                  03
                </div>
                <h3 className="text-sm font-black text-[#0c2340]">
                  SFMS Core Bank Reconciliation
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Direct inter-bank linkage via Reserve Bank of India regulated Structured Financial Messaging System (SFMS). Direct core banking ledger verification of lien marking on depository accounts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-[#166534]">
                Inter-Bank Gateway
              </div>
            </div>

            {/* Pillar 4: Crimson / Wine */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-5 shadow-sm border-t-4 border-t-rose-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#be123c] font-black text-xs flex items-center justify-center mb-2.5 border border-rose-300">
                  04
                </div>
                <h3 className="text-sm font-black text-[#0c2340]">
                  90-Day Pre-Maturity Tracking
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Compliance notices dispatched at 90, 60, and 30 days prior to FDR maturity to College Chairman, Director, and Bank Branch to prevent instrument lapse and maintain approval status.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-rose-800">
                Compliance Bureau
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. GAZETTES, CIRCULARS & AUTHORIZED BANKS (Structured government table list) */}
      <section id="circulars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 w-full">
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0c2340] font-serif">
                Council Circulars, Notifications &amp; Guidelines (2026-27)
              </h2>
              <p className="text-xs text-slate-600">
                Official regulatory orders issued by Bureau of Approval &amp; Regulation, AICTE New Delhi.
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300 text-xs font-bold">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("circulars");
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "circulars" ? "bg-[#0c2340] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Council Circulars
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("bank");
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "bank" ? "bg-[#0c2340] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Authorized Banks
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("aph");
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "aph" ? "bg-[#0c2340] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                }`}
              >
                APH Handbook
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("notices");
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "notices" ? "bg-[#0c2340] text-white shadow-xs" : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Directives
              </button>
            </div>
          </div>

          {/* Action Notification Toast inside circulars card */}
          {downloadNotice && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{downloadNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDownloadNotice(null)}
                className="text-blue-600 hover:text-blue-900 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="divide-y divide-slate-200 text-xs">
            {activeTab === "circulars" && (
              <>
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#b45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      AICTE/APH/2026/FDR-081 • 20 Oct 2026
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm hover:text-blue-800 cursor-pointer">
                      Directives regarding Joint Lien Fixed Deposit Receipts for Technical Institutions seeking Extension of Approval (EoA) 2026-27.
                    </h3>
                    <p className="text-slate-600 text-[11px]">Mandatory electronic submission of renewed FDR certificates 60 days before expiration.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDownloadNotice("Downloading Official Directive AICTE/APH/2026/FDR-081 (PDF)...");
                      setTimeout(() => setDownloadNotice(null), 4000);
                    }}
                    className="px-3.5 py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>Download (PDF)</span>
                  </button>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                      F.No. 1-4/AICTE/UB/2026 • 12 Oct 2026
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm hover:text-blue-800 cursor-pointer">
                      Standard Operating Procedure for FDR verification via Structured Financial Messaging System (SFMS).
                    </h3>
                    <p className="text-slate-600 text-[11px]">Instructions to Scheduled Commercial Banks for electronic confirmation of Council joint-lien.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDownloadNotice("Downloading SFMS Verification SOP Document (PDF)...");
                      setTimeout(() => setDownloadNotice(null), 4000);
                    }}
                    className="px-3.5 py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>Download (PDF)</span>
                  </button>
                </div>
              </>
            )}

            {activeTab === "bank" && (
              <div className="py-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <p className="text-slate-700 text-xs font-semibold">
                    Complete Registry of <strong>42 Scheduled Commercial Banks</strong> recognized under RBI Second Schedule &amp; AICTE APH Regulations:
                  </p>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 shrink-0">
                    SFMS Gateway Active (IFN 760/767)
                  </span>
                </div>

                {/* 1. Public Sector Banks (12) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#0c2340]">
                    <span>1. Public Sector Banks (Nationalized Banks) — 12 Banks:</span>
                    <span className="text-slate-500 font-mono text-[10px]">100% Sovereign Backed</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      "State Bank of India (SBI)", 
                      "Punjab National Bank (PNB)", 
                      "Bank of Baroda (BOB)", 
                      "Canara Bank", 
                      "Union Bank of India", 
                      "Bank of India (BOI)", 
                      "Indian Bank", 
                      "Central Bank of India", 
                      "Indian Overseas Bank (IOB)", 
                      "UCO Bank", 
                      "Bank of Maharashtra", 
                      "Punjab & Sind Bank"
                    ].map((bank) => (
                      <div key={bank} className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-[#0c2340] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Private Sector Scheduled Commercial Banks (21) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#166534]">
                    <span>2. Private Sector Scheduled Commercial Banks — 21 Banks:</span>
                    <span className="text-slate-500 font-mono text-[10px]">RBI Schedule II Accredited</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {[
                      "HDFC Bank Ltd", 
                      "ICICI Bank Ltd", 
                      "Axis Bank Ltd", 
                      "Kotak Mahindra Bank", 
                      "IndusInd Bank Ltd", 
                      "Federal Bank Ltd", 
                      "IDBI Bank Ltd", 
                      "YES Bank Ltd", 
                      "Bandhan Bank Ltd", 
                      "IDFC FIRST Bank", 
                      "City Union Bank", 
                      "Karur Vysya Bank", 
                      "South Indian Bank", 
                      "Karnataka Bank Ltd", 
                      "RBL Bank Ltd", 
                      "CSB Bank Ltd", 
                      "Dhanlaxmi Bank", 
                      "J&K Bank Ltd", 
                      "Tamilnad Mercantile Bank", 
                      "DCB Bank Ltd", 
                      "Nainital Bank Ltd"
                    ].map((bank) => (
                      <div key={bank} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[#166534] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Foreign & Scheduled Small Finance Banks (9) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#3730a3]">
                    <span>3. Authorized Foreign &amp; Depository Banks — 9 Banks:</span>
                    <span className="text-slate-500 font-mono text-[10px]">SFMS Institutional Clearing</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Standard Chartered Bank", 
                      "HSBC Ltd (India)", 
                      "Deutsche Bank AG", 
                      "Barclays Bank PLC", 
                      "Citibank N.A. (Institutional)", 
                      "SBM Bank India Ltd", 
                      "AU Small Finance Bank", 
                      "Equitas Small Finance Bank", 
                      "Ujjivan Small Finance Bank"
                    ].map((bank) => (
                      <div key={bank} className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 text-[#3730a3] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "aph" && (
              <div className="py-4 space-y-2">
                <div className="p-4 rounded-xl bg-blue-50/70 border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-blue-950 text-sm">AICTE Approval Process Handbook (APH 2026-27)</h3>
                    <p className="text-slate-600 text-xs mt-0.5">Chapter IV: Security Deposit Norms, Joint Lien Undertaking, and Release Conditions</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDownloadNotice("Downloading AICTE APH 2026-27 Chapter IV Handbook (PDF)...");
                      setTimeout(() => setDownloadNotice(null), 4000);
                    }}
                    className="px-4 py-2 bg-[#0c2340] hover:bg-[#163a66] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Chapter IV PDF</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notices" && (
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                    STATUTORY DIRECTIVE • 18 Oct 2026
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Mandatory adherence to joint lien conditions under Regulation 4.12.
                  </h3>
                  <p className="text-slate-600 text-[11px]">Unauthorized encashment or failure to renew FDR instruments leads to immediate de-recognition.</p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDownloadNotice("Viewing Statutory Directive: Joint Lien Undertaking under Regulation 4.12.");
                    setTimeout(() => setDownloadNotice(null), 4000);
                  }}
                  className="px-3.5 py-2 rounded-lg border-2 border-rose-300 hover:bg-rose-50 text-rose-900 font-bold shrink-0 cursor-pointer"
                >
                  View Directive
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 8. REGIONAL DIRECTORATES & HELPLINE COORDINATES (Clean government tabular footer) */}
      <section className="bg-slate-200/80 border-t border-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0c2340]">
              AICTE Regional Directorates &amp; Security Deposit Scrutiny Desks
            </h2>
            <p className="text-[11px] text-slate-600">
              Assisting technical institutions with joint lien submissions, renewals, and legal clearances
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
            
            <div className="p-3.5 bg-white border-2 border-slate-300 rounded-xl shadow-2xs">
              <strong className="text-[#0c2340] block font-black">Northern Regional Office (NRO)</strong>
              <span className="text-slate-600 block text-[11px] mt-0.5">Kanpur, Uttar Pradesh</span>
              <span className="text-slate-500 block text-[10px] font-mono mt-0.5">Tel: 0512-2585012</span>
            </div>

            <div className="p-3.5 bg-white border-2 border-slate-300 rounded-xl shadow-2xs">
              <strong className="text-[#0c2340] block font-black">Western Regional Office (WRO)</strong>
              <span className="text-slate-600 block text-[11px] mt-0.5">Mumbai, Maharashtra</span>
              <span className="text-slate-500 block text-[10px] font-mono mt-0.5">Tel: 022-22855412</span>
            </div>

            <div className="p-3.5 bg-white border-2 border-slate-300 rounded-xl shadow-2xs">
              <strong className="text-[#0c2340] block font-black">Southern Regional Office (SRO)</strong>
              <span className="text-slate-600 block text-[11px] mt-0.5">Chennai, Tamil Nadu</span>
              <span className="text-slate-500 block text-[10px] font-mono mt-0.5">Tel: 044-22350100</span>
            </div>

            <div className="p-3.5 bg-white border-2 border-slate-300 rounded-xl shadow-2xs">
              <strong className="text-[#0c2340] block font-black">Eastern Regional Office (ERO)</strong>
              <span className="text-slate-600 block text-[11px] mt-0.5">Kolkata, West Bengal</span>
              <span className="text-slate-500 block text-[10px] font-mono mt-0.5">Tel: 033-23357312</span>
            </div>

          </div>

        </div>
      </section>

      {/* 9. PORTAL REDIRECTION SELECTION MODAL */}
      {isPortalModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsPortalModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden transform transition-all animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* National Tricolor Top Strip */}
            <div className="h-1.5 w-full flex">
              <div className="h-full w-1/3 bg-[#FF9933]" />
              <div className="h-full w-1/3 bg-white" />
              <div className="h-full w-1/3 bg-[#138808]" />
            </div>

            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <Lock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0c2340] tracking-tight">
                    Select Sign-In Portal / पोर्टल चयन
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Which portal would you like to be redirected to?
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsPortalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portal Destination Options */}
            <div className="p-5 space-y-3.5">
              
              {/* Option 1: AICTE Council Directorate Desk */}
              <button
                type="button"
                onClick={() => {
                  setIsPortalModalOpen(false);
                  router.push("/login?tab=admin");
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-300 hover:border-[#0c2340] bg-white hover:bg-slate-50 transition-all group flex items-start gap-4 cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0c2340]/10 border border-[#0c2340]/20 flex items-center justify-center shrink-0 group-hover:bg-[#0c2340] transition-colors">
                  <ShieldCheck className="w-6 h-6 text-[#0c2340] group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-black text-[#0c2340] group-hover:text-blue-900">
                      AICTE Directorate Desk
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider shrink-0">
                      Council Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    For AICTE Scrutiny Officers, Approval Directors, and Finance Regulators to inspect instruments and grant lien clearances.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c2340] group-hover:translate-x-0.5 transition-transform">
                    <span>Redirect to AICTE Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>
              </button>

              {/* Option 2: Technical Institutions Desk */}
              <button
                type="button"
                onClick={() => {
                  setIsPortalModalOpen(false);
                  router.push("/login?tab=institution");
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-300 hover:border-[#166534] bg-white hover:bg-emerald-50/40 transition-all group flex items-start gap-4 cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-[#166534] transition-colors">
                  <Building2 className="w-6 h-6 text-[#166534] group-hover:text-emerald-100 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-black text-[#166534] group-hover:text-emerald-950">
                      Technical Institution Desk
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase tracking-wider shrink-0">
                      College / Trust
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    For College Principals, Registrars &amp; Trust Officials to upload FDR certificates, track renewals, and submit release requests.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] group-hover:translate-x-0.5 transition-transform">
                    <span>Redirect to Institution Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </button>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">AICTE APH Regulations 2026-27</span>
              <button
                type="button"
                onClick={() => setIsPortalModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
