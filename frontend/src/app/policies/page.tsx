"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, FileText, Lock, ArrowLeft, Building2, 
  ExternalLink, Scale, CheckCircle2, AlertCircle, Phone, 
  Mail, Landmark, Info, ChevronRight, ShieldAlert, Award,
  Download, Check, Clock, AlertTriangle
} from "lucide-react";

export default function PoliciesPage() {
  const [activeSection, setActiveSection] = useState<string>("directives");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    // Check hash on load and on hashchange
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["rti", "terms", "hyperlinking", "security", "aph", "directives", "banks", "circulars"].includes(hash)) {
        setActiveSection(hash);
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navItems = [
    { id: "directives", label: "Joint Lien Directives", hindi: "संयुक्त ग्रहणाधिकार निर्देश" },
    { id: "banks", label: "Approved Scheduled Banks", hindi: "स्वीकृत अनुसूचित बैंक" },
    { id: "circulars", label: "Notifications & Circulars", hindi: "अधिसूचनाएं एवं परिपत्र" },
    { id: "aph", label: "APH 2026-27 Norms", hindi: "अनुमोदन प्रक्रिया" },
    { id: "rti", label: "Right to Information (RTI)", hindi: "सूचना का अधिकार" },
    { id: "terms", label: "Terms & Disclaimer", hindi: "नियम एवं शर्तें" },
    { id: "hyperlinking", label: "Hyperlinking Policy", hindi: "हाइपरलिंकिंग नीति" },
    { id: "security", label: "Security Audit & STQC", hindi: "सुरक्षा लेखापरीक्षा" },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f4f6fa] pb-16">
      
      {/* Background Watermark & Linework */}
      <div 
        className="fixed inset-0 bg-cover bg-center -z-10 mix-blend-multiply opacity-10 pointer-events-none"
        style={{ backgroundImage: `url('/govt-bg.jpg')` }}
      />

      {/* Header Banner */}
      <section className="bg-[#0c2340] border-b-2 border-amber-500 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-4">
            <Link href="/" className="hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>मुख्य पृष्ठ (Home)</span>
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Statutory Policies &amp; Legal Framework</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest font-mono">
                अखिल भारतीय तकनीकी शिक्षा परिषद • भारत सरकार
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight mt-1 text-white uppercase">
                Statutory Policies, RTI &amp; Legal Framework
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Official regulatory disclosures, terms of FDR joint-lien enforcement, hyperlinking rules, and STQC/CERT-In website security compliance standards for AICTE FDR-GUARD Portal.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-[#163a66] border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              <span>APH 2026-27 Validated</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Left Navigation Sidebar */}
          <div className="lg:col-span-4 sticky top-20 z-10">
            <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-black uppercase text-[#0c2340] tracking-wider pb-2.5 mb-3 border-b-2 border-amber-500 flex items-center justify-between">
                <span>Policy Directory</span>
                <span className="text-[10px] text-slate-500 font-mono">NIC / AICTE</span>
              </div>

              <nav className="space-y-1.5 text-xs font-bold">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      activeSection === item.id
                        ? "bg-[#0c2340] text-white shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{item.label}</div>
                      <div className={`text-[10px] font-normal ${activeSection === item.id ? "text-amber-300" : "text-slate-500"}`}>
                        {item.hindi}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeSection === item.id ? "text-amber-400" : "text-slate-400"}`} />
                  </button>
                ))}
              </nav>

              <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 space-y-1">
                <div className="font-bold text-[#b45309] flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Public Grievance Helpdesk</span>
                </div>
                <p className="text-slate-700 leading-snug">
                  For statutory grievances regarding deposit verification, contact the AICTE Legal Bureau at <a href="mailto:support-fdr@aicte-india.org" className="text-blue-700 font-semibold hover:underline">support-fdr@aicte-india.org</a>.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <Link
                  href="/"
                  className="w-full py-2 px-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
                  <span>Return to Public Home Portal</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. RIGHT TO INFORMATION (RTI) */}
            <section id="rti" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-900 font-bold shrink-0">
                  <FileText className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#b45309] tracking-wider">
                    Right to Information Act, 2005 (RTI) • सूचना का अधिकार
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Statutory RTI Disclosures &amp; Transparency Obligations
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  In compliance with Section 4(1)(b) of the <strong>Right to Information Act, 2005</strong>, the All India Council for Technical Education (AICTE) makes available public records pertaining to the verification and joint lien marking of security deposit instruments submitted by technical institutions seeking Approval or Extension of Approval (EoA).
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Designated RTI Authorities:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong className="text-[#0c2340] block">Central Public Information Officer (CPIO)</strong>
                      <span className="text-slate-600 block mt-0.5">Bureau of Approval &amp; Regulation</span>
                      <span className="text-slate-600 block">AICTE Headquarters, Nelson Mandela Marg, New Delhi - 110070</span>
                      <span className="text-slate-500 font-mono block mt-1">Tel: 011-29581000 • cpio-approval@aicte-india.org</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <strong className="text-[#0c2340] block">First Appellate Authority (FAA)</strong>
                      <span className="text-slate-600 block mt-0.5">Adviser (Approval Bureau)</span>
                      <span className="text-slate-600 block">AICTE Headquarters, Vasant Kunj, New Delhi - 110070</span>
                      <span className="text-slate-500 font-mono block mt-1">Tel: 011-29581001 • faa-approval@aicte-india.org</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Proactive Disclosures under FDR-GUARD:</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>Institutions compliance status, pledged FDR counts, and authorized depository bank names are accessible via the public Institutional Verification Tool.</li>
                    <li>Individual instrument numbers, bank secret codes, and financial messaging telemetry are protected under statutory financial confidentiality (Section 8(1)(d) &amp; (e) of the RTI Act).</li>
                    <li>Citizens may file online RTI requests and first appeals through the central government portal at <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-1">rtionline.gov.in <ExternalLink className="w-3 h-3" /></a>.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. TERMS OF SERVICE & DISCLAIMER */}
            <section id="terms" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold shrink-0">
                  <Scale className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#166534] tracking-wider">
                    Terms of Service &amp; Legal Undertaking • नियम एवं शर्तें
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Terms of Access &amp; Statutory Disclaimer
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  Access to the AICTE FDR-GUARD Portal is governed by the AICTE Act, 1987, and the Regulations formulated under the Approval Process Handbook (APH 2026-27). By logging into or utilizing this platform, technical institutions, trusts, and authorized officials agree to the statutory conditions stipulated herein:
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300">
                    <h4 className="font-bold text-[#0c2340] mb-1">1. Mandatory Joint Lien Custody (Clause 4.12)</h4>
                    <p className="text-slate-600">
                      Every Fixed Deposit Receipt submitted as a statutory security deposit must remain co-pledged in the joint name of <strong>Member Secretary, AICTE</strong> and the Institution. Premature closure, alteration, or pledging against bank credit without explicit Council sanction constitutes statutory violation punishable under AICTE de-recognition norms.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300">
                    <h4 className="font-bold text-[#0c2340] mb-1">2. Authenticity of Electronic Submissions</h4>
                    <p className="text-slate-600">
                      The institution is exclusively liable for the veracity of scanned FDR certificates, renewal receipts, and bank verification letters uploaded to this portal. Submitting falsified documents invites criminal prosecution under the Indian Penal Code (IPC) and immediate revocation of Approval.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300">
                    <h4 className="font-bold text-[#0c2340] mb-1">3. Council Disclaimer &amp; Jurisdiction</h4>
                    <p className="text-slate-600">
                      While AICTE and the National Informatics Centre (NIC) make every effort to maintain real-time automated synchronization with Scheduled Commercial Banks, the Council shall not be held liable for temporary bank gateway downtime or communication outages. All statutory disputes are subject solely to the jurisdiction of the Hon’ble High Court of Delhi at New Delhi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. HYPERLINKING POLICY */}
            <section id="hyperlinking" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold shrink-0">
                  <ExternalLink className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#b45309] tracking-wider">
                    Hyperlinking Policy • हाइपरलिंकिंग नीति
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    External &amp; Inbound Linking Standards
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  This portal complies with the Guidelines for Indian Government Websites (GIGW 3.0) regarding hyperlinking:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Links to External Websites</h4>
                    <p className="text-slate-600">
                      At numerous places, this gateway provides links to other Indian Government Websites (Ministry of Education, NIC, RBI, and Scheduled Commercial Banks). AICTE does not guarantee the availability or accuracy of linked external pages and is not responsible for their contents.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Linking to AICTE FDR-GUARD</h4>
                    <p className="text-slate-600">
                      Prior permission is not required to link directly to this portal from accredited colleges, universities, or banks. However, we do not permit our pages to be loaded into frames on external sites without Council permission; the pages must load into a full new tab or window.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. WEBSITE SECURITY AUDIT & STQC COMPLIANCE */}
            <section id="security" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-900 font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5 text-indigo-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#3730a3] tracking-wider">
                    STQC &amp; CERT-In Compliance • सुरक्षा लेखापरीक्षा
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Website Security Audit Certification
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  The AICTE FDR-GUARD Portal undergoes periodic and mandatory Vulnerability Assessment and Penetration Testing (VAPT) conducted by Indian Computer Emergency Response Team (CERT-In) empanelled auditing agencies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center">
                    <div className="text-base font-black text-[#0c2340]">TLS 1.3 / SHA-256</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">End-to-End Cryptography</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center">
                    <div className="text-base font-black text-emerald-800">MeghRaj GI-Cloud</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">National Data Residency</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center">
                    <div className="text-base font-black text-blue-900">GIGW 3.0 Certified</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Accessibility &amp; Usability</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-300 text-blue-950">
                  <strong className="block font-bold mb-0.5">Security Compliance Summary:</strong>
                  <span>Audited in compliance with the Information Technology Act, 2000 (amended 2008), ISO/IEC 27001 standard controls, and National Cyber Security Guidelines for Financial Deposit Surveillance.</span>
                </div>
              </div>
            </section>

            {/* 5. APH 2026-27 JOINT LIEN NORMS SUMMARY */}
            <section id="aph" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold shrink-0">
                  <Landmark className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#b45309] tracking-wider">
                    Approval Process Handbook (APH 2026-27)
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Chapter IV: Security Deposit Norms &amp; Joint Lien Undertaking
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  As per AICTE Regulations for Technical Education, institutions establishing new campuses or seeking addition of courses/programmes must create a Fixed Deposit Receipt (FDR) in favor of <strong>Member Secretary, AICTE</strong> for a period of ten (10) years.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Key Regulatory Provisions:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                    <li>The FDR must be drawn on a Scheduled Commercial Bank approved by the Reserve Bank of India (RBI).</li>
                    <li>Automated bank verification is executed via the Structured Financial Messaging System (SFMS).</li>
                    <li>Interest accrued on the deposit belongs to the institution, but the principal cannot be liquidated without Council clearance.</li>
                    <li>Applications for maturity encashment or release must be submitted via the FDR-GUARD release portal along with physical no-dues verification.</li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadNotice("Downloading AICTE APH 2026-27 Chapter IV Handbook (PDF)...");
                      setTimeout(() => setDownloadNotice(null), 4000);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#0c2340] hover:bg-[#163a66] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Chapter IV Norms (PDF)</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 6. JOINT LIEN REGULATORY DIRECTIVES */}
            <section id="directives" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-900 font-bold shrink-0">
                  <Scale className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                    Statutory Directives • Regulation 4.12
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Joint Lien Regulatory Directives &amp; Enforcement Framework
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  Under Section 10(k) of the <strong>AICTE Act, 1987</strong> and <strong>Regulation 4.12</strong> of the Approval Process Handbook, all security deposits pledged to the Council are governed by strict joint-lien covenants designed to protect public funds, student interests, and faculty endowments:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#0c2340] font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <h4>1. Irrevocable Joint Lien Endorsement</h4>
                    </div>
                    <p className="text-slate-600">
                      The FDR certificate must strictly bear the joint title <em>&ldquo;Member Secretary, AICTE and [Trust / Institute Name]&rdquo;</em>. Issuing banks must register an unconditional lien in their Core Banking System (CBS) and furnish a formal Lien Confirmation Certificate.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#0c2340] font-bold">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <h4>2. 90-Day Pre-Maturity Renewal Directive</h4>
                    </div>
                    <p className="text-slate-600">
                      Institutions whose security deposits are maturing within the next 90 days must initiate mandatory electronic renewal via this portal. Failure to furnish the renewed FDR 60 days before expiration triggers automated suspension of Extension of Approval (EoA).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#0c2340] font-bold">
                      <Lock className="w-4 h-4 text-rose-700" />
                      <h4>3. Absolute Liquidation Prohibition</h4>
                    </div>
                    <p className="text-slate-600">
                      Scheduled banks are strictly prohibited from executing premature encashment, partial withdrawal, or granting overdraft loans against FDRs co-pledged to AICTE without written Council clearance authenticated by digital signature.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#0c2340] font-bold">
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                      <h4>4. Penal Sanctions for Breach</h4>
                    </div>
                    <p className="text-slate-600">
                      Unauthorized encashment or failure to maintain adequate security deposits results in immediate issuance of show-cause notice, reduction in student intake, placement in &ldquo;No Admission&rdquo; category, and criminal proceedings under IPC.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
                  <div className="space-y-0.5">
                    <strong className="block font-bold">Statutory Undertaking Format (Annexure 8):</strong>
                    <span className="text-[11px] text-amber-900">Standard tripartite legal deed between AICTE, the Institution&apos;s President/Secretary, and the Bank Branch Manager.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadNotice("Downloading Joint Lien Undertaking Deed Format (Annexure 8 PDF)...");
                      setTimeout(() => setDownloadNotice(null), 4000);
                    }}
                    className="px-3.5 py-1.5 bg-[#0c2340] hover:bg-[#163a66] text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Deed Format</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 7. APPROVED SCHEDULED COMMERCIAL BANKS */}
            <section id="banks" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                    RBI Second Schedule Registry • SFMS Interoperability
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Approved Scheduled Commercial Banks Registry
                  </h2>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  As mandated under <strong>Chapter IV, Clause 4.10</strong> of the Approval Process Handbook, Fixed Deposit Receipts must be drawn strictly on <strong>Scheduled Commercial Banks</strong> included in the Second Schedule of the Reserve Bank of India (RBI) Act, 1934. Deposits created in non-scheduled, cooperative, or private financial societies are rejected automatically.
                </p>

                {/* 1. Public Sector Banks (12) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0c2340] pb-1 border-b border-slate-200">
                    <span>1. Public Sector Banks (Nationalized Banks) — 12 Banks</span>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Sovereign Backed • Full Acceptance
                    </span>
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
                      <div key={bank} className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[#0c2340] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Private Sector Scheduled Commercial Banks (21) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#166534] pb-1 border-b border-slate-200">
                    <span>2. Private Sector Scheduled Commercial Banks — 21 Banks</span>
                    <span className="text-[10px] font-mono text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      RBI Schedule II Accredited
                    </span>
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
                      <div key={bank} className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[#166534] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Authorized Foreign & Small Finance Banks (9) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#3730a3] pb-1 border-b border-slate-200">
                    <span>3. Authorized Foreign &amp; Depository Banks — 9 Banks</span>
                    <span className="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      SFMS Gateway Integrated
                    </span>
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
                      <div key={bank} className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-[#3730a3] font-bold text-[11px] text-center shadow-2xs">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SFMS Integration Note */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-slate-900 block font-bold">SFMS Electronic Confirmation (IFN 760 / IFN 767):</strong>
                    <p className="text-slate-600 text-[11px]">
                      Scheduled banks must transmit financial messaging confirmations to AICTE&apos;s designated corporate account via the RBI Structured Financial Messaging System (SFMS). Message format <strong>IFN 760</strong> denotes Joint Lien Undertaking, and <strong>IFN 767</strong> denotes Amendment or Extension of Tenure.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. COUNCIL NOTIFICATIONS & CIRCULARS ARCHIVE */}
            <section id="circulars" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold shrink-0">
                  <FileText className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#b45309] tracking-wider">
                    Gazettes &amp; Official Notifications • परिपत्र एवं अधिसूचनाएं
                  </span>
                  <h2 className="text-xl font-black text-[#0c2340] font-serif">
                    Council Notifications &amp; Statutory Circulars
                  </h2>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <p>
                  Official orders and notifications issued by the Bureau of Approval and Finance Regulation, All India Council for Technical Education:
                </p>

                <div className="divide-y divide-slate-200 border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  
                  {/* Circular 1 */}
                  <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#b45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-mono">
                          AICTE/APH/2026/FDR-081
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">20 Oct 2026</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Directives regarding Joint Lien Fixed Deposit Receipts for Technical Institutions seeking Extension of Approval (EoA) 2026-27
                      </h4>
                      <p className="text-slate-600 text-[11px]">
                        Mandatory electronic submission of renewed FDR certificates 60 days before expiration. Non-compliance results in denial of approval.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadNotice("Downloading Circular AICTE/APH/2026/FDR-081 (PDF)...");
                        setTimeout(() => setDownloadNotice(null), 4000);
                      }}
                      className="px-3.5 py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-100 text-[#0c2340] font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Circular 2 */}
                  <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-300 font-mono">
                          F.No. 1-4/AICTE/UB/2026
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">12 Oct 2026</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Standard Operating Procedure for FDR verification via Structured Financial Messaging System (SFMS)
                      </h4>
                      <p className="text-slate-600 text-[11px]">
                        Operational guidelines for 42 Scheduled Commercial Banks to establish direct SFMS electronic ledger verification with AICTE portal.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadNotice("Downloading SFMS SOP Notification F.No. 1-4/AICTE/UB/2026 (PDF)...");
                        setTimeout(() => setDownloadNotice(null), 4000);
                      }}
                      className="px-3.5 py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-100 text-[#0c2340] font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Circular 3 */}
                  <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 font-mono">
                          F.No. AICTE/Legal/FDR/2026/03
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">18 Oct 2026</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Mandatory adherence to joint lien conditions under Regulation 4.12 &amp; Penalties for Unauthorized Encashment
                      </h4>
                      <p className="text-slate-600 text-[11px]">
                        Statutory warning on immediate de-recognition and asset attachment for institutions breaching security deposit lien terms.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadNotice("Downloading Legal Order F.No. AICTE/Legal/FDR/2026/03 (PDF)...");
                        setTimeout(() => setDownloadNotice(null), 4000);
                      }}
                      className="px-3.5 py-2 rounded-lg border-2 border-rose-200 hover:bg-rose-50 text-rose-900 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-700" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Circular 4 */}
                  <div className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                          AICTE/Fin/Deposit-Release/2026/19
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">05 Sep 2026</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Guidelines for release and encashment of Security Deposits upon completion of 10-year statutory lock-in period
                      </h4>
                      <p className="text-slate-600 text-[11px]">
                        Procedure for submitting final release applications, regional officer physical audit verification, and Council clearance issuance.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDownloadNotice("Downloading Guidelines AICTE/Fin/Deposit-Release/2026/19 (PDF)...");
                        setTimeout(() => setDownloadNotice(null), 4000);
                      }}
                      className="px-3.5 py-2 rounded-lg border-2 border-slate-300 hover:bg-slate-100 text-[#0c2340] font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                </div>

              </div>
            </section>

          </div>

        </div>
      </div>

      {/* Floating Download Notification Toast */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0c2340] text-white text-xs font-semibold shadow-2xl flex items-center gap-3 border border-amber-400 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1">{downloadNotice}</span>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
