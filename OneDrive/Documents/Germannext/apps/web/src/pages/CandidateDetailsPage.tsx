import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { PaymentModal } from '../components/PaymentModal';
import { AdvisorBookingModal } from '../components/AdvisorBookingModal';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { Provenance, ConsultantLeadScore } from '@educaro/shared';
import {
  User,
  Edit2,
  Check,
  FileText,
  CreditCard,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Printer,
  X,
  Clock,
  CheckCircle2,
  Upload,
  Video,
  ArrowRight,
  Lock,
  AlertCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export const CandidateDetailsPage: React.FC = () => {
  const { user, token } = useAuth();
  const { refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consultantView, setConsultantView] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdvisorBookingOpen, setIsAdvisorBookingOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmDemo = async (purchaseId: string) => {
    try {
      setConfirmingId(purchaseId);
      const res = await fetch(`/api/payment/confirm/${purchaseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Confirmed via Candidate Details demo console' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Confirmation failed');
      }
      await fetchDetails();
      await refreshJourney();
    } catch (err) {
      console.error('Failed to confirm purchase:', err);
    } finally {
      setConfirmingId(null);
    }
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orchestrator/candidate-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCandidateData(data);
      }
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDetails();
  }, [token]);

  const handleSaveInline = async (fieldKey: string, category: string) => {
    try {
      await fetch('/api/profile/field', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          fieldKey,
          value: editValue,
          provenance: Provenance.APPLICANT_PROVIDED,
        }),
      });

      setEditingFieldKey(null);
      await fetchDetails();
      await refreshJourney();
    } catch (err) {
      console.error('Inline edit failed:', err);
    }
  };

  const leadScore: ConsultantLeadScore | undefined = candidateData?.consultantLeadScore;

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      {/* Top Banner with Consultant View Toggle */}
      <div className="bg-[#EEF1EB] border-b border-[#DCE2DC] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#344653]">Candidate Details Consolidation</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                PRD Section 11
              </span>
            </div>
            <p className="text-xs text-[#71808A] mt-0.5">
              Consolidated single source of truth for all verified and AI-extracted applicant data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Link to Action Plan */}
            <button
              onClick={() => navigate('/journey/recommendations')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Action Plan
            </button>

            {/* Consultant Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#F5F5EF] p-1.5 rounded-full border border-[#DCE2DC]">
              <span className="text-xs font-semibold text-[#71808A] px-2">View Mode:</span>
              <button
                onClick={() => setConsultantView(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !consultantView ? 'bg-[#5F7D8B] text-white shadow-xs' : 'text-[#71808A] hover:text-[#344653]'
                }`}
            >
              Applicant View
            </button>
            <button
              onClick={() => setConsultantView(true)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                consultantView ? 'bg-[#5F7D8B] text-white shadow-xs' : 'text-[#71808A] hover:text-[#344653]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Consultant View (Lead Score)</span>
            </button>
          </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {loading || !candidateData ? (
          <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-12 text-center">
            <Sparkles className="w-8 h-8 text-[#5F7D8B] animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#344653]">Consolidating Profile Records...</h3>
          </div>
        ) : (
          <>
            {/* Consultant View Header: Lead Score & "Why this score" (PRD Section 7 #7) */}
            {consultantView && leadScore && (
              <div className="bg-[#E8ECE5] rounded-3xl border border-[#718C9B]/50 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#DCE2DC]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5F7D8B] text-white">
                      Educaro Consultant Intelligence
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#344653]">
                      Applicant Lead Score & Conversion Probability
                    </h2>
                    <p className="text-xs text-[#71808A] max-w-xl">
                      {leadScore.consultantSummaryNote}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-[#F5F5EF] p-4 rounded-2xl border border-[#DCE2DC] shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-[#71808A] uppercase block">Lead Score</span>
                      <span className="text-3xl font-extrabold text-[#344653]">{leadScore.leadScore}/100</span>
                    </div>
                    <div className="h-10 w-px bg-[#DCE2DC]" />
                    <div>
                      <span className="text-[10px] font-bold text-[#71808A] uppercase block">Priority Tier</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {leadScore.qualificationTier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* "Why this score" factor explanation */}
                <div className="pt-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#344653]">
                    "Why this score" Explanatory Factors:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {leadScore.explanationFactors.map((fact, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F5F5EF] p-3.5 rounded-xl border border-[#DCE2DC] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#344653]">{fact.factor}</span>
                          <span className="font-bold text-emerald-600">+{fact.points} pts</span>
                        </div>
                        <p className="text-[11px] text-[#71808A]">{fact.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE2DC]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#5F7D8B] text-white flex items-center justify-center font-bold text-lg">
                    {candidateData.applicant?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#344653]">
                        {candidateData.applicant?.name || 'Rahul Sharma'}
                      </h2>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active Applicant
                      </span>
                    </div>
                    <p className="text-xs text-[#71808A] mt-0.5">
                      Account: {candidateData.user?.email} • Registered: {new Date(candidateData.user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71808A]">Target Goal:</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5EDF0] text-[#344653] border border-[#DCE2DC]">
                    {candidateData.applicant?.goal || 'University Study'}
                  </span>
                </div>
              </div>

              {/* Grid of Profile Fields with Inline Edit and Provenance */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71808A]">
                    Auditable Profile Fields (Single Source of Truth)
                  </h3>
                  <span className="text-[11px] text-[#71808A]">
                    Click pencil icon to edit inline
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidateData.fields?.map((field: any) => {
                    const isEditing = editingFieldKey === field.fieldKey;

                    return (
                      <div
                        key={field.id}
                        className="bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] p-4 flex flex-col justify-between hover:border-[#718C9B] transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-[#71808A] uppercase text-[10px]">
                              {field.category}: {field.fieldKey}
                            </span>
                            <ProvenanceBadge
                              provenance={field.provenance}
                              confidence={field.confidence}
                              sourceText={field.sourceSnippet}
                            />
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-[#718C9B] bg-white text-xs text-[#344653] focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveInline(field.fieldKey, field.category)}
                                className="p-1.5 rounded-lg bg-[#5F7D8B] text-white"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm font-semibold text-[#344653]">
                              {field.value}
                            </p>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="mt-3 pt-2 border-t border-[#DCE2DC]/60 flex items-center justify-between text-[10px] text-[#71808A]">
                            <span>Updated: {new Date(field.updatedAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => {
                                setEditingFieldKey(field.fieldKey);
                                setEditValue(field.value);
                              }}
                              className="text-[#5F7D8B] hover:underline flex items-center gap-1 font-medium"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Inline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Document Verification & Provenance Checklist (PRD Section 11 & Audit) */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE2DC]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#344653]">
                    Document Verification & Audit Checklist
                  </h3>
                  <p className="text-[11px] text-[#71808A]">
                    Official document status: missing documents are explicitly flagged as "Not uploaded / Missing" until received.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/journey/documents')}
                  className="px-3.5 py-1.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
                >
                  Manage / Upload Documents →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    type: 'DEGREE_CERTIFICATE',
                    title: 'Degree Certificate',
                    requirement: 'Required for Anabin H+ Academic Verification',
                    isOptional: false,
                  },
                  {
                    type: 'LANGUAGE_CERTIFICATE',
                    title: 'German Language Certificate',
                    requirement: 'Goethe / TestDaF (Ausbildung & Visa)',
                    isOptional: false,
                  },
                  {
                    type: 'PASSPORT',
                    title: 'Passport (Identity Proof)',
                    requirement: 'National Passport for German Visa Application',
                    isOptional: true,
                  },
                  {
                    type: 'VISA',
                    title: 'German / Schengen Visa',
                    requirement: 'Previous or current visa stamp (if held)',
                    isOptional: true,
                  },
                ].map((cat) => {
                  const uploaded = candidateData.documents?.find(
                    (d: any) => d.documentType === cat.type
                  );
                  const isUploaded = Boolean(uploaded);

                  return (
                    <div
                      key={cat.type}
                      className={`p-4 rounded-2xl border flex flex-col justify-between text-xs transition-all ${
                        isUploaded
                          ? 'bg-[#F5F5EF] border-emerald-300 shadow-xs'
                          : 'bg-[#F5F5EF] border-[#DCE2DC]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B]">
                            {cat.isOptional ? 'Optional' : 'Required'}
                          </span>
                          {isUploaded ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Extracted & Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Not uploaded / Missing</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-[#344653] leading-snug">{cat.title}</h4>
                          <p className="text-[11px] text-[#71808A] mt-0.5">{cat.requirement}</p>
                        </div>

                        {isUploaded ? (
                          <div className="pt-2 border-t border-[#DCE2DC]/60">
                            <p className="text-[11px] font-semibold text-[#5F7D8B] truncate">
                              📄 {uploaded.filename}
                            </p>
                            <p className="text-[10px] text-[#71808A] mt-0.5">
                              Status: {uploaded.status || 'EXTRACTED'}
                            </p>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#DCE2DC]/60">
                            <p className="text-[11px] text-amber-800 italic">
                              No file uploaded yet.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => navigate('/journey/documents')}
                          className="w-full py-1.5 rounded-full text-xs font-semibold bg-[#E5EDF0] text-[#344653] hover:bg-[#DCE2DC] transition-colors"
                        >
                          {isUploaded ? 'Review Document' : '+ Upload Document'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Introduction & Speech-to-Text Transcript (PRD Section 8.5) */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE2DC]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#344653]">
                      Spoken Video Introduction & Speech-to-Text Transcript
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                      PRD Section 8.5
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71808A]">
                    Spoken motivation transcribed via Whisper STT and indexed with strict AI-Extracted provenance
                  </p>
                </div>
                <button
                  onClick={() => navigate('/journey/video')}
                  className="px-3.5 py-1.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
                >
                  {candidateData.videoIntro ? 'Update Video Intro →' : '+ Record / Upload Video Intro →'}
                </button>
              </div>

              {candidateData.videoIntro ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Video player */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] p-3 overflow-hidden shadow-xs">
                      <video
                        src={candidateData.videoIntro.videoUrl}
                        controls
                        className="w-full aspect-video rounded-xl bg-black object-cover"
                      />
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#71808A] px-1">
                        <span className="font-semibold text-[#344653] truncate max-w-[200px]">
                          📹 {candidateData.videoIntro.filename || 'applicant-intro.webm'}
                        </span>
                        <span>{new Date(candidateData.videoIntro.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Full Spoken Transcript + Extracted Motivation */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Transcript */}
                    <div className="bg-[#F5F5EF] rounded-2xl border border-[#DCE2DC] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#5F7D8B]" />
                          <span>Full Spoken Transcript (Whisper STT)</span>
                        </span>
                        <ProvenanceBadge provenance={Provenance.AI_EXTRACTED} />
                      </div>
                      <p className="text-xs text-[#344653] leading-relaxed italic bg-white/60 p-3 rounded-xl border border-[#DCE2DC]/60 max-h-40 overflow-y-auto">
                        &quot;{candidateData.videoIntro.transcript}&quot;
                      </p>
                    </div>

                    {/* Extracted Fields */}
                    {candidateData.videoIntro.extractedFields?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71808A]">
                          Extracted Motivation Fields (Category: MOTIVATION)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {candidateData.videoIntro.extractedFields.map((field: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-[#F5F5EF] p-3 rounded-xl border border-[#DCE2DC] text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#344653] text-[11px]">{field.label || field.key}</span>
                                <ProvenanceBadge
                                  provenance={field.provenance || Provenance.AI_EXTRACTED}
                                  confidence={field.confidence}
                                />
                              </div>
                              <p className="text-[11px] text-[#344653] line-clamp-2">
                                {field.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F5F5EF] rounded-2xl border border-dashed border-[#DCE2DC] space-y-2">
                  <Video className="w-8 h-8 text-[#718C9B] mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-[#344653]">No video introduction recorded yet.</p>
                  <p className="text-[11px] text-[#71808A] max-w-sm mx-auto">
                    Recording a 60-second video helps consultants assess motivation and language readiness. This step is optional.
                  </p>
                  <button
                    onClick={() => navigate('/journey/video')}
                    className="mt-2 px-4 py-2 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Record Video Intro Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Educaro Premium Status & Entitlements Dashboard (PRD Section 8.3 & Section 11) */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE2DC]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#5F7D8B] text-white">
                      PRD Section 8.3 & 11
                    </span>
                    <h3 className="text-sm font-bold text-[#344653]">
                      Educaro Premium Status & Entitlement History
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#71808A] mt-0.5">
                    PostgreSQL-backed entitlement lifecycle: manual UPI verification, 90-day validity, and automated re-lock.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetchDetails();
                      refreshJourney();
                    }}
                    className="p-1.5 rounded-lg border border-[#DCE2DC] hover:bg-[#E8ECE5] text-[#71808A] hover:text-[#344653] transition-colors text-xs flex items-center gap-1"
                    title="Refresh Status"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Status Conditional Panels */}
              {candidateData.premiumStatus?.state === 'ACTIVE' ? (
                /* STATE 1: ACTIVE */
                <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Educaro Premium Active
                        </span>
                        <span className="text-xs font-bold text-[#71808A]">
                          {candidateData.premiumStatus.daysRemaining} days remaining of 90
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#344653]">
                        All 3 Premium Features Unlocked
                      </h4>
                      <p className="text-xs text-[#71808A]">
                        Access granted on {candidateData.premiumStatus.purchaseDate ? new Date(candidateData.premiumStatus.purchaseDate).toLocaleDateString() : 'Active'} • Expires on {candidateData.premiumStatus.accessExpiryDate ? new Date(candidateData.premiumStatus.accessExpiryDate).toLocaleDateString() : '90 days from grant'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsAdvisorBookingOpen(true)}
                        className="px-4 py-2 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Book Advisor Call</span>
                      </button>
                      <button
                        onClick={() => navigate('/learning-path')}
                        className="px-4 py-2 rounded-full bg-[#EEF1EB] hover:bg-[#E8ECE5] border border-[#DCE2DC] text-[#344653] text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>Extended German Modules</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 90-day visual progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium text-[#71808A]">
                      <span>90-Day Entitlement Window</span>
                      <span>{Math.round((candidateData.premiumStatus.daysRemaining / 90) * 100)}% time remaining</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EEF1EB] rounded-full overflow-hidden border border-[#DCE2DC]">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, (candidateData.premiumStatus.daysRemaining / 90) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Entitlement Badges */}
                  <div className="pt-2 border-t border-[#DCE2DC]/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#344653]">1-on-1 Senior Advisor</span>
                        <p className="text-[11px] text-[#71808A]">Direct Google Meet consultation</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#344653]">Extended German Modules</span>
                        <p className="text-[11px] text-[#71808A]">C1 & technical vocabulary</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#344653]">Priority APS Review</span>
                        <p className="text-[11px] text-[#71808A]">Fast-track document queue</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : candidateData.premiumStatus?.state === 'SUBMITTED' ? (
                /* STATE 2: SUBMITTED (AWAITING CONFIRMATION - GREY/NEUTRAL PRD SECTION 8.3) */
                <div className="p-6 rounded-2xl bg-[#F5F5EF] border border-[#DCE2DC] shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-neutral-600 animate-pulse" />
                          Payment Submitted — Awaiting Confirmation
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#344653]">
                        Manual UPI Verification in Progress
                      </h4>
                      <p className="text-xs text-[#71808A] max-w-xl leading-relaxed">
                        Your payment receipt and UTR have been submitted. Access is currently pending and will activate automatically once our admissions team confirms the receipt against our bank statement.
                      </p>
                    </div>

                    {/* Admin Verification Mechanism */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      {candidateData.premiumStatus.latestPurchase?.id && (
                        <button
                          onClick={() => handleConfirmDemo(candidateData.premiumStatus.latestPurchase.id)}
                          disabled={Boolean(confirmingId)}
                          className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{confirmingId ? 'Activating...' : '⚡ Mark Confirmed (Admin / Demo)'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#DCE2DC] text-xs space-y-1 text-[#344653]">
                    <div className="flex justify-between">
                      <span className="text-[#71808A]">Submitted UTR / Ref:</span>
                      <span className="font-mono font-bold">{candidateData.premiumStatus.latestPurchase?.payment_id || 'Submitted'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71808A]">Plan Amount:</span>
                      <span className="font-bold">₹{candidateData.premiumStatus.latestPurchase?.amount || 999} (UPI)</span>
                    </div>
                    {candidateData.premiumStatus.latestPurchase?.receipt_file_url && (
                      <div className="flex justify-between items-center pt-1 border-t border-[#DCE2DC]/60 mt-1">
                        <span className="text-[#71808A]">Uploaded Receipt:</span>
                        <a
                          href={candidateData.premiumStatus.latestPurchase.receipt_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5F7D8B] font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>View Uploaded File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : candidateData.premiumStatus?.state === 'EXPIRED' ? (
                /* STATE 3: EXPIRED */
                <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          Educaro Premium Expired
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#344653]">
                        90-Day Access Period Has Ended
                      </h4>
                      <p className="text-xs text-[#71808A] max-w-xl leading-relaxed">
                        Your premium access expired on {candidateData.premiumStatus.accessExpiryDate ? new Date(candidateData.premiumStatus.accessExpiryDate).toLocaleDateString() : 'past date'}. Consultant booking and extended German modules have re-locked.
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/checkout')}
                      className="px-5 py-2.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Renew Educaro Premium (₹999 / 90 Days)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE 4: NONE (NOT PURCHASED) */
                <div className="p-6 rounded-2xl bg-white border border-[#DCE2DC] shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC] text-xs font-bold">
                          Standard Free Tier
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#344653]">
                        Unlock Full 90-Day Educaro Premium
                      </h4>
                      <p className="text-xs text-[#71808A] max-w-xl leading-relaxed">
                        One single UPI payment of ₹999 unlocks 1-on-1 senior consultant strategy sessions, extended C1/technical German modules, and priority document verification.
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/checkout')}
                      className="px-5 py-2.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade to Premium (₹999 via UPI/QR)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Purchase Records & Transaction History Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#71808A]">
                  Payment & Purchase Transaction Logs
                </h4>

                {((candidateData.purchases?.length || 0) + (candidateData.payments?.length || 0)) === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-[#DCE2DC] text-center text-xs text-[#71808A]">
                    No purchase or payment history found for this account.
                  </div>
                ) : (
                  <div className="divide-y divide-[#DCE2DC] border border-[#DCE2DC] rounded-2xl overflow-hidden bg-white shadow-xs">
                    {/* Render from purchases table */}
                    {candidateData.purchases?.map((p: any) => (
                      <div key={p.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F5F5EF]/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#344653]">{p.plan || 'Educaro Premium'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'SUBMITTED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {p.status === 'SUBMITTED' ? 'Awaiting Confirmation' : p.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#71808A] font-mono">
                            UTR / Ref: {p.payment_id} • Date: {new Date(p.created_at).toLocaleDateString()}
                          </p>
                          {p.access_expiry_date && (
                            <p className="text-[10px] text-emerald-700">
                              Access Window: {new Date(p.purchase_date || p.created_at).toLocaleDateString()} → {new Date(p.access_expiry_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="font-extrabold text-[#344653] text-sm">₹{p.amount}</span>
                            <span className="block text-[10px] text-[#71808A]">UPI Payment</span>
                          </div>

                          {p.receipt_file_url && (
                            <a
                              href={p.receipt_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#E5EDF0] hover:bg-[#DCE2DC] text-[11px] font-semibold text-[#5F7D8B] transition-colors inline-flex items-center gap-1"
                            >
                              <span>Receipt</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {p.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleConfirmDemo(p.id)}
                              disabled={confirmingId === p.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50"
                            >
                              {confirmingId === p.id ? 'Activating...' : 'Verify (Demo)'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Render legacy payments if any */}
                    {candidateData.payments?.map((lp: any) => (
                      <div key={lp.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F5EF]/30">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#344653]">Consultant Review (Legacy)</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {lp.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#71808A] font-mono">
                            ID: {lp.transaction_id} • Method: {lp.method} • {new Date(lp.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#344653]">₹{lp.amount}</span>
                          <button
                            onClick={() => setSelectedReceipt(lp)}
                            className="px-2.5 py-1 rounded-lg bg-[#E5EDF0] hover:bg-[#DCE2DC] text-[11px] font-semibold text-[#5F7D8B] transition-colors"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </main>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          fetchDetails();
          refreshJourney();
        }}
        featureKey="CONSULTANT_REVIEW"
        featureTitle="Consultant Review & Priority APS Consultation"
        amount={999}
      />

      <AdvisorBookingModal
        isOpen={isAdvisorBookingOpen}
        onClose={() => setIsAdvisorBookingOpen(false)}
      />

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#F5F5EF] rounded-3xl border border-[#DCE2DC] max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE2DC]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#344653]">Educaro Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-[#71808A] hover:bg-[#E8ECE5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#EEF1EB] rounded-2xl border border-[#DCE2DC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#71808A]">Merchant:</span>
                <span className="font-bold text-[#344653]">Educaro Deutschland GmbH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Service Unlocked:</span>
                <span className="font-bold text-[#344653]">{selectedReceipt.entitlement_key || 'Consultant Review'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Transaction ID:</span>
                <span className="font-mono text-[#344653]">{selectedReceipt.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Bank UTR / Ref:</span>
                <span className="font-mono text-[#344653]">{selectedReceipt.utr || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Amount Paid:</span>
                <span className="font-extrabold text-emerald-700">₹{selectedReceipt.amount} (INR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Payment Date:</span>
                <span className="text-[#344653]">{new Date(selectedReceipt.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71808A]">Account Entitlement:</span>
                <span className="font-bold text-emerald-700">Active (Survives Logout)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-full border border-[#5F7D8B] text-[#5F7D8B] text-xs font-semibold hover:bg-[#E8ECE5] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-full bg-[#5F7D8B] text-white text-xs font-semibold hover:bg-[#4e6773] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
