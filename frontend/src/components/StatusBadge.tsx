"use client";

import React from "react";
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, Clock, 
  HelpCircle, RefreshCw, Send, Check, FileEdit
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "verification" | "administrative" | "severity";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "verification" }) => {
  const s = (status || "").toUpperCase();

  // Draft Badge (not yet sent to admin)
  if (s === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
        <FileEdit className="w-3.5 h-3.5 text-amber-700" />
        Draft (Not Sent to Admin)
      </span>
    );
  }

  // Verification Badges
  if (s === "VERIFIED" || s === "BANK_CONFIRMED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        {s === "BANK_CONFIRMED" ? "Bank Confirmed" : "Verified & Pledged"}
      </span>
    );
  }

  if (s === "AUTO_CHECKED_CLEAN") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300">
        <Check className="w-3.5 h-3.5 text-blue-700" />
        Document Parsed Clean
      </span>
    );
  }

  if (s === "FLAGGED_DISCREPANCY") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
        Discrepancy Flagged
      </span>
    );
  }

  if (s === "REVISION_REQUIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
        <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
        Correction Required
      </span>
    );
  }

  if (s === "UNDER_SCRUTINY" || s === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
        <Clock className="w-3.5 h-3.5 text-slate-600" />
        {s === "SUBMITTED" ? "Submitted (Pending)" : "Under Scrutiny"}
      </span>
    );
  }

  // Administrative Badges
  if (s === "MATURING_SOON") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        Due in &le;30 Days
      </span>
    );
  }

  if (s === "MATURED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
        Renewal Overdue
      </span>
    );
  }

  if (s === "RELEASE_REQUESTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
        <Send className="w-3.5 h-3.5 text-indigo-700" />
        Release Requested
      </span>
    );
  }

  if (s === "RELEASED" || s === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        Released & Refunded
      </span>
    );
  }

  if (s === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
        <Check className="w-3.5 h-3.5 text-slate-600" />
        Active (Valid)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
      <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
      {status || "Unknown"}
    </span>
  );
};
