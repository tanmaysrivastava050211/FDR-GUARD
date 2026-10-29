"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  FileText, PlusCircle, RefreshCw, Clock, 
  ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight,
  Edit3, Send, Filter, Check
} from "lucide-react";

export default function MyFdrsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [fdrs, setFdrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "DRAFT" | "SUBMITTED" | "VERIFIED">("ALL");

  const instId = user?.institution_id || 1;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any[]>(`/fdrs/?institution_id=${instId}`);
      setFdrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Direct dispatch of a draft to admin
  const handleQuickSendToAdmin = async (fdrId: string) => {
    try {
      setSendingId(fdrId);
      setActionSuccess(null);
      await fetchApi<any>(
        `/fdrs/${fdrId}/send-to-admin?actor_name=${encodeURIComponent(user?.user_name || "Institutional Registrar")}`,
        { method: "POST" }
      );
      setActionSuccess(`FDR ${fdrId} has been successfully submitted to the AICTE Admin Scrutiny Bureau!`);
      await loadData();
    } catch (err: any) {
      alert(`Failed to send to admin: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const draftCount = fdrs.filter((r) => r.verification_status === "DRAFT").length;
  const submittedCount = fdrs.filter((r) => ["SUBMITTED", "UNDER_SCRUTINY", "AUTO_CHECKED_CLEAN", "FLAGGED_DISCREPANCY"].includes(r.verification_status)).length;
  const verifiedCount = fdrs.filter((r) => ["VERIFIED", "BANK_CONFIRMED"].includes(r.verification_status)).length;

  const filteredFdrs = fdrs.filter((r) => {
    if (selectedFilter === "DRAFT") return r.verification_status === "DRAFT";
    if (selectedFilter === "SUBMITTED") return ["SUBMITTED", "UNDER_SCRUTINY", "AUTO_CHECKED_CLEAN", "FLAGGED_DISCREPANCY"].includes(r.verification_status);
    if (selectedFilter === "VERIFIED") return ["VERIFIED", "BANK_CONFIRMED"].includes(r.verification_status);
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
            INSTITUTIONAL REGISTRATION REGISTER • SECTION 14
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] tracking-tight font-serif mt-0.5">
            Institutional Pledged FDR Portfolio
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload, edit, review, and track fixed deposit receipts pledged in compliance with AICTE Approval Process.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Success alert */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3 shadow-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="flex-1">{actionSuccess}</div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-800 hover:text-emerald-950 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* DRAFT REMINDER NOTICE */}
      {draftCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 border-l-4 border-l-amber-600 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <Edit3 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Notice: {draftCount} FDR Record(s) in Draft State
              </p>
              <p className="text-[11px] text-amber-900 mt-0.5">
                These instruments have been uploaded and edited, but <strong>have not been submitted to the AICTE Admin Scrutiny Desk yet</strong>. Edit details as needed and click &quot;Send to Admin&quot; to officially pledge them.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFilter("DRAFT")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shrink-0 shadow-sm transition-all flex items-center gap-1.5"
          >
            Filter Drafts ({draftCount}) &rarr;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 pb-2">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedFilter === "ALL"
              ? "bg-[#0c2340] text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          All Records ({fdrs.length})
        </button>

        <button
          onClick={() => setSelectedFilter("DRAFT")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedFilter === "DRAFT"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Drafts (Not Sent to Admin) ({draftCount})
        </button>

        <button
          onClick={() => setSelectedFilter("SUBMITTED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedFilter === "SUBMITTED"
              ? "bg-blue-800 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Submitted to Admin ({submittedCount})
        </button>

        <button
          onClick={() => setSelectedFilter("VERIFIED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedFilter === "VERIFIED"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
          }`}
        >
          Verified & Pledged ({verifiedCount})
        </button>
      </div>

      {/* Table (Crisp Light Government Layout) */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4">FDR Record</th>
                <th className="py-3 px-4">Issuing Bank & Branch</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Maturity Date</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Administrative Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading your institutional records...
                  </td>
                </tr>
              ) : filteredFdrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No FDR records match the selected filter. Click &quot;Upload &amp; Edit FDR&quot; to register a new instrument.
                  </td>
                </tr>
              ) : (
                filteredFdrs.map((r) => {
                  const isDraft = r.verification_status === "DRAFT";
                  return (
                    <tr 
                      key={r.id} 
                      className={`hover:bg-slate-50 transition-colors ${isDraft ? "bg-amber-50/30" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {r.id}
                          {isDraft && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                              DRAFT
                            </span>
                          )}
                          {r.is_duplicate && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                              DUPLICATE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">Ref: {r.fdr_number}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{r.issuing_bank}</div>
                        <div className="text-[10px] text-slate-500">{r.branch_name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm font-mono">
                        {formatCurrency(r.amount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-800">{r.maturity_date}</div>
                        <div className={`text-[10px] font-bold ${r.days_to_maturity < 0 ? "text-rose-700" : r.days_to_maturity <= 30 ? "text-amber-800" : "text-emerald-700"}`}>
                          {r.days_to_maturity < 0 ? `${Math.abs(r.days_to_maturity)} days overdue` : `${r.days_to_maturity} days left`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={r.verification_status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={r.administrative_status} type="administrative" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          
                          {/* If Draft: Edit & Quick Send buttons */}
                          {isDraft ? (
                            <>
                              <button
                                onClick={() => router.push(`/institution/submit-fdr?edit_id=${r.id}`)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all flex items-center gap-1"
                                title="Edit Instrument Details"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleQuickSendToAdmin(r.id)}
                                disabled={sendingId === r.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all flex items-center gap-1"
                                title="Transmit this FDR to AICTE Admin Scrutiny"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {sendingId === r.id ? "Sending..." : "Send to Admin"}
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Always provide Edit option */}
                              <button
                                onClick={() => router.push(`/institution/submit-fdr?edit_id=${r.id}`)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all flex items-center gap-1"
                                title="Edit Instrument Details"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                Edit
                              </button>

                              {/* Renewal or Release actions if applicable */}
                              {r.days_to_maturity <= 30 && r.administrative_status !== "RELEASED" ? (
                                <button
                                  onClick={() => router.push(`/institution/renewals?fdr_id=${r.id}`)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all inline-flex items-center gap-1"
                                >
                                  Renew
                                </button>
                              ) : (
                                <button
                                  onClick={() => router.push(`/institution/release-request?fdr_id=${r.id}`)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all inline-flex items-center gap-1"
                                >
                                  Release
                                </button>
                              )}
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
