"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, getAssetUrl } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Search, Filter, Download, ExternalLink, ShieldCheck, 
  RefreshCw, Building2, Calendar, FileText, CheckCircle2,
  AlertTriangle, ShieldAlert
} from "lucide-react";

export default function FdrRepositoryPage() {
  const router = useRouter();

  const [fdrs, setFdrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bankFilter, setBankFilter] = useState("ALL");

  const loadFdrs = async () => {
    try {
      setLoading(true);
      let query = "/fdrs/?";
      if (searchTerm) query += `q=${encodeURIComponent(searchTerm)}&`;
      if (statusFilter !== "ALL") query += `status=${encodeURIComponent(statusFilter)}&`;
      if (bankFilter !== "ALL") query += `bank=${encodeURIComponent(bankFilter)}&`;

      const data = await fetchApi<any[]>(query);
      setFdrs(data);
    } catch (err) {
      console.error("Error loading FDRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFdrs();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, bankFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 font-mono">
            CENTRAL ARCHIVES • ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
          </div>
          <h1 className="text-2xl font-black text-[#0c2340] tracking-tight font-serif mt-0.5">
            National FDR Master Repository
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Statutory registry of all institutional fixed deposit security receipts pledged to Member Secretary, AICTE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/scrutiny")}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Document Scrutiny Bureau
          </button>
        </div>
      </div>

      {/* Filter & Search Bar (Clean Light Container, No Blur) */}
      <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-sm flex flex-wrap items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by FDR ID, reference, bank, college name, or AICTE ID..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="VERIFIED">Verified & Pledged</option>
            <option value="AUTO_CHECKED_CLEAN">Parsed Clean</option>
            <option value="FLAGGED_DISCREPANCY">Discrepancy Flagged</option>
            <option value="SUBMITTED">Submitted (Pending Review)</option>
            <option value="MATURING_SOON">Maturing in &le;30 Days</option>
            <option value="MATURED">Matured / Overdue</option>
          </select>
        </div>

        {/* Bank Filter */}
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
        >
          <option value="ALL">All Schedule Banks</option>
          <option value="State Bank of India">State Bank of India</option>
          <option value="Punjab National Bank">Punjab National Bank</option>
          <option value="Canara Bank">Canara Bank</option>
          <option value="Bank of Baroda">Bank of Baroda</option>
        </select>

        <button
          onClick={loadFdrs}
          className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all shadow-sm"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Table (Crisp Light Government Layout) */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-700 font-medium">
            Displaying <span className="text-slate-900 font-bold">{fdrs.length}</span> security instruments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-300 font-bold">
              <tr>
                <th className="py-3 px-4">FDR Record</th>
                <th className="py-3 px-4">Institution Details</th>
                <th className="py-3 px-4">Bank & Branch</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4">Maturity Timeline</th>
                <th className="py-3 px-4">Status & Flags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading FDR records from database...</p>
                  </td>
                </tr>
              ) : fdrs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No FDR records match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                fdrs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {r.id}
                        {r.is_duplicate && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">Ref: {r.fdr_number}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.institution_name}</div>
                      <div className="text-[10px] text-slate-500">AICTE ID: {r.aicte_id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.issuing_bank}</div>
                      <div className="text-[10px] text-slate-500">{r.branch_name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(r.amount)}</div>
                      <div className="text-[10px] text-slate-500">Rate: {r.interest_rate}% p.a.</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-medium text-slate-900">{r.maturity_date}</div>
                      <div className={`text-[10px] font-bold ${r.days_to_maturity < 0 ? "text-rose-700" : r.days_to_maturity <= 30 ? "text-amber-800" : "text-emerald-700"}`}>
                        {r.days_to_maturity < 0
                          ? `${Math.abs(r.days_to_maturity)} days overdue`
                          : `${r.days_to_maturity} days left`}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={r.verification_status} />
                        <div>
                          <StatusBadge status={r.administrative_status} type="administrative" />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/scrutiny?fdr_id=${r.id}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
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

    </div>
  );
}
