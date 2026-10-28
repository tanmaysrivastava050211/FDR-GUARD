"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, Building2, Lock, Mail, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound,
  GraduationCap, AlertTriangle, RefreshCw, Eye, EyeOff,
  Landmark, ShieldAlert, Check, Volume2, Shield, Info, HelpCircle
} from "lucide-react";

function LoginContent() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || searchParams.get("portal");

  // Unified Form state
  const isInitialInstitution = tabParam === "institution" || tabParam === "institute";
  const [identifier, setIdentifier] = useState(isInitialInstitution ? "delhi@college.edu.in" : "admin@aicte.india.org");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin" || user.role === "scrutiny_officer") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/institution/dashboard");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (tabParam === "institution" || tabParam === "institute") {
      setIdentifier("delhi@college.edu.in");
    } else if (tabParam === "admin" || tabParam === "aicte") {
      setIdentifier("admin@aicte.india.org");
    }
  }, [tabParam]);

  // CAPTCHA simulation (NIC standard requirement)
  const [captchaCode, setCaptchaCode] = useState("8N4K9");
  const [enteredCaptcha, setEnteredCaptcha] = useState("8N4K9");

  const [error, setError] = useState<string | null>(null);

  // Check if identifier is AICTE Official
  const cleanId = identifier.trim().toLowerCase();
  const isAdminDomain = cleanId.endsWith("@aicte.india.org") || cleanId.endsWith("@aicte-india.org") || cleanId.includes("@aicte") || cleanId.includes("aicte");

  const regenerateCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(res);
    setEnteredCaptcha(res);
  };

  const speakCaptcha = () => {
    if ("speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance(captchaCode.split("").join(" "));
      window.speechSynthesis.speak(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!identifier.trim()) {
      setError("Please enter your registered email address or AICTE Permanent Institute ID.");
      return;
    }

    if (enteredCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Invalid CAPTCHA code. Please enter the characters shown in the security box.");
      return;
    }

    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Verify your email or institute credentials.");
    }
  };

  const setPreset = (emailVal: string) => {
    setIdentifier(emailVal);
    setPassword("demo123");
    setError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-160px)] w-full py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Background Watermark */}
      <div 
        className="fixed inset-0 bg-cover bg-center -z-10 mix-blend-multiply opacity-15 pointer-events-none"
        style={{ backgroundImage: `url('/govt-bg.jpg')` }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-slate-100/95 via-slate-100/98 to-slate-200 -z-10 pointer-events-none" />

      {/* Return to Home link */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 font-bold text-[#0c2340] hover:text-blue-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
          <span>मुख्य पृष्ठ (Return to Public Home)</span>
        </Link>
        <span className="text-slate-500 font-mono text-[11px]">AICTE APH 2026-27</span>
      </div>

      {/* Unified Government Login Card */}
      <div className="w-full max-w-xl bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden border-t-4 border-t-amber-500">
        
        {/* Emblem & Titles */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
          <div className="w-14 h-18 mx-auto mb-2 flex items-center justify-center">
            <img src="/emblem.png" alt="Emblem of India" className="h-16 w-auto object-contain filter drop-shadow-xs" />
          </div>
          
          <div className="text-[11px] font-black text-amber-800 uppercase tracking-widest font-mono">
            भारत सरकार • अखिल भारतीय तकनीकी शिक्षा परिषद
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight font-serif uppercase leading-tight mt-1">
            AICTE FDR-GUARD Sign-In
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Centralized Fixed Deposit Receipt &amp; Joint-Lien Oversight Portal
          </p>
        </div>

        {/* Interactive Portal Switcher */}
        <div className="p-3 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
            <span>Select Signing Portal:</span>
            <span className="font-mono text-slate-500">
              {isAdminDomain ? "AICTE Scrutiny Domain" : "Institutional Campus Domain"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIdentifier("admin@aicte.india.org");
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAdminDomain
                  ? "bg-[#0c2340] text-white shadow-xs border-2 border-[#0c2340]"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdminDomain ? "text-amber-400" : "text-slate-500"}`} />
              <span>AICTE Directorate Desk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier("delhi@college.edu.in");
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isAdminDomain
                  ? "bg-[#166534] text-white shadow-xs border-2 border-[#166534]"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300"
              }`}
            >
              <Building2 className={`w-4 h-4 ${!isAdminDomain ? "text-emerald-200" : "text-slate-500"}`} />
              <span>Technical Institution Desk</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Email / Institute ID */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Official Email ID / Permanent Institute ID *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. director@aicte.india.org or 1-10294821 or college@edu.in"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Emails ending with <strong className="text-blue-900 font-mono">@aicte.india.org</strong> log in to Admin. All others route to Institution.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Authorized Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CAPTCHA Box (NIC standard) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Security Verification:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={regenerateCaptcha}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={speakCaptcha}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Audio CAPTCHA"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-900 text-amber-300 font-black tracking-widest text-lg font-mono rounded-lg select-none border border-slate-700 shadow-inner">
                {captchaCode}
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredCaptcha}
                onChange={(e) => setEnteredCaptcha(e.target.value.toUpperCase())}
                placeholder="Enter text above"
                className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-xs uppercase focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              isAdminDomain 
                ? "bg-[#0c2340] hover:bg-[#163a66]" 
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            {isLoading ? "Authenticating Official Identity..." : (
              isAdminDomain ? "Sign In to Council Admin Scrutiny Portal" : "Sign In to Technical Institution Portal"
            )}
          </button>

          {/* Quick Preset Hints */}
          <div className="pt-2 border-t border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
              Quick Fill Demo Credentials:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreset("admin@aicte.india.org")}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-mono font-semibold"
              >
                admin@aicte.india.org (Admin)
              </button>
              <button
                type="button"
                onClick={() => setPreset("delhi@college.edu.in")}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-mono font-semibold"
              >
                delhi@college.edu.in (Institution)
              </button>
              <button
                type="button"
                onClick={() => setPreset("1-10294821")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-mono font-semibold"
              >
                1-10294821 (Permanent ID)
              </button>
            </div>
          </div>

        </form>

        {/* Footer Notice */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono">
          Security standard compliant with Indian CERT-In guidelines • AICTE APH 2026-27
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 text-sm font-semibold">
        Loading AICTE Official Gateway...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
