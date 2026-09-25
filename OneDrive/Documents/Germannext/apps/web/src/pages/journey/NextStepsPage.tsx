import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { StepHeader } from '../../components/StepHeader';
import { PaymentModal } from '../../components/PaymentModal';
import { AgentTracePanel } from '../../components/AgentTracePanel';
import { useAuth } from '../../context/AuthContext';
import { useJourney } from '../../context/JourneyContext';
import { ShieldCheck, Calendar, ArrowRight, UserCheck, CheckCircle2, Sparkles, PhoneCall } from 'lucide-react';

export const NextStepsPage: React.FC = () => {
  const { user } = useAuth();
  const { entitlements, refreshJourney } = useJourney();
  const navigate = useNavigate();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConsultantBooked, setIsConsultantBooked] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const isPriorityUnlocked =
    entitlements.includes('EDUCARO_PREMIUM') ||
    entitlements.includes('PRIORITY_APS_CONSULTANT_REVIEW') ||
    entitlements.includes('CONSULTANT_REVIEW');

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      <StepHeader
        currentStepIndex={8}
        totalSteps={8}
        stepTitle="Recommended Next Steps"
        stepSubtitle="Personalized roadmap within the Educaro ecosystem and advisor handoff"
        backRoute="/journey/cv"
        nextRoute="/candidate-details"
        continueLabel="View Consolidated Profile →"
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Congratulations Banner */}
        <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-8 shadow-xs text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
            Applicant Journey Completed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#344653] tracking-tight mt-3">
            Your Germany Profile is Structured & Qualified
          </h2>
          <p className="text-xs sm:text-sm text-[#71808A] max-w-xl mx-auto mt-2 leading-relaxed">
            Your verified documents, academic comparability (Anabin H+), and CEFR language readiness have been codified into a single source of truth.
          </p>
        </div>

        {/* Action Pathways Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: 1-on-1 Consultant Referral */}
          <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#5F7D8B] text-white flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#344653]">Educaro Senior Advisor Consultation</h3>
                  <p className="text-[11px] text-[#71808A]">Free 1-on-1 strategy video call</p>
                </div>
              </div>
              <p className="text-xs text-[#71808A] leading-relaxed mb-4">
                Our Frankfurt & Bangalore advisors will review your qualification report, confirm tuition-free university shortlist, and outline visa timelines.
              </p>
              <div className="space-y-1.5 text-xs text-[#344653]">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Pre-digested AI summary shared with advisor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Zero repetition of entered information</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE2DC]">
              {isConsultantBooked ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 text-center">
                  ✓ Advisory Call Requested! An advisor will reach out to {user?.email}.
                </div>
              ) : (
                <button
                  onClick={() => setIsConsultantBooked(true)}
                  className="w-full py-3 px-4 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Request Advisor Callback →
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Priority APS Fast-Track & Entitlement */}
          <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#5F7D8B] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#344653]">Priority APS Verification</h3>
                    <span className="text-[10px] font-bold bg-[#E5EDF0] text-[#718C9B] px-2 py-0.5 rounded-full">
                      ₹999
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71808A]">Expedited German Academic Evaluation Center filing</p>
                </div>
              </div>
              <p className="text-xs text-[#71808A] leading-relaxed mb-4">
                Fast-track your mandatory APS India certificate verification with dedicated document notarization checks and verified tracking.
              </p>
              <div className="space-y-1.5 text-xs text-[#344653]">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Persistent entitlement tied to account post-logout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Direct Indian UPI & Dynamic QR payment</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE2DC]">
              {isPriorityUnlocked ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Educaro Premium Active (90 Days)</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 px-4 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Unlock Educaro Premium via UPI / QR →
                </button>
              )}
            </div>
          </div>

        </div>

        {/* View Full Consolidated Profile Link */}
        <div className="bg-[#E8ECE5] rounded-2xl border border-[#DCE2DC] p-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#344653]">Consolidated Candidate Details & Audit</h4>
            <p className="text-xs text-[#71808A]">
              Audit all profile fields with provenance tags, inline editing, and consultant lead scoring.
            </p>
          </div>
          <button
            onClick={() => navigate('/candidate-details')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs font-semibold transition-colors"
          >
            <span>Open Candidate Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          refreshJourney();
        }}
      />

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
