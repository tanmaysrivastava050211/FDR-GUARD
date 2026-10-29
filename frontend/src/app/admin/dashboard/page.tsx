"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Building2, ShieldCheck, ShieldAlert, AlertTriangle, 
  Clock, ArrowUpRight, CheckCircle2, TrendingUp, RefreshCw, 
  FileText, ExternalLink, ChevronRight, Layers, Award, Landmark
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [priorityFdrs, setPriorityFdrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, fdrsRes] = await Promise.all([
        fetchApi<any>("/stats/admin-dashboard"),
        fetchApi<any[]>("/fdrs/?urgency=flagged"),
      ]);
      setStats(statsRes);
      setPriorityFdrs(fdrsRes.slice(0, 6));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Official Regulatory Header Banner (Light Government Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              DIRECTORATE OF APPROVAL • ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-600 font-medium">GOVT. OF INDIA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0c2340] mt-1 font-serif tracking-tight">
            National Security Deposit & Fixed Deposit Oversight Console
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time compliance monitoring, statutory document reconciliation, and joint lien management under APH 2026-27.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => router.push("/admin/scrutiny")}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Document Scrutiny Bureau
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all shadow-sm"
            title="Refresh National Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Discrepancy & Fraud Detection Bulletin (Clean Government Alert) */}
      {stats?.discrepancy_flagged > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 border-l-4 border-l-rose-600 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                STATUTORY ALERT: {stats.discrepancy_flagged} Instrument(s) Flagged for Regulatory Discrepancy
              </p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Automated regulatory audit identified duplicate instrument references or certificate amount mismatches. Immediate scrutiny required under APH Regulation 4.2.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin/scrutiny")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shrink-0 transition-all"
          >
            Open Scrutiny Dossier &rarr;
          </button>
        </div>
      )}

      {/* 3. Executive KPI Cards (Clean Light Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Corpus */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>कुल प्रतिभूति निक्षेप (Total Corpus)</span>
            <span className="font-bold text-[#0c2340] font-mono">₹ INR</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
            {stats ? formatCurrency(stats.total_deposit_amount) : "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Across <strong className="text-slate-900">{stats?.total_fdrs || 0}</strong> pledged bank instruments
          </div>
        </div>

        {/* Card 2: Verified Valid */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>सत्यापित एवं वैध (Verified Valid)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5 font-mono">
            {stats?.verified_fdrs ?? "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Confirmed joint lien with AICTE
          </div>
        </div>

        {/* Card 3: Maturing Soon */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-amber-600 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>आगामी परिपक्वता (&le;30 Days)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1.5 font-mono">
            {stats?.maturing_30_days ?? "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Advance notices issued</span>
            <button
              onClick={() => router.push("/admin/maturity")}
              className="text-amber-800 hover:underline font-bold"
            >
              Maturity Engine &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Release Clearances */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-blue-600 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>प्रलंबित निकासी (Clearances)</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1.5 font-mono">
            {stats?.release_requests_pending ?? "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Refund applications pending</span>
            <button
              onClick={() => router.push("/admin/releases")}
              className="text-blue-700 hover:underline font-bold"
            >
              Clear &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 4. Main Administrative Section: Scrutiny Queue & Bank Breakdowns */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Scrutiny Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#0c2340]" />
                <span>Priority Regulatory Scrutiny Docket</span>
              </h2>
              <p className="text-[11px] text-slate-600">
                Instruments requiring administrative verification, renewal validation, or discrepancy show-cause.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/repository")}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              All Records ({stats?.total_fdrs || 0}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Sr. / FDR ID</th>
                  <th className="py-2.5 px-3">Approved Institution</th>
                  <th className="py-2.5 px-3">Deposit Value</th>
                  <th className="py-2.5 px-3">Maturity Date</th>
                  <th className="py-2.5 px-3">Scrutiny Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {priorityFdrs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No high-priority scrutiny flags right now.
                    </td>
                  </tr>
                ) : (
                  priorityFdrs.map((fdr, idx) => (
                    <tr key={fdr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{fdr.id}</span>
                        <div className="text-[11px] text-slate-600 font-mono">{fdr.fdr_number}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{fdr.institution_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">AICTE: {fdr.aicte_id}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        {formatCurrency(fdr.amount)}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-800">{fdr.maturity_date}</div>
                        <div className={`text-[10px] font-bold ${fdr.days_to_maturity < 0 ? "text-rose-700" : "text-amber-800"}`}>
                          {fdr.days_to_maturity < 0
                            ? `${Math.abs(fdr.days_to_maturity)}d overdue`
                            : `${fdr.days_to_maturity}d left`}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={fdr.verification_status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => router.push(`/admin/scrutiny?fdr_id=${fdr.id}`)}
                          className="px-2.5 py-1 rounded bg-[#0c2340] hover:bg-[#163a66] text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Scrutinize
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issuing Banks Distribution (1 col) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 pb-3 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-[#0c2340]" />
              <h2 className="text-sm font-bold text-slate-900">
                Authorized Commercial Bank Portfolios
              </h2>
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Fixed deposits pledged under joint lien with Member Secretary, AICTE.
            </p>

            <div className="space-y-2.5">
              {stats?.bank_distribution?.map((b: any) => (
                <div key={b.bank} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{b.bank}</span>
                    <span className="font-bold text-slate-900 font-mono">{formatCurrency(b.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                    <span>{b.count} FDR receipt(s)</span>
                    <span className="text-emerald-700 font-semibold text-[10px]">Active Joint Lien</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900">
            <span className="font-bold text-amber-900 block mb-0.5">Joint Lien Regulatory Mandate:</span>
            As per AICTE Approval Process Handbook (APH), all security deposits are held under joint encumbrance and cannot be liquidated without prior council clearance.
          </div>
        </div>

      </div>

    </div>
  );
}
