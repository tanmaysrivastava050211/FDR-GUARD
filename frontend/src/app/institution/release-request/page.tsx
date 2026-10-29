"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { 
  Send, CheckCircle2, ShieldCheck, AlertCircle, 
  FileText, Building2, UploadCloud 
} from "lucide-react";

function ReleaseRequestContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlFdrId = searchParams.get("fdr_id");
  const instId = user?.institution_id || 1;

  const [myFdrs, setMyFdrs] = useState<any[]>([]);
  const [selectedFdrId, setSelectedFdrId] = useState<string>(urlFdrId || "");
  const [reason, setReason] = useState("");
  const [bankAccount, setBankAccount] = useState("399102948210");
  const [bankName, setBankName] = useState("State Bank of India");
  const [ifsc, setIfsc] = useState("SBIN0000691");
  const [docName, setDocName] = useState("Governing_Body_Resolution_NOC.pdf");

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
          setSelectedFdrId(urlFdrId);
        } else if (data.length > 0) {
          setSelectedFdrId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFdrs();
  }, [user, urlFdrId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFdrId) {
      setError("Please select the FDR for which you are requesting release.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetchApi<any>(`/releases/submit?institution_id=${instId}&actor_name=${encodeURIComponent(user?.user_name || "College Registrar")}`, {
        method: "POST",
        body: JSON.stringify({
          fdr_id: selectedFdrId,
          reason,
          bank_account_no: bankAccount,
          bank_name: bankName,
          ifsc_code: ifsc,
          supporting_doc_name: docName,
        }),
      });

      setSuccess(res);
    } catch (err: any) {
      setError(err.message || "Release request submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFdr = myFdrs.find((x) => x.id === selectedFdrId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-1.5 font-mono">
          <Send className="w-3.5 h-3.5" />
          Statutory Refund Clearance Process (Form C)
        </div>
        <h1 className="text-2xl font-black text-[#0c2340] tracking-tight font-serif">
          Apply for Security Deposit Release / Refund
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Submit formal clearance petition to AICTE Competent Authority for release of joint lien and security deposit repatriation.
        </p>
      </div>

      {success && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Release Request Submitted! Dossier ID: {success.id}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Application logged for scrutiny by AICTE Regional Directorate and Approval Committee.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* FDR Selection (Clean Light Card) */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            1. Select FDR Instrument for Release
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            Choose the deposit whose security lien you are requesting AICTE to release.
          </p>

          <select
            value={selectedFdrId}
            onChange={(e) => setSelectedFdrId(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
          >
            {myFdrs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id} — {f.fdr_number} • ₹{f.amount?.toLocaleString("en-IN")} ({f.administrative_status})
              </option>
            ))}
          </select>

          {selectedFdr && (
            <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Principal Amount</span>
                <p className="font-black text-slate-900 mt-0.5 font-mono">₹{selectedFdr.amount?.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Lien Bank</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedFdr.issuing_bank}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Maturity Status</span>
                <p className="font-semibold text-amber-800 mt-0.5 font-mono">{selectedFdr.maturity_date}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reason & Clearance Document */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
            2. Stated Justification & Clearance Resolution
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Grounds / Regulatory Justification for Release *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fulfillment of minimum 10-year regulatory affiliation tenure, conversion to state private university, or replacement of corpus..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Governing Body Resolution / Clearance Document Name
            </label>
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Remittance Bank Account */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
            3. Institution Bank Account for Deposit Refund
          </h3>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch IFSC Code *
              </label>
              <input
                type="text"
                required
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Send className={`w-4 h-4 text-amber-400 ${submitting ? "animate-spin" : ""}`} />
            {submitting ? "Submitting Application..." : "Transmit Release Application to AICTE"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default function InstitutionReleaseRequestPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-slate-600 text-xs">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading Release Application...
        </div>
      </div>
    }>
      <ReleaseRequestContent />
    </Suspense>
  );
}
