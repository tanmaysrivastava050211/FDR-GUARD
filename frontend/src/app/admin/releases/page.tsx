"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { 
  Send, ShieldCheck, CheckCircle2, XCircle, 
  Clock, AlertTriangle, FileText, Building2, ExternalLink
} from "lucide-react";

export default function ReleaseApprovalsPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [actionRemarks, setActionRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<any[]>("/releases/");
      setRequests(data);
      if (data.length > 0 && !selectedReq) {
        setSelectedReq(data[0]);
      }
    } catch (err) {
      console.error("Error loading release requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (decision: "APPROVED" | "REJECTED" | "REGIONAL_DIRECTOR_CLEARED") => {
    if (!selectedReq) return;
    try {
      setActionLoading(true);
      const res = await fetchApi<any>(`/releases/${selectedReq.id}/action`, {
        method: "POST",
        body: JSON.stringify({
          action: decision,
          remarks: actionRemarks || `Determination recorded by ${user?.user_name || "Official"}: ${decision}`,
          officer_name: user?.user_name || "AICTE Director (Approval)",
        }),
      });

      setSelectedReq(res);
      setActionRemarks("");
      await loadRequests();
    } catch (err: any) {
      alert(`Determination failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header (Clean Light Government Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              CONTROLLED RELEASE AUTHORIZATION WORKFLOW • APH 2026-27
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] mt-1 font-serif">
            Security Deposit Refund & Release Desk
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Clearance verification before releasing FDR liens or refunding security deposits to applicant institutions.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Request Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Pending Release Applications ({requests.length})</span>
          </h2>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No release requests registered.</p>
            ) : (
              requests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReq(r);
                      setActionRemarks("");
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="font-semibold text-slate-900 text-xs mt-1">
                      {r.institution_name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                      <span>FDR: {r.fdr_id}</span>
                      <span className="font-bold text-slate-900 font-mono">{formatCurrency(r.fdr_amount || 0)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Clearance Evaluation & Decision (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          {selectedReq ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider font-mono">
                    Scrutiny Dossier
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedReq.id} — {selectedReq.institution_name}
                  </h3>
                </div>
                <StatusBadge status={selectedReq.status} />
              </div>

              {/* Clearance Checklist */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  5-Stage Regulatory Clearance Verification
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Minimum 10-Yr Affiliation Complete
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Standing Penalties or Complaints
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Governing Body Resolution Attached
                  </div>
                  <div className="flex items-center gap-2 text-blue-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Regional Directorate Clearance
                  </div>
                </div>
              </div>

              {/* Institution Details & Refund Bank */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">FDR Guarantee</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedReq.fdr_id} ({selectedReq.fdr_bank})</p>
                  <p className="font-black text-blue-900 text-sm mt-0.5 font-mono">{formatCurrency(selectedReq.fdr_amount || 0)}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Refund Destination Account</span>
                  <p className="font-mono text-slate-900 mt-0.5">A/C: {selectedReq.bank_account_no}</p>
                  <p className="text-[11px] text-slate-600">{selectedReq.bank_name} • IFSC: {selectedReq.ifsc_code}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Stated Reason for Release:</span>
                <p className="text-slate-800 mt-1">{selectedReq.reason}</p>
                <div className="mt-2 text-[11px] text-blue-700 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Attached: {selectedReq.supporting_doc_name || "Resolution_NOC.pdf"}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competent Authority Remarks / Gazette Order Reference:
                </label>
                <textarea
                  rows={2}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter order reference or clearance condition details..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("APPROVED")}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Refund Release
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("REGIONAL_DIRECTOR_CLEARED")}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Regional Office Clearance
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("REJECTED")}
                  className="py-2.5 px-4 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Reject
                </button>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              Select an application on the left to evaluate clearances.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
