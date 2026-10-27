"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, getAssetUrl } from "@/lib/api";
import { 
  UploadCloud, FileCheck, CheckCircle2, AlertTriangle, 
  ShieldCheck, FileText, ArrowRight, ShieldAlert, RefreshCw,
  Edit3, Send, Save, Eye, Check, ExternalLink, HelpCircle
} from "lucide-react";

function SubmitFdrContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit_id");

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Form Fields
  const [fdrNumber, setFdrNumber] = useState("");
  const [issuingBank, setIssuingBank] = useState("State Bank of India");
  const [branchName, setBranchName] = useState("Main Institutional Branch");
  const [ifscCode, setIfscCode] = useState("SBIN0000691");
  const [amount, setAmount] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState("2024-11-13");
  const [maturityDate, setMaturityDate] = useState("2026-11-13");
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(7.1);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [lastActionType, setLastActionType] = useState<"draft" | "submitted" | null>(null);

  const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);

  // Load existing FDR if edit_id is passed, or restore active saved draft across reloads
  useEffect(() => {
    if (editId) {
      loadExistingFdr(editId);
    } else {
      // Check if an unsubmitted draft was saved previously
      const savedDraftId = typeof window !== "undefined" ? localStorage.getItem("fdr_active_draft_id") : null;
      if (savedDraftId) {
        router.replace(`/institution/submit-fdr?edit_id=${savedDraftId}`);
        loadExistingFdr(savedDraftId);
        setDraftRestoredNotice(true);
      } else {
        // Check local form backup
        const backup = typeof window !== "undefined" ? localStorage.getItem("fdr_draft_form_data") : null;
        if (backup) {
          try {
            const parsed = JSON.parse(backup);
            if (parsed.fdrNumber) setFdrNumber(parsed.fdrNumber);
            if (parsed.issuingBank) setIssuingBank(parsed.issuingBank);
            if (parsed.branchName) setBranchName(parsed.branchName);
            if (parsed.ifscCode) setIfscCode(parsed.ifscCode);
            if (parsed.amount) setAmount(parsed.amount);
            if (parsed.issueDate) setIssueDate(parsed.issueDate);
            if (parsed.maturityDate) setMaturityDate(parsed.maturityDate);
            if (parsed.tenureMonths) setTenureMonths(parsed.tenureMonths);
            if (parsed.interestRate) setInterestRate(parsed.interestRate);
            setDraftRestoredNotice(true);
          } catch {}
        }
      }
    }
  }, [editId]);

  // Keep active form edits backed up locally
  useEffect(() => {
    if (fdrNumber || amount) {
      localStorage.setItem("fdr_draft_form_data", JSON.stringify({
        fdrNumber, issuingBank, branchName, ifscCode, amount, issueDate, maturityDate, tenureMonths, interestRate
      }));
    }
  }, [fdrNumber, issuingBank, branchName, ifscCode, amount, issueDate, maturityDate, tenureMonths, interestRate]);

  const loadExistingFdr = async (id: string) => {
    try {
      setLoadingInitial(true);
      setSubmitError(null);
      const data = await fetchApi<any>(`/fdrs/${id}`);
      setCurrentRecord(data);
      setIsEditMode(true);

      setFdrNumber(data.fdr_number || "");
      setIssuingBank(data.issuing_bank || "State Bank of India");
      setBranchName(data.branch_name || "Main Institutional Branch");
      setIfscCode(data.ifsc_code || "SBIN0000691");
      setAmount(data.amount || "");
      setIssueDate(data.issue_date || "2024-11-13");
      setMaturityDate(data.maturity_date || "2026-11-13");
      setTenureMonths(data.tenure_months || 24);
      setInterestRate(data.interest_rate || 7.1);

      if (data.document_path) {
        setFilePreview(getAssetUrl(data.document_path));
      }

      if (data.ocr_extracted_data) {
        try {
          const parsed = JSON.parse(data.ocr_extracted_data);
          setScanResult(parsed);
        } catch {}
      }
    } catch (err: any) {
      setSubmitError(`Could not load FDR record '${id}': ${err.message}`);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
      setScanResult(null);
    }
  };

  // Run Genuine OCR Scan
  const handleRunOcr = async () => {
    if (!file) {
      alert("Please upload or select an FDR document certificate first.");
      return;
    }

    try {
      setScanning(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("fdr_auth_token") : null;

      const res = await fetch(`${backendUrl}/api/v1/ocr/scan`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Data extraction failed: ${res.statusText}`);
      }

      const data = await res.json();
      setScanResult(data);

      // Auto-populate form fields from extraction
      if (data.extracted_fields) {
        const ef = data.extracted_fields;
        if (ef.bank_name) setIssuingBank(ef.bank_name);
        if (ef.fdr_number) setFdrNumber(ef.fdr_number);
        if (ef.amount) setAmount(ef.amount);
        if (ef.maturity_date) setMaturityDate(ef.maturity_date);
        if (ef.issue_date) setIssueDate(ef.issue_date);
        if (ef.interest_rate) setInterestRate(ef.interest_rate);
      }
    } catch (err: any) {
      alert(`Scanning encountered an issue: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  // Preset sample testing for verification
  const handleLoadSample = async (sampleName: string, bank: string, ref: string, amt: number, mat: string) => {
    try {
      setScanning(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${backendUrl}/uploads/${sampleName}`);
      const blob = await res.blob();
      const sampleFile = new File([blob], sampleName, { type: "image/png" });
      setFile(sampleFile);
      setFilePreview(URL.createObjectURL(sampleFile));

      // Auto-set fields directly
      setIssuingBank(bank);
      setFdrNumber(ref);
      setAmount(amt);
      setMaturityDate(mat);

      // Trigger extraction
      const formData = new FormData();
      formData.append("file", sampleFile);
      const ocrRes = await fetch(`${backendUrl}/api/v1/ocr/scan`, {
        method: "POST",
        body: formData,
      });
      if (ocrRes.ok) {
        const data = await ocrRes.json();
        setScanResult(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  // Common form validation
  const validateForm = () => {
    if (!fdrNumber.trim()) {
      setSubmitError("FDR Reference Number is mandatory.");
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      setSubmitError("Deposit amount must be a positive number.");
      return false;
    }
    if (maturityDate <= issueDate) {
      setSubmitError("Validation Error: Maturity date cannot be before or on the date of deposit issue.");
      return false;
    }
    return true;
  };

  // Save as Draft or Submit to Admin
  const handleExecuteSave = async (targetAction: "draft" | "submit") => {
    setSubmitError(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("fdr_auth_token") : null;

      const formData = new FormData();
      formData.append("fdr_number", fdrNumber.trim());
      formData.append("issuing_bank", issuingBank.trim());
      formData.append("branch_name", branchName.trim());
      formData.append("ifsc_code", ifscCode.trim());
      formData.append("amount", String(amount));
      formData.append("issue_date", issueDate);
      formData.append("maturity_date", maturityDate);
      formData.append("tenure_months", String(tenureMonths));
      formData.append("interest_rate", String(interestRate));
      formData.append("actor_name", user?.user_name || "College Registrar");
      formData.append("actor_role", "institution");

      if (file) {
        formData.append("document", file);
      }

      let res: Response;

      if (isEditMode && currentRecord?.id) {
        // Edit existing FDR
        formData.append("action", targetAction);
        formData.append("submit_to_admin", String(targetAction === "submit"));

        res = await fetch(`${backendUrl}/api/v1/fdrs/${currentRecord.id}/edit`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      } else {
        // Create new FDR
        formData.append("institution_id", String(user?.institution_id || 1));
        formData.append("action", targetAction);
        formData.append("save_as_draft", String(targetAction === "draft"));
        formData.append("submit_to_admin", String(targetAction === "submit"));

        res = await fetch(`${backendUrl}/api/v1/fdrs/submit`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Submission operation failed");
      }

      const saved = await res.json();
      setSubmitSuccess(saved);
      setLastActionType(targetAction === "submit" ? "submitted" : "draft");
      setCurrentRecord(saved);
      setIsEditMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (targetAction === "draft") {
        localStorage.setItem("fdr_active_draft_id", saved.id);
        router.replace(`/institution/submit-fdr?edit_id=${saved.id}`);
      } else {
        localStorage.removeItem("fdr_active_draft_id");
        localStorage.removeItem("fdr_draft_form_data");
        router.replace(`/institution/submit-fdr?edit_id=${saved.id}`);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save FDR record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendDraftToAdmin = async () => {
    if (!currentRecord?.id) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      const updated = await fetchApi<any>(
        `/fdrs/${currentRecord.id}/send-to-admin?actor_name=${encodeURIComponent(user?.user_name || "College Registrar")}`,
        { method: "POST" }
      );
      setSubmitSuccess(updated);
      setLastActionType("submitted");
      setCurrentRecord(updated);
      localStorage.removeItem("fdr_active_draft_id");
      localStorage.removeItem("fdr_draft_form_data");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to dispatch FDR to Admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    localStorage.removeItem("fdr_active_draft_id");
    localStorage.removeItem("fdr_draft_form_data");
    setSubmitSuccess(null);
    setLastActionType(null);
    setIsEditMode(false);
    setCurrentRecord(null);
    setDraftRestoredNotice(false);
    setFile(null);
    setFilePreview(null);
    setScanResult(null);
    setFdrNumber("");
    setAmount("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/institution/submit-fdr");
  };

  if (loadingInitial) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-300">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-900 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading FDR Instrument Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header (Clean Light Government Theme) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 border-l-4 border-l-[#0c2340] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold font-mono">
            <FileCheck className="w-3.5 h-3.5" />
            {isEditMode ? `Edit & Review FDR Instrument (${currentRecord?.id})` : "Upload, Edit & Verify Instrument (Form A)"}
          </div>

          {isEditMode && currentRecord && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border font-mono ${
              currentRecord.verification_status === "DRAFT" 
                ? "bg-amber-50 text-amber-900 border-amber-300" 
                : "bg-emerald-50 text-emerald-900 border-emerald-300"
            }`}>
              Current Status: {currentRecord.verification_status}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black text-[#0c2340] tracking-tight font-serif">
          {isEditMode ? "Edit Fixed Deposit Receipt Details" : "Upload & Edit Fixed Deposit Receipt (FDR)"}
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Upload your scanned certificate, review and edit all auto-extracted values. Details are only transmitted to the Central AICTE Scrutiny Admin when you explicitly submit.
        </p>

        {/* Workflow Instruction Pill */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px]">1</span>
            Upload Document
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px]">2</span>
            Edit & Review Fields
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-[10px]">3</span>
            Submit to AICTE Admin
          </span>
        </div>
      </div>

      {/* Draft Restored Banner */}
      {draftRestoredNotice && !submitSuccess && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">Active Working Draft Preserved &amp; Restored</p>
              <p className="text-[11px] text-blue-800">Your previously entered values and uploaded certificate are preserved. You can continue editing or start fresh.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold shrink-0 shadow-2xs transition-colors"
          >
            Start Fresh FDR
          </button>
        </div>
      )}

      {/* Success Notification: Draft vs Submitted */}
      {submitSuccess && (
        <div className={`p-5 rounded-xl border shadow-sm space-y-3 ${
          lastActionType === "draft" || submitSuccess.verification_status === "DRAFT"
            ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-emerald-50 border-emerald-300 text-emerald-900"
        }`}>
          <div className="flex items-start gap-3">
            {lastActionType === "draft" || submitSuccess.verification_status === "DRAFT" ? (
              <Edit3 className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lastActionType === "draft" || submitSuccess.verification_status === "DRAFT"
                  ? `FDR Draft Saved Successfully! Record ID: ${submitSuccess.id}`
                  : `FDR Successfully Transmitted to AICTE Admin! Record ID: ${submitSuccess.id}`}
              </h3>
              <p className="text-xs mt-1">
                {lastActionType === "draft" || submitSuccess.verification_status === "DRAFT" ? (
                  <span>
                    Your edits have been saved to your institutional portfolio. <strong className="text-slate-900 underline">These details have NOT been sent to the Admin yet.</strong> You can review, edit, or dispatch them to the Admin whenever you are ready.
                  </span>
                ) : (
                  <span>
                    Initial scrutiny status: <strong className="text-slate-900 font-mono">{submitSuccess.verification_status}</strong>. AICTE Central Scrutiny Officers can now inspect your certificate against the declarations.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {(lastActionType === "draft" || submitSuccess.verification_status === "DRAFT") && (
              <button
                type="button"
                onClick={handleSendDraftToAdmin}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Dispatching..." : "Send to AICTE Admin Now"}
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/institution/my-fdrs")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white transition-all shadow-sm"
            >
              View in My FDRs &rarr;
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all shadow-sm"
            >
              Upload Another FDR
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-700" />
          <div>
            <p className="font-bold text-rose-950">Form Validation / Submission Issue:</p>
            <p className="text-rose-800">{submitError}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Upload (Left) & Form / Review (Right) */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Document Upload & OCR Scanner (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#0c2340]" />
              1. Upload Bank FDR Document
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Clear scanned copy or photo of the physical deposit instrument certificate.
            </p>

            {/* Document Selection Box */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-all group">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-9 h-9 text-slate-400 group-hover:text-blue-700 transition-all mb-2" />
              <p className="text-xs font-bold text-slate-900 text-center">
                {file ? file.name : isEditMode && currentRecord?.document_filename ? currentRecord.document_filename : "Click to select or drag receipt file"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or PDF up to 10MB</p>
            </label>

            {/* Document Preview */}
            {filePreview && (
              <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
                  <span>Certificate Preview</span>
                  {scanResult?.overall_confidence && (
                    <span className="font-mono text-emerald-700 font-bold">
                      OCR Confidence: {Math.round(scanResult.overall_confidence * 100)}%
                    </span>
                  )}
                </div>
                <img
                  src={filePreview}
                  alt="Receipt Preview"
                  className="w-full h-auto max-h-48 object-contain rounded bg-white border border-slate-100"
                />
              </div>
            )}

            {/* Process & Auto-Fill Button */}
            <button
              type="button"
              disabled={!file || scanning}
              onClick={handleRunOcr}
              className="w-full mt-4 py-2.5 rounded-lg text-xs font-bold bg-[#0c2340] hover:bg-[#163a66] text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              {scanning ? "Processing Certificate OCR Data..." : "Run OCR & Auto-Extract Values"}
            </button>

            {/* Preset Samples */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block mb-2 font-mono">
                Sample Test Instruments (Demonstration Records)
              </span>
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleLoadSample("sample_sbi_26001.png", "State Bank of India", "SBI-884219", 2500000, "2026-11-13")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">SBI Certificate Record (₹25,00,000)</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Standard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample("sample_pnb_26002.png", "Punjab National Bank", "PNB-110782", 1800000, "2026-11-01")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">PNB Certificate Record (₹18,00,000)</span>
                  <span className="text-[10px] text-blue-700 font-bold">Auto-Parse</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample("sample_can_26003.png", "Canara Bank", "CAN-773101", 3000000, "2026-10-23")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">Canara Bank Record (₹30,00,000)</span>
                  <span className="text-[10px] text-amber-800 font-bold">Matured</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Deposit Details & Edit Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0c2340]" />
                2. Edit & Verify Deposit Instrument Details
              </h3>
              <p className="text-xs text-slate-600">
                You can freely edit, correct, or adjust any field below before sending to admin.
              </p>
            </div>
            {scanResult && (
              <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-mono">
                OCR Matched
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            
            {/* FDR Reference */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                FDR Reference / Account Number *
              </label>
              <input
                type="text"
                required
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                placeholder="e.g. SBI-884219"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Issuing Bank */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issuing Scheduled Bank *
              </label>
              <select
                value={issuingBank}
                onChange={(e) => setIssuingBank(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              >
                <option value="State Bank of India">State Bank of India</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Union Bank of India">Union Bank of India</option>
              </select>
            </div>

            {/* Branch Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Branch Name
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Deposit Amount */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Principal Security Deposit Amount (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 2500000"
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Issue / Booking *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Maturity Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Maturity *
              </label>
              <input
                type="date"
                required
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Tenure & Interest */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tenure (Months)
              </label>
              <input
                type="number"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transmission Policy:</span> You can safely edit and save your FDR as a <strong className="underline">Draft</strong>. The details will only be transmitted to the Central AICTE Scrutiny Admin when you click <strong>"Submit FDR to AICTE Admin"</strong>.
            </div>
          </div>

          {/* DUAL ACTION BUTTONS: Draft vs Submit to Admin */}
          <div className="pt-2 grid sm:grid-cols-2 gap-3">
            
            {/* Action 1: Save as Draft */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleExecuteSave("draft")}
              className="py-3 px-4 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-slate-600" />
              {submitting ? "Saving..." : isEditMode ? "Save Changes as Draft" : "Save as Draft (Don't Send Yet)"}
            </button>

            {/* Action 2: Submit to Admin */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleExecuteSave("submit")}
              className="py-3 px-4 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Transmitting to Admin..." : isEditMode ? "Submit / Update to AICTE Admin" : "Submit FDR to AICTE Admin"}
            </button>

          </div>

          <p className="text-[10px] text-center text-slate-500 font-mono">
            * Statutory Lien marked in favor of Member Secretary, AICTE.
          </p>
        </div>

      </div>

    </div>
  );
}

export default function SubmitFdrPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-500 text-sm font-semibold">
        Loading FDR Intake Module...
      </div>
    }>
      <SubmitFdrContent />
    </Suspense>
  );
}
