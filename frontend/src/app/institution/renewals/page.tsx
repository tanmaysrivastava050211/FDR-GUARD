"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { 
  RefreshCw, CheckCircle2, ShieldCheck, AlertTriangle, 
  ArrowRight, FileText, UploadCloud 
} from "lucide-react";

function RenewalsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlFdrId = searchParams.get("fdr_id");
  const instId = user?.institution_id || 1;

  const [myFdrs, setMyFdrs] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>(urlFdrId || "");

  // Renewal Form
  const [newRef, setNewRef] = useState("");
  const [newBank, setNewBank] = useState("State Bank of India");
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [newIssueDate, setNewIssueDate] = useState("2026-10-26");
  const [newMaturityDate, setNewMaturityDate] = useState("2028-10-26");
  const [newDoc, setNewDoc] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFdrs = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<any[]>(`/fdrs/?institution_id=${instId}`);
        setMyFdrs(data);
        if (urlFdrId) {
          setSelectedParentId(urlFdrId);
          const p = data.find((x) => x.id === urlFdrId);
          if (p) {
            setNewBank(p.issuing_bank);
            setNewAmount(p.amount);
          }
        } else if (data.length > 0) {
          setSelectedParentId(data[0].id);
          setNewBank(data[0].issuing_bank);
          setNewAmount(data[0].amount);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFdrs();
  }, [user, urlFdrId]);

  const handleParentSelect = (id: string) => {
    setSelectedParentId(id);
    const p = myFdrs.find((x) => x.id === id);
    if (p) {
      setNewBank(p.issuing_bank);
      setNewAmount(p.amount);
    }
  };

  const handleSubmitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedParentId) {
      setError("Please select the predecessor FDR being renewed.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("fdr_number", newRef.trim());
      formData.append("issuing_bank", newBank.trim());
      formData.append("branch_name", "Main Branch");
      formData.append("ifsc_code", "SBIN0000691");
      formData.append("amount", String(newAmount));
      formData.append("issue_date", newIssueDate);
      formData.append("maturity_date", newMaturityDate);
      formData.append("tenure_months", "24");
      formData.append("interest_rate", "7.1");
      formData.append("institution_id", String(instId));
      formData.append("renewed_from_fdr_id", selectedParentId); // Predecessor link!
      formData.append("actor_name", user?.user_name || "College Registrar");
      formData.append("actor_role", "institution");

      if (newDoc) {
        formData.append("document", newDoc);
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("fdr_auth_token") : null;

      const res = await fetch(`${backendUrl}/api/v1/fdrs/submit`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Renewal failed");
      }

      const saved = await res.json();
      setSuccess(saved);
    } catch (err: any) {
      setError(err.message || "Failed to submit renewal.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedParent = myFdrs.find((x) => x.id === selectedParentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-1.5 font-mono">
          <RefreshCw className="w-3.5 h-3.5" />
          Instrument Replacement & Lineage Record (Form B)
        </div>
        <h1 className="text-2xl font-black text-[#0c2340] tracking-tight font-serif">
          Submit Renewal / Replacement Instrument
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Links your newly booked fixed deposit with the maturing predecessor instrument to maintain continuous compliance audit lineage.
        </p>
      </div>

      {success && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Renewal Link Established! New FDR ID: {success.id}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Successfully linked to predecessor record <strong className="text-slate-900 font-mono">{selectedParentId}</strong>. Predecessor status shifted to <strong className="text-slate-900">RENEWAL_SUBMITTED</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/institution/my-fdrs")}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm"
          >
            Return to My FDRs &rarr;
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitRenewal} className="space-y-6">
        
        {/* Step 1: Predecessor FDR Selector (Clean Light Card) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            1. Select Predecessor FDR Being Replaced
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            Choose the maturing or expired instrument that this new deposit replaces.
          </p>

          <select
            value={selectedParentId}
            onChange={(e) => handleParentSelect(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
          >
            {myFdrs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id} — {f.fdr_number} • ₹{f.amount?.toLocaleString("en-IN")} (Matured: {f.maturity_date})
              </option>
            ))}
          </select>

          {selectedParent && (
            <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Predecessor Amount</span>
                <p className="font-black text-slate-900 mt-0.5 font-mono">₹{selectedParent.amount?.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Maturity Date</span>
                <p className="font-semibold text-amber-800 mt-0.5 font-mono">{selectedParent.maturity_date}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Current Lien Bank</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedParent.issuing_bank}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: New Replacement Instrument Details (Clean Light Card) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
            2. New Replacement FDR Instrument Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New FDR Reference Number *
              </label>
              <input
                type="text"
                required
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                placeholder="e.g. SBI-992104-RNW"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issuing Bank *
              </label>
              <input
                type="text"
                required
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Renewal Deposit Amount (INR) *
              </label>
              <input
                type="number"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Maturity Date *
              </label>
              <input
                type="date"
                required
                value={newMaturityDate}
                onChange={(e) => setNewMaturityDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Upload New FDR Certificate
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => e.target.files && setNewDoc(e.target.files[0])}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${submitting ? "animate-spin" : ""}`} />
            {submitting ? "Linking & Submitting..." : "Submit Replacement & Link Lineage"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default function RenewalsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-slate-600 text-xs">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading Renewals Desk...
        </div>
      </div>
    }>
      <RenewalsContent />
    </Suspense>
  );
}
