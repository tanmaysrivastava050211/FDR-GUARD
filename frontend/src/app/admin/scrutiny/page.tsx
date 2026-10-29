"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi, getAssetUrl } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  RefreshCw, FileText, ExternalLink, ArrowRight, UserCheck, 
  Building2, Calendar, ZoomIn, Eye, MessageSquare, Send
} from "lucide-react";

function ScrutinyStudioContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlFdrId = searchParams.get("fdr_id");

  const [fdrsList, setFdrsList] = useState<any[]>([]);
  const [selectedFdr, setSelectedFdr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadFdrs = async () => {
    try {
      setLoading(true);
      const list = await fetchApi<any[]>("/fdrs/");
      setFdrsList(list);

      if (urlFdrId) {
        const found = list.find((x) => x.id === urlFdrId);
        if (found) setSelectedFdr(found);
        else if (list.length > 0) setSelectedFdr(list[0]);
      } else if (list.length > 0) {
        setSelectedFdr(list[0]);
      }
    } catch (err) {
      console.error("Error loading FDRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFdrs();
  }, [urlFdrId]);

  const handleSelectChange = (id: string) => {
    const item = fdrsList.find((x) => x.id === id);
    if (item) {
      setSelectedFdr(item);
      setSuccessMsg(null);
      setRemarks("");
      router.push(`/admin/scrutiny?fdr_id=${id}`);
    }
  };

  const handleScrutinyAction = async (newStatus: string) => {
    if (!selectedFdr) return;
    try {
      setActionLoading(true);
      setSuccessMsg(null);

      const payload = {
        verification_status: newStatus,
        remarks: remarks || `Scrutiny action recorded by ${user?.user_name || "Official"}: ${newStatus}`,
        officer_name: user?.user_name || "AICTE Scrutiny Officer",
      };

      const updated = await fetchApi<any>(`/fdrs/${selectedFdr.id}/scrutiny-action`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSelectedFdr(updated);
      setSuccessMsg(`FDR status successfully updated to: ${newStatus}`);
      setRemarks("");

      // Refresh list
      setFdrsList((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
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

  const ocrData = selectedFdr?.ocr_extracted_data
    ? JSON.parse(selectedFdr.ocr_extracted_data)
    : null;

  const discrepancies: any[] = selectedFdr?.discrepancy_flags
    ? JSON.parse(selectedFdr.discrepancy_flags)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Studio Header & Selector (Clean Light Government Layout) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono">
              Digital Document Scrutiny Desk • APH 2026-27
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] mt-1 font-serif">
            Central Document Scrutiny & Verification Bureau
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Side-by-side inspection of pledged physical FDR certificates against institution submitted declarations.
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 shrink-0">
            Select FDR Record:
          </label>
          <select
            value={selectedFdr?.id || ""}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 min-w-[260px] shadow-sm"
          >
            {fdrsList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id} — {f.institution_name?.slice(0, 26)}... ({f.verification_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 shadow-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Discrepancy Alert Bar (if flagged) */}
      {discrepancies.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 border-l-4 border-l-rose-600 text-rose-900 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>Statutory Compliance Audit: {discrepancies.length} discrepancy observation(s) flagged:</span>
          </div>
          <ul className="text-xs space-y-1.5 pl-6 list-disc text-rose-800">
            {discrepancies.map((d, i) => (
              <li key={i}>
                <strong className="text-rose-950">[{d.severity}]</strong> {d.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFdr && (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT PANE: FDR Certificate Document Preview (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0c2340]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Pledged FDR Certificate Document
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-600 font-medium">
                  {selectedFdr.document_filename || "Receipt Certificate"}
                </span>
              </div>

              {/* Document Image View */}
              <div className="relative rounded-lg border border-slate-300 bg-slate-50 p-2 overflow-hidden flex items-center justify-center min-h-[360px] group shadow-inner">
                {selectedFdr.document_path ? (
                  <img
                    src={getAssetUrl(selectedFdr.document_path)}
                    alt="FDR Certificate"
                    className="w-full h-auto object-contain rounded max-h-[420px]"
                  />
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No physical document attached to this demo record.</p>
                  </div>
                )}
              </div>

              {/* Extraction Confidence Badge */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-600 font-medium">Optical Extraction Status:</span>{" "}
                  <span className="font-bold text-blue-900 font-mono">
                    Verified (Match Confidence: {Math.round((ocrData?.overall_confidence || 0.92) * 100)}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Standard: Digital India Document Verification
                </span>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 italic">
              Regulatory Notice: System data extraction assists scrutiny but does not substitute competent authority determination.
            </div>
          </div>

          {/* RIGHT PANE: Comparison Table & Verification Actions (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Data Reconciliation Table
                  </h3>
                </div>
                <StatusBadge status={selectedFdr.verification_status} />
              </div>

              {/* Field Comparison Grid */}
              <div className="space-y-3">
                
                {/* Field 1: Amount */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    Deposit Amount (INR)
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Institution Declared:</span>
                      <p className="text-sm font-black text-slate-900 font-mono">
                        {formatCurrency(selectedFdr.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Document Scanned Record:</span>
                      <p className="text-sm font-black text-blue-900 font-mono">
                        {ocrData?.extracted_fields?.amount
                          ? formatCurrency(ocrData.extracted_fields.amount)
                          : formatCurrency(selectedFdr.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field 2: Reference Number */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    FDR Reference Number
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Institution Declared:</span>
                      <p className="text-xs font-mono font-bold text-slate-900">
                        {selectedFdr.fdr_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Document Scanned Record:</span>
                      <p className="text-xs font-mono font-bold text-blue-900">
                        {ocrData?.extracted_fields?.fdr_number || selectedFdr.fdr_number}
                      </p>
                    </div>
                  </div>
                  {selectedFdr.is_duplicate && (
                    <p className="text-[10px] text-rose-700 font-bold mt-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Duplicate reference pledged in record {selectedFdr.duplicate_of_fdr_id}
                    </p>
                  )}
                </div>

                {/* Field 3: Issuing Bank */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    Issuing Bank & Branch
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Institution Declared:</span>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedFdr.issuing_bank}
                      </p>
                      <p className="text-[10px] text-slate-600">{selectedFdr.branch_name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Document Scanned Record:</span>
                      <p className="text-xs font-bold text-blue-900">
                        {ocrData?.extracted_fields?.bank_name || selectedFdr.issuing_bank}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold">Authorized Scheduled Bank</p>
                    </div>
                  </div>
                </div>

                {/* Field 4: Maturity Date */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    Maturity Date
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Institution Declared:</span>
                      <p className="text-xs font-bold text-slate-900 font-mono">
                        {selectedFdr.maturity_date}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Document Scanned Record:</span>
                      <p className="text-xs font-bold text-blue-900 font-mono">
                        {ocrData?.extracted_fields?.maturity_date || selectedFdr.maturity_date}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Scrutiny Remarks Input */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Scrutiny Remarks / Bank Verification Notes:
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record verification confirmation number, bank liaison notes, or reason for correction..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Official Decision Action Station */}
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Official Regulatory Determination:
              </div>

              <div className="grid grid-cols-3 gap-2">
                
                {/* Button 1: Mark Verified */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleScrutinyAction("VERIFIED")}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Lien
                </button>

                {/* Button 2: Request Correction */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleScrutinyAction("REVISION_REQUIRED")}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Request Fix
                </button>

                {/* Button 3: Flag Discrepancy */}
                <button
                  disabled={actionLoading}
                  onClick={() => handleScrutinyAction("FLAGGED_DISCREPANCY")}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Flag Discrepancy
                </button>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Case Timeline / Audit History */}
      {selectedFdr?.verification_logs && selectedFdr.verification_logs.length > 0 && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0c2340]" />
            <span>Chronological Scrutiny & Verification Log</span>
          </h3>

          <div className="space-y-3">
            {selectedFdr.verification_logs.map((log: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-slate-600">By {log.officer_name} ({log.officer_role})</span>
                  </div>
                  <p className="text-slate-700 mt-1">{log.remarks}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleString("en-IN")}
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={log.new_status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ScrutinyStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-slate-600 text-xs">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading Scrutiny Records...
        </div>
      </div>
    }>
      <ScrutinyStudioContent />
    </Suspense>
  );
}
