"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Clock, AlertTriangle, ShieldAlert, CheckCircle2, 
  RefreshCw, Play, Building2, Send, Calendar, 
  ExternalLink, Mail, Bell, ShieldCheck, ArrowRight, Info
} from "lucide-react";

export default function MaturityEnginePage() {
  const router = useRouter();

  const [trackerRecords, setTrackerRecords] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [filterStage, setFilterStage] = useState<"ALL" | "OVERDUE" | "URGENT" | "ADVANCE" | "HEALTHY">("ALL");
  const [engineResult, setEngineResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trackerData, remindersData] = await Promise.all([
        fetchApi<any[]>("/maturity/tracker"),
        fetchApi<any[]>("/maturity/reminders?limit=50"),
      ]);
      setTrackerRecords(trackerData);
      setReminders(remindersData);
    } catch (err) {
      console.error("Error loading maturity engine data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunEngine = async () => {
    try {
      setTriggering(true);
      setEngineResult(null);
      const res = await fetchApi<any>("/maturity/trigger-reminders", {
        method: "POST",
      });
      setEngineResult(res);
      await loadData();
    } catch (err: any) {
      alert(`Automated engine evaluation failed: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const overdueList = trackerRecords.filter((r) => r.days_to_maturity < 0);
  const urgentList = trackerRecords.filter((r) => r.days_to_maturity >= 0 && r.days_to_maturity <= 15);
  const advanceList = trackerRecords.filter((r) => r.days_to_maturity > 15 && r.days_to_maturity <= 30);
  const healthyList = trackerRecords.filter((r) => r.days_to_maturity > 30);

  const filteredRecords = trackerRecords.filter((r) => {
    if (filterStage === "OVERDUE") return r.days_to_maturity < 0;
    if (filterStage === "URGENT") return r.days_to_maturity >= 0 && r.days_to_maturity <= 15;
    if (filterStage === "ADVANCE") return r.days_to_maturity > 15 && r.days_to_maturity <= 30;
    if (filterStage === "HEALTHY") return r.days_to_maturity > 30;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              REGULATORY ESCALATION &amp; LIFECYCLE OVERSIGHT • APH 2026-27
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-600 font-medium">AUTOMATED NOTIFICATION ENGINE</span>
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] mt-1 font-serif tracking-tight">
            Maturity &amp; Escalation Monitoring Engine
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Continuous chronological surveillance of security deposit tenure with multi-tier policy alerts (30-day, 15-day, and overdue escalation).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRunEngine}
            disabled={triggering}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] disabled:bg-slate-400 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {triggering ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            )}
            <span>{triggering ? "Evaluating Compliance Rules..." : "Run Reminder Engine Now"}</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all shadow-sm cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Engine Execution Result Banner */}
      {engineResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900">
              {engineResult.message}
            </p>
            <div className="flex flex-wrap gap-4 mt-1.5 text-slate-700 font-mono text-[11px]">
              <span>Evaluated Instruments: <strong className="text-slate-950 font-bold">{engineResult.details?.evaluated_instruments ?? 0}</strong></span>
              <span>•</span>
              <span>Status Transitions: <strong className="text-blue-900 font-bold">{engineResult.details?.status_transitions ?? 0}</strong></span>
              <span>•</span>
              <span>Policy Notices Dispatched: <strong className="text-emerald-900 font-bold">{engineResult.details?.reminders_dispatched ?? 0}</strong></span>
            </div>
          </div>
          <button
            onClick={() => setEngineResult(null)}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Overdue Escalated */}
        <div 
          onClick={() => setFilterStage("OVERDUE")}
          className={`p-4 rounded-xl border border-l-4 cursor-pointer transition-all shadow-sm ${
            filterStage === "OVERDUE" 
              ? "bg-rose-50/80 border-rose-400 border-l-rose-700 ring-2 ring-rose-300" 
              : "bg-white border-slate-300 border-l-rose-600 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>अतिदेय / चूक (Overdue)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1.5 font-mono">
            {overdueList.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Escalated to Regional Officer</span>
            <span className="font-bold text-rose-700 text-[10px]">Lapse Risk</span>
          </div>
        </div>

        {/* Card 2: Urgent (1-15 Days) */}
        <div 
          onClick={() => setFilterStage("URGENT")}
          className={`p-4 rounded-xl border border-l-4 cursor-pointer transition-all shadow-sm ${
            filterStage === "URGENT" 
              ? "bg-amber-50/80 border-amber-400 border-l-amber-700 ring-2 ring-amber-300" 
              : "bg-white border-slate-300 border-l-amber-600 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>अत्यावश्यक (1–15 Days)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1.5 font-mono">
            {urgentList.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Urgent notice dispatched</span>
            <span className="font-bold text-amber-800 text-[10px]">Action Req.</span>
          </div>
        </div>

        {/* Card 3: Advance Advisory (16-30 Days) */}
        <div 
          onClick={() => setFilterStage("ADVANCE")}
          className={`p-4 rounded-xl border border-l-4 cursor-pointer transition-all shadow-sm ${
            filterStage === "ADVANCE" 
              ? "bg-blue-50/80 border-blue-400 border-l-blue-700 ring-2 ring-blue-300" 
              : "bg-white border-slate-300 border-l-blue-600 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>अग्रिम सूचना (16–30 Days)</span>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1.5 font-mono">
            {advanceList.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Advance notice to Director</span>
            <span className="font-bold text-blue-700 text-[10px]">Tracked</span>
          </div>
        </div>

        {/* Card 4: Healthy (>30 Days) */}
        <div 
          onClick={() => setFilterStage("HEALTHY")}
          className={`p-4 rounded-xl border border-l-4 cursor-pointer transition-all shadow-sm ${
            filterStage === "HEALTHY" 
              ? "bg-emerald-50/80 border-emerald-400 border-l-emerald-700 ring-2 ring-emerald-300" 
              : "bg-white border-slate-300 border-l-emerald-600 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>सक्रिय सुरक्षा (&gt;30 Days)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5 font-mono">
            {healthyList.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
            <span>Active joint lien compliant</span>
            <span className="font-bold text-emerald-700 text-[10px]">Compliant</span>
          </div>
        </div>

      </div>

      {/* 3. Visual 4-Stage Regulatory Escalation Protocol */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0c2340]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              AICTE Statutory 4-Stage Deposit Escalation Protocol (APH 2026-27 Clause 4.9)
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Automated Daily Evaluation Cycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between font-bold text-blue-900 mb-1">
              <span>Stage 1: 30 Days</span>
              <span className="text-[10px] bg-blue-200/80 px-1.5 py-0.2 rounded font-mono">ADVISORY</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Automated advisory transmitted to College Chairman &amp; Principal to initiate bank renewal liaison.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
              <span>Stage 2: 15 Days</span>
              <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.2 rounded font-mono">URGENT</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Urgent compliance prompt to prevent lapse of AICTE institutional approval and joint security encumbrance.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between font-bold text-rose-900 mb-1">
              <span>Stage 3: Day 0 (Due)</span>
              <span className="text-[10px] bg-rose-200/80 px-1.5 py-0.2 rounded font-mono">ACTION DUE</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              FDR matures on this day. Replacement FDR submission (Form B) or refund clearance petition required.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-red-100/70 border border-red-300">
            <div className="flex items-center justify-between font-bold text-red-950 mb-1">
              <span>Stage 4: Overdue</span>
              <span className="text-[10px] bg-red-200 px-1.5 py-0.2 rounded font-mono font-black">ESCALATED</span>
            </div>
            <p className="text-[11px] text-slate-800 leading-relaxed">
              Formal non-compliance escalation to AICTE Regional Directorate with notice of statutory show-cause.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Monitored FDR Records Table */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Header & Stage Filter Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Security Deposit Tenure Registry
            </h2>
            <p className="text-[11px] text-slate-600">
              Displaying <strong className="text-slate-900">{filteredRecords.length}</strong> of {trackerRecords.length} active regulatory instruments.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-300 text-xs">
            <button
              onClick={() => setFilterStage("ALL")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                filterStage === "ALL" 
                  ? "bg-[#0c2340] text-white shadow-2xs" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              All Records ({trackerRecords.length})
            </button>
            <button
              onClick={() => setFilterStage("OVERDUE")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                filterStage === "OVERDUE" 
                  ? "bg-rose-700 text-white shadow-2xs" 
                  : "text-rose-800 hover:bg-rose-50"
              }`}
            >
              Overdue ({overdueList.length})
            </button>
            <button
              onClick={() => setFilterStage("URGENT")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                filterStage === "URGENT" 
                  ? "bg-amber-700 text-white shadow-2xs" 
                  : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Urgent &le;15d ({urgentList.length})
            </button>
            <button
              onClick={() => setFilterStage("ADVANCE")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                filterStage === "ADVANCE" 
                  ? "bg-blue-700 text-white shadow-2xs" 
                  : "text-blue-800 hover:bg-blue-50"
              }`}
            >
              16–30d ({advanceList.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4">FDR Record</th>
                <th className="py-3 px-4">Approved Institution</th>
                <th className="py-3 px-4">Bank &amp; Branch</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4">Maturity Date</th>
                <th className="py-3 px-4">Timeline Span</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading maturity records from database...</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No FDR instruments match the selected maturity filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isOverdue = r.days_to_maturity < 0;
                  const isUrgent = r.days_to_maturity >= 0 && r.days_to_maturity <= 15;
                  const isAdvance = r.days_to_maturity > 15 && r.days_to_maturity <= 30;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{r.id}</span>
                        <div className="text-[11px] text-slate-600 font-mono">Ref: {r.fdr_number}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.institution_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">AICTE: {r.aicte_id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.issuing_bank}</div>
                        <div className="text-[10px] text-slate-500">{r.branch_name}</div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(r.amount)}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-medium text-slate-900">{r.maturity_date}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          Issued: {r.issue_date}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOverdue 
                            ? "bg-rose-100 text-rose-800 border border-rose-300" 
                            : isUrgent 
                            ? "bg-amber-100 text-amber-900 border border-amber-300" 
                            : isAdvance 
                            ? "bg-blue-100 text-blue-900 border border-blue-300" 
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}>
                          {isOverdue 
                            ? `${Math.abs(r.days_to_maturity)}d Overdue` 
                            : `${r.days_to_maturity}d Remaining`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={r.administrative_status} type="administrative" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/scrutiny?fdr_id=${r.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. Escalation & Dispatched Policy Notices Drawer */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0c2340]" />
              <span>Dispatched Policy Notices &amp; Escalation Ledger</span>
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Immutable log of compliance notices transmitted to institutional registrars, principals, and regional directors.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {reminders.length} Notices Recorded
          </span>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {reminders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No notices dispatched yet. Click &quot;Run Reminder Engine Now&quot; to evaluate and issue active policy notices.
            </p>
          ) : (
            reminders.map((rem) => {
              const isOverdue = rem.reminder_type === "OVERDUE_ESCALATION";
              const isUrgent = rem.reminder_type === "15_DAY_URGENT";

              return (
                <div 
                  key={rem.id} 
                  className={`p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    isOverdue 
                      ? "bg-rose-50/70 border-rose-300" 
                      : isUrgent 
                      ? "bg-amber-50/70 border-amber-300" 
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        isOverdue 
                          ? "bg-rose-100 text-rose-900 border-rose-300" 
                          : isUrgent 
                          ? "bg-amber-100 text-amber-950 border-amber-300" 
                          : "bg-blue-100 text-blue-900 border-blue-300"
                      }`}>
                        {rem.reminder_type}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">FDR: {rem.fdr_id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-600">To: {rem.recipient_email}</span>
                    </div>

                    <p className="text-slate-800 text-xs mt-1 leading-relaxed">
                      {rem.message}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-slate-500">
                      {new Date(rem.triggered_at).toLocaleString("en-IN")}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {rem.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
