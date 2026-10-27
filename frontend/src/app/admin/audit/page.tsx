"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { 
  History, Download, Filter, RefreshCw, ShieldCheck, 
  Terminal, UserCheck, Calendar, Lock 
} from "lucide-react";

export default function AuditLedgerPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadLogs = async () => {
    try {
      setLoading(true);
      let query = "/audit/logs?";
      if (typeFilter !== "ALL") query += `target_type=${encodeURIComponent(typeFilter)}&`;
      const data = await fetchApi<any[]>(query);
      setLogs(data);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [typeFilter]);

  const handleExportCsv = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    window.open(`${backendUrl}/api/v1/audit/export-csv`, "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              IMMUTABLE SYSTEM ACCOUNTABILITY • SECTION 12B AUDIT
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] mt-1 font-serif">
            Tamper-Evident Chronological Audit Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Cryptographically timestamped record of every upload, scrutiny action, status change, and approval decision.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filter Target:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Event Types</option>
            <option value="FDR">FDR Lifecycle Events</option>
            <option value="RELEASE">Release & Clearances</option>
            <option value="SYSTEM">Automated Cron & System</option>
          </select>
        </div>

        <button
          onClick={loadLogs}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No audit records match criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                      {log.actor_name}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                        {log.actor_role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-blue-900">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-sans">
                      <span className="text-[10px] text-slate-500 font-medium">{log.target_type}:</span> {log.target_id || "—"}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-sans max-w-xs truncate" title={log.details}>
                      {log.details || "—"}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500 font-mono">
                      {log.ip_address}
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
