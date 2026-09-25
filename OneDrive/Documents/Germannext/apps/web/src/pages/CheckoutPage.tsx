import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { CheckoutPlanInfo, PremiumStatusResponse } from '@educaro/shared';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Upload,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Lock,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { user, token } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutPlanInfo | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  // Manual payment submission state
  const [hasPaidClicked, setHasPaidClicked] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch dynamic plan info generated server-side from api/.env
      const planRes = await fetch('/api/payment/checkout-info');
      if (planRes.ok) {
        const planData = await planRes.json();
        setCheckoutInfo(planData);
      }

      // Fetch user's current premium status
      if (token) {
        const statusRes = await fetch('/api/payment/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setPremiumStatus(statusData);
        }
      }
    } catch (err) {
      console.error('Failed to load checkout information:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const copyUpiId = () => {
    if (checkoutInfo?.upiId) {
      navigator.clipboard.writeText(checkoutInfo.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      if (utrInput.trim()) {
        formData.append('utr', utrInput.trim());
      }
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit payment proof');
      }

      setSubmissionSuccess(true);
      await loadData();
      await refreshJourney();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo / Admin confirmation simulation to immediately test activation
  const handleSimulateAdminConfirm = async (purchaseId: string) => {
    try {
      const res = await fetch(`/api/payment/confirm/${purchaseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Verified via demo admin panel' }),
      });

      if (res.ok) {
        await loadData();
        await refreshJourney();
      }
    } catch (err) {
      console.error('Failed to confirm purchase:', err);
    }
  };

  if (loading || !checkoutInfo) {
    return (
      <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
        <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#5F7D8B] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#71808A]">Loading Secure UPI Checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = premiumStatus?.isActive;
  const isSubmitted = premiumStatus?.state === 'SUBMITTED';
  const isExpired = premiumStatus?.state === 'EXPIRED';

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* State Banner: Active Premium Check */}
        {isActive && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active Account Entitlement
                </span>
                <h2 className="text-xl font-bold text-emerald-950 mt-1">
                  You already hold active {checkoutInfo.planName}!
                </h2>
                <p className="text-xs text-emerald-800">
                  {premiumStatus?.daysRemaining} days remaining • Valid until{' '}
                  {premiumStatus?.accessExpiryDate
                    ? new Date(premiumStatus.accessExpiryDate).toLocaleDateString()
                    : '90 days from confirmation'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/journey/qualification')}
                className="px-4 py-2 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>Book 1-on-1 Advisor Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/learning-path')}
                className="px-4 py-2 rounded-full border border-[#DCE2DC] bg-white text-xs font-semibold text-[#344653] hover:bg-[#E8ECE5] transition-colors"
              >
                Access Extended German Path
              </button>
              <button
                onClick={() => navigate('/candidate-details')}
                className="px-4 py-2 rounded-full border border-[#DCE2DC] bg-white text-xs font-semibold text-[#71808A] hover:text-[#344653] transition-colors"
              >
                View Premium Dashboard
              </button>
            </div>
          </div>
        )}

        {/* State Banner: Expired Premium */}
        {isExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Your premium access expired on{' '}
                  {premiumStatus?.accessExpiryDate
                    ? new Date(premiumStatus.accessExpiryDate).toLocaleDateString()
                    : 'date'}
                  .
                </h3>
                <p className="text-xs text-amber-800">
                  Unlock again below to continue enjoying dedicated 1-on-1 advisor sessions and extended German modules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State Banner: Submitted - Awaiting Confirmation (PRD Section 8.3 Grey/Neutral) */}
        {isSubmitted && !submissionSuccess && (
          <div className="bg-[#EEF1EB] border border-[#DCE2DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                    Payment Submitted — Awaiting Confirmation
                  </span>
                  <h3 className="text-base font-bold text-[#344653] mt-1.5">
                    Your payment receipt is under manual verification
                  </h3>
                  <p className="text-xs text-[#71808A]">
                    Transaction Ref / UTR: <strong className="font-mono text-[#344653]">{premiumStatus?.latestPurchase?.paymentId}</strong>
                  </p>
                </div>
              </div>

              {premiumStatus?.latestPurchase?.receiptFileUrl && (
                <a
                  href={premiumStatus.latestPurchase.receiptFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-[#DCE2DC] bg-white hover:bg-[#F5F5EF] text-xs font-semibold text-[#5F7D8B] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Uploaded Receipt</span>
                </a>
              )}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DCE2DC] text-xs text-[#71808A] leading-relaxed">
              <p>
                <strong>Pending Activation Notice:</strong> Access is not yet active. Our admissions desk verifies the UTR and receipt file against the receiving bank account. Once confirmed, your full 90-day access will activate and persist across all devices.
              </p>
            </div>

            {/* Admin Verification Mechanism */}
            <div className="p-4 bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B] block">
                  Admin Verification Mechanism (PRD Section 8.3)
                </span>
                <p className="text-xs text-[#344653] font-medium">
                  Review and mark transaction as confirmed to activate the 90-day entitlement:
                </p>
              </div>
              {premiumStatus?.latestPurchase?.id && (
                <button
                  type="button"
                  onClick={() => handleSimulateAdminConfirm(premiumStatus.latestPurchase!.id)}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Confirmed & Activate 90-Day Access</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN CHECKOUT CONTAINER */}
        <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE2DC]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                  One-Time Payment • No Recurring Charges
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  3-Month Validity (90 Days)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#344653]">
                {checkoutInfo.planName}
              </h1>
              <p className="text-xs text-[#71808A]">
                Unified premium admission services for your study or vocational journey in Germany
              </p>
            </div>

            {/* Dynamic Price Display (Configured Server-Side) */}
            <div className="bg-[#F5F5EF] px-5 py-3 rounded-2xl border border-[#DCE2DC] text-right shrink-0">
              <span className="text-[10px] font-bold text-[#71808A] uppercase block">Total Payable</span>
              <span className="text-2xl sm:text-3xl font-black text-[#344653]">
                ₹{checkoutInfo.amount}
              </span>
              <span className="text-[10px] text-[#71808A] block">{checkoutInfo.currency} (All Inclusive)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: What's Included */}
            <div className="md:col-span-7 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71808A]">
                Everything Included In Your 90-Day Access:
              </h3>

              <div className="space-y-3">
                {checkoutInfo.perks.map((perk, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] flex items-start gap-3 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-[#344653] leading-relaxed">{perk}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] text-[11px] text-[#71808A] space-y-1">
                <p className="font-semibold text-[#344653]">Account-Tied Entitlement Guarantee:</p>
                <p>
                  Access is stored against your account in PostgreSQL, surviving logout on any browser or device. 
                  Valid for a full 90 days from the confirmation timestamp.
                </p>
              </div>
            </div>

            {/* Right Column: UPI QR Code & Manual UPI ID */}
            <div className="md:col-span-5 bg-[#F5F5EF] p-6 rounded-3xl border border-[#DCE2DC] shadow-xs flex flex-col items-center text-center space-y-4">
              
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#344653]">
                <QrCode className="w-4 h-4 text-[#5F7D8B]" />
                <span>Scan with Any Indian UPI App</span>
              </div>

              {/* Dynamic QR Code generated server-side */}
              <div className="p-3 bg-white rounded-2xl border border-[#DCE2DC] shadow-xs">
                {checkoutInfo.qrCodeDataUrl ? (
                  <img
                    src={checkoutInfo.qrCodeDataUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 rounded-xl object-contain mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                    Loading QR...
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#71808A]">
                Google Pay • PhonePe • Paytm • BHIM • CRED
              </p>

              {/* Direct UPI Deep Link */}
              <a
                href={checkoutInfo.upiUri}
                className="w-full py-2.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open in UPI App Directly</span>
              </a>

              {/* Manual UPI ID Display & Copy */}
              <div className="w-full pt-2 border-t border-[#DCE2DC] space-y-1">
                <span className="text-[10px] font-bold text-[#71808A] uppercase">
                  Or Pay Manually to Receiving UPI ID:
                </span>
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#DCE2DC] text-xs">
                  <span className="font-mono font-bold text-[#344653] truncate">{checkoutInfo.upiId}</span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="p-1 rounded-lg hover:bg-neutral-100 text-[#5F7D8B] transition-colors shrink-0"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* MANUAL VERIFICATION & "I'VE PAID" SECTION */}
          <div className="pt-6 border-t border-[#DCE2DC] space-y-5">
            {!hasPaidClicked && !submissionSuccess ? (
              <div className="text-center py-4 space-y-3 bg-[#F5F5EF] p-6 rounded-2xl border border-[#DCE2DC]">
                <h4 className="text-sm font-bold text-[#344653]">
                  Already completed your UPI transfer?
                </h4>
                <p className="text-xs text-[#71808A] max-w-md mx-auto">
                  Click below to submit your 12-digit UTR reference or payment screenshot so our team can verify and activate your access.
                </p>
                <button
                  type="button"
                  onClick={() => setHasPaidClicked(true)}
                  className="px-6 py-2.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I've Paid — Submit Payment Proof →</span>
                </button>
              </div>
            ) : submissionSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">
                  Payment Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your transaction has been marked as <strong>Payment Submitted — Awaiting Confirmation</strong>. 
                  Our admissions desk will confirm your UTR.
                </p>
                <button
                  onClick={() => navigate('/candidate-details')}
                  className="px-5 py-2 rounded-full bg-[#5F7D8B] text-white text-xs font-bold"
                >
                  View Status on Candidate Details Page →
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitProof}
                className="bg-[#F5F5EF] p-6 sm:p-8 rounded-2xl border border-[#DCE2DC] space-y-5 max-w-xl mx-auto shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE2DC]">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#344653]">
                      I've Paid — Upload Receipt
                    </h4>
                    <p className="text-[11px] text-[#71808A] mt-0.5">
                      Upload your transaction confirmation screenshot or bank PDF
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                    Step 2 of 2
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 12-digit UPI UTR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344653] flex items-center justify-between">
                    <span>UPI Reference Number / UTR *</span>
                    <span className="text-[10px] text-[#71808A] font-normal">12-digit reference from your UPI app</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. 423984920192"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DCE2DC] bg-white text-xs font-mono text-[#344653] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
                  />
                </div>

                {/* Receipt Screenshot / PDF Upload (Document upload pattern) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344653] flex items-center justify-between">
                    <span>Payment Receipt (Screenshot or PDF) *</span>
                    <span className="text-[10px] text-[#71808A]">JPG, PNG, WEBP, PDF (max 10MB)</span>
                  </label>

                  {!receiptFile ? (
                    <label className="border-2 border-dashed border-[#DCE2DC] hover:border-[#5F7D8B] rounded-2xl p-6 text-center bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-[#EEF1EB] group-hover:bg-[#E5EDF0] text-[#5F7D8B] flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#344653]">
                        Click to upload or drag & drop payment receipt
                      </span>
                      <span className="text-[11px] text-[#71808A]">
                        Supports GPay, PhonePe, Paytm, BHIM, CRED screenshots or bank statement PDF
                      </span>
                    </label>
                  ) : (
                    <div className="p-4 bg-white rounded-2xl border border-[#DCE2DC] flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 truncate">
                        {receiptPreview ? (
                          <img
                            src={receiptPreview}
                            alt="Receipt Preview"
                            className="w-12 h-12 rounded-lg object-cover border border-[#DCE2DC] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#EEF1EB] text-[#5F7D8B] border border-[#DCE2DC] flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#344653] truncate">{receiptFile.name}</p>
                          <p className="text-[10px] text-[#71808A]">{formatFileSize(receiptFile.size)} • {receiptFile.type || 'Document'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 rounded-lg text-[#71808A] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#EEF1EB] rounded-xl border border-[#DCE2DC] text-[11px] text-[#71808A] leading-relaxed">
                  ℹ️ Uploading moves this transaction to <strong>Payment Submitted — Awaiting Confirmation</strong>. Access is not active until an admin verifies your UTR.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setHasPaidClicked(false)}
                    className="px-4 py-2.5 rounded-full border border-[#DCE2DC] bg-white text-xs font-semibold text-[#71808A] hover:bg-[#EEF1EB] transition-colors"
                  >
                    Back to QR
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? 'Uploading Receipt & Submitting...' : "I've Paid — Upload Receipt →"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </main>

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
