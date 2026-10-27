"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Building2, ShieldCheck, Clock, PlusCircle, RefreshCw, 
  Send, AlertTriangle, ShieldAlert, CheckCircle2, FileText, ArrowRight,
  GraduationCap, Landmark
} from "lucide-react";

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [myFdrs, setMyFdrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const instId = user?.institution_id || 1;

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, fdrsRes] = await Promise.all([
        fetchApi<any>(`/stats/institution-dashboard?institution_id=${instId}`),
        fetchApi<any[]>(`/fdrs/?institution_id=${instId}`),
      ]);
      setStats(statsRes);
      setMyFdrs(fdrsRes);
    } catch (err) {
      console.error("Institution dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Official College Accreditation Banner (Clean Light Government Layout) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-emerald-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
            <Building2 className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                AICTE APPROVED TECHNICAL INSTITUTION
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-600 font-mono font-medium">
                PERMANENT ID: {user?.aicte_id || "1-10294821"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 font-serif">
              {user?.institution_name || "Delhi Technological Institute"}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Statutory Security Deposit & Fixed Deposit Compliance Portal • Approval Process Handbook (APH)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => router.push("/institution/submit-fdr")}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Upload & Edit FDR
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all shadow-sm"
            title="Refresh Institutional Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {stats?.my_drafts_count > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 border-l-4 border-l-amber-600 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                DRAFTS PENDING DISPATCH: {stats.my_drafts_count} Instrument(s) Not Yet Sent to Admin
              </p>
              <p className="text-[11px] text-amber-900 mt-0.5">
                You have uploaded and edited {stats.my_drafts_count} FDR draft(s). These details will only reach the Central AICTE Scrutiny Admin once you officially submit them.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/institution/my-fdrs")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shrink-0 transition-all"
          >
            Review & Send to Admin &rarr;
          </button>
        </div>
      )}

      {/* 2. Official Regulatory Notice (if discrepancy flagged by AICTE) */}
      {stats?.my_action_required_count > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 border-l-4 border-l-rose-600 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                STATUTORY COMPLIANCE NOTICE: {stats.my_action_required_count} Instrument(s) Require Immediate Action
              </p>
              <p className="text-[11px] text-rose-900 mt-0.5">
                AICTE Scrutiny Officers have raised observations regarding certificate validity, maturity dates, or renewal replacement requirements.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/institution/my-fdrs")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shrink-0 transition-all"
          >
            Review Observations &rarr;
          </button>
        </div>
      )}

      {/* 3. Institutional Compliance KPI Cards (Clean Light Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pledged */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-blue-700 shadow-sm">
          <div className="text-slate-700 text-xs font-semibold">कुल प्रतिभूति राशि (Total Pledged)</div>
          <div className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
            {stats ? formatCurrency(stats.my_total_deposit) : "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Across <strong className="text-slate-900">{stats?.my_fdrs_count || 0}</strong> registered FDRs
          </div>
        </div>

        {/* Card 2: Verified Valid */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="text-slate-700 text-xs font-semibold">सत्यापित एवं वैध (Verified Valid)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5 font-mono">
            {stats?.my_verified_count ?? "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Joint lien confirmed with AICTE
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-amber-600 shadow-sm">
          <div className="text-slate-700 text-xs font-semibold">आगामी परिपक्वता (&le;30 Days)</div>
          <div className="text-2xl font-black text-amber-800 mt-1.5 font-mono">
            {stats?.upcoming_maturities_30d ?? "—"}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Replacement due</span>
            <button
              onClick={() => router.push("/institution/renewals")}
              className="text-blue-700 hover:underline font-bold"
            >
              Renew &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Compliance Status */}
        <div className="p-4 rounded-xl bg-white border border-slate-300 border-l-4 border-l-indigo-600 shadow-sm">
          <div className="text-slate-700 text-xs font-semibold">नियामक स्थिति (Compliance Standing)</div>
          <div className="text-lg font-black mt-1.5 flex items-center gap-2">
            {stats?.compliance_health === "Compliant" ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> COMPLIANT
              </span>
            ) : (
              <span className="text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" /> UNDER SCRUTINY
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            AICTE Regulatory Clearance Status
          </div>
        </div>

      </div>

      {/* 4. Action Hub (Official Portals Layout - Light Clean Cards) */}
      <div className="grid md:grid-cols-3 gap-4">
        
        <div 
          onClick={() => router.push("/institution/submit-fdr")}
          className="p-4 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 cursor-pointer transition-all shadow-sm group"
        >
          <div className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>प्रपत्र 1 • Form A</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Submit New FDR (Form A Submission)
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Upload scanned bank FDR certificate. System automatically extracts bank name, amount, reference, and maturity date.
          </p>
        </div>

        <div 
          onClick={() => router.push("/institution/renewals")}
          className="p-4 rounded-xl bg-white border border-slate-300 hover:border-blue-600 cursor-pointer transition-all shadow-sm group"
        >
          <div className="text-blue-700 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>प्रपत्र 2 • Form B</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            Renewal & Replacement Desk
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Link an expiring fixed deposit to a newly booked replacement receipt to maintain uncompromised compliance history.
          </p>
        </div>

        <div 
          onClick={() => router.push("/institution/release-request")}
          className="p-4 rounded-xl bg-white border border-slate-300 hover:border-indigo-600 cursor-pointer transition-all shadow-sm group"
        >
          <div className="text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>प्रपत्र 3 • Form C</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
            Security Deposit Refund Application
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Submit formal petition for deposit release upon fulfillment of affiliation tenure or autonomous conversion.
          </p>
        </div>

      </div>

      {/* 5. Institutional Pledged FDRs Table (Crisp Light Government Table) */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Registered Security Deposit Portfolio</span>
            </h2>
            <p className="text-[11px] text-slate-600">
              Official status of all fixed deposit receipts pledged in favor of Member Secretary, AICTE.
            </p>
          </div>
          <button
            onClick={() => router.push("/institution/my-fdrs")}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Manage Records ({myFdrs.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
              <tr>
                <th className="py-2.5 px-3">FDR Ref / ID</th>
                <th className="py-2.5 px-3">Issuing Bank & Branch</th>
                <th className="py-2.5 px-3">Deposit Value</th>
                <th className="py-2.5 px-3">Maturity Date</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3">AICTE Scrutiny Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {myFdrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No FDR records registered for this institution yet.
                  </td>
                </tr>
              ) : (
                myFdrs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{r.id}</span>
                      <div className="text-[11px] text-slate-600 font-mono">{r.fdr_number}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{r.issuing_bank}</div>
                      <div className="text-[10px] text-slate-500">{r.branch_name}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="text-slate-800">{r.maturity_date}</div>
                      <div className={`text-[10px] font-bold ${r.days_to_maturity < 0 ? "text-rose-700" : r.days_to_maturity <= 30 ? "text-amber-800" : "text-emerald-700"}`}>
                        {r.days_to_maturity < 0 ? `${Math.abs(r.days_to_maturity)}d overdue` : `${r.days_to_maturity}d left`}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.verification_status} />
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                      {r.verification_logs && r.verification_logs.length > 0
                        ? r.verification_logs[r.verification_logs.length - 1].remarks
                        : "Awaiting scrutiny review"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
