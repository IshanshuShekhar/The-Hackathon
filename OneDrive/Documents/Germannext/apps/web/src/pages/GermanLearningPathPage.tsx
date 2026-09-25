import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { GermanLearningPathData, GermanResource } from '@educaro/shared';
import {
  Compass,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export const GermanLearningPathPage: React.FC = () => {
  const { user, token } = useAuth();
  const { journeyState, entitlements } = useJourney();
  const navigate = useNavigate();

  const isPremiumActive =
    entitlements.includes('EDUCARO_PREMIUM') ||
    entitlements.includes('CONSULTANT_REVIEW') ||
    entitlements.includes('PRIORITY_APS_CONSULTANT_REVIEW');

  const [pathData, setPathData] = useState<GermanLearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | 'A1' | 'A2' | 'B1'>('ALL');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/qualification/learning-path', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPathData(data);
        }
      } catch (err) {
        console.error('Failed to load German learning path:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchLearningPath();
  }, [token]);

  const readiness = pathData?.readiness;
  const resources = pathData?.resources || [];

  const filteredResources = selectedLevelFilter === 'ALL'
    ? resources
    : resources.filter((r) => r.level === selectedLevelFilter);

  // Group resources by level for structured display
  const a1Resources = resources.filter((r) => r.level === 'A1');
  const a2Resources = resources.filter((r) => r.level === 'A2');
  const b1Resources = resources.filter((r) => r.level === 'B1');

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      {/* Page Header */}
      <div className="bg-[#EEF1EB] border-b border-[#DCE2DC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC] text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Guided Language Readiness Path • PRD Section 8.1</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#344653] tracking-tight">
              Your German Learning Path
            </h1>
            <p className="text-xs sm:text-sm text-[#71808A] max-w-2xl leading-relaxed">
              Every applicant moves at their own pace. We provide a structured roadmap with official, free German courses from Deutsche Welle and Goethe-Institut so you reach certified visa readiness without roadblocks.
            </p>
          </div>

          {/* Next Best Action Card Reuse */}
          <div className="bg-[#F5F5EF] p-5 rounded-2xl border border-[#DCE2DC] max-w-sm w-full shadow-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#718C9B] uppercase tracking-wide mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEXT BEST ACTION</span>
            </div>
            <h4 className="text-xs font-bold text-[#344653]">
              Begin Nicos Weg A1 Foundations
            </h4>
            <p className="text-[11px] text-[#71808A] mt-1 leading-relaxed">
              Complete 2 episodes per week on Deutsche Welle to build core pronunciation and grammar while your profile is under review.
            </p>
            <a
              href="https://learngerman.dw.com/en/nicos-weg/c-36519789"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-xs font-semibold transition-colors"
            >
              <span>Launch Nicos Weg (DW)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {loading || !readiness ? (
          <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-12 text-center">
            <Sparkles className="w-8 h-8 text-[#5F7D8B] animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#344653]">Calculating German Readiness Timeline...</h3>
          </div>
        ) : (
          <>
            {/* Level & Readiness Estimation Banner */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#DCE2DC]">
                
                {/* Levels Overview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#71808A]">
                      Pathway Goal: {pathData?.chosenPathway}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Non-Blocking Preparation
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Current Level */}
                    <div className="bg-[#F5F5EF] p-4 rounded-2xl border border-[#DCE2DC] min-w-[150px]">
                      <span className="text-[10px] font-bold uppercase text-[#71808A] block">Current Level</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#344653] mt-0.5 block">
                        {readiness.currentLevel}
                      </span>
                      <span className="text-[10px] text-[#718C9B]">Self-reported / Doc</span>
                    </div>

                    <div className="text-[#718C9B] font-bold text-lg hidden sm:block">→</div>

                    {/* Target Level */}
                    <div className="bg-[#F5F5EF] p-4 rounded-2xl border border-[#DCE2DC] min-w-[150px]">
                      <span className="text-[10px] font-bold uppercase text-[#71808A] block">Target Level</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#5F7D8B] mt-0.5 block">
                        CEFR {readiness.targetLevel}
                      </span>
                      <span className="text-[10px] text-[#718C9B]">Official Admission Benchmark</span>
                    </div>
                  </div>
                </div>

                {/* Readiness Estimate with Transparent Formula Tooltip */}
                <div className="relative bg-[#F5F5EF] p-5 rounded-2xl border border-[#DCE2DC] lg:max-w-sm w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#71808A] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#5F7D8B]" />
                      <span>Readiness Estimate</span>
                    </span>

                    {/* Tooltip Toggle for Formula Transparency */}
                    <button
                      type="button"
                      onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                      className="text-xs text-[#718C9B] hover:text-[#344653] flex items-center gap-1 font-medium"
                      title="View deterministic calculation logic"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="text-[11px] underline">How is this calculated?</span>
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#344653]">
                      ~{readiness.estimatedMonths} Months
                    </span>
                    <span className="text-xs text-[#71808A]">({readiness.estimatedWeeks} study weeks)</span>
                  </div>

                  <p className="text-[11px] text-[#71808A] leading-relaxed">
                    Based on standard pace of <strong>{readiness.hoursPerWeek}–12 hours/week</strong> with consistent interactive exercises.
                  </p>

                  {/* Formula Breakdown Info Box */}
                  {showFormulaTooltip && (
                    <div className="mt-3 p-3 bg-[#E8ECE5] rounded-xl border border-[#718C9B]/40 text-xs text-[#344653] space-y-1.5 animate-in fade-in duration-150">
                      <div className="font-bold text-[11px] text-[#344653] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-[#5F7D8B]" />
                        <span>Deterministic Rules Formula</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#71808A]">
                        {readiness.formulaExplanation}
                      </p>
                      <div className="text-[10px] text-[#71808A] pt-1 border-t border-[#DCE2DC]">
                        Constant: <strong>{readiness.weeksPerLevel} weeks per CEFR sublevel</strong> (A1 → A2 = 8 wks, A2 → B1 = 8 wks). Zero AI hallucinations.
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Progress Framing (PRD Section 8.1 & Differentiator #10) */}
              <div className="pt-5 flex items-center gap-3 text-xs text-[#344653]">
                <div className="w-8 h-8 rounded-full bg-[#E5EDF0] text-[#718C9B] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">
                  <strong>Educaro Guidance:</strong> You are not rejected or held back due to German proficiency. You can complete your degree verification, APS certification, and university shortlisting right now while progressing through these curated tutorial tracks.
                </p>
              </div>

            </div>

            {/* Curated Resources Section Header & Level Filter */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#344653]">
                    Curated Free German Tutorial Resources
                  </h2>
                  <p className="text-xs text-[#71808A] mt-0.5">
                    Official, reputable resources from Deutsche Welle, Goethe-Institut, and Easy German. No generic or unverified links.
                  </p>
                </div>

                {/* Level Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#EEF1EB] p-1 rounded-full border border-[#DCE2DC] text-xs">
                  {(['ALL', 'A1', 'A2', 'B1'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevelFilter(lvl)}
                      className={`px-3 py-1 rounded-full font-bold transition-all ${
                        selectedLevelFilter === lvl
                          ? 'bg-[#5F7D8B] text-white shadow-xs'
                          : 'text-[#71808A] hover:text-[#344653]'
                      }`}
                    >
                      {lvl === 'ALL' ? 'All Modules' : `Level ${lvl}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouped Resource Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredResources.map((res: GermanResource) => (
                  <div
                    key={res.id}
                    className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 flex flex-col justify-between hover:border-[#718C9B] transition-all shadow-xs"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                            {res.level}
                          </span>
                          {res.isPrimary && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ★ Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#71808A] uppercase">
                          {res.provider}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm sm:text-base font-bold text-[#344653] leading-snug mb-2">
                        {res.title}
                      </h3>
                      <p className="text-xs text-[#71808A] leading-relaxed">
                        {res.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#DCE2DC]/60 text-[11px] text-[#718C9B] font-medium">
                        Type: {res.type}
                      </div>
                    </div>

                    {/* External Link Button */}
                    <div className="mt-6 pt-4 border-t border-[#DCE2DC] flex items-center justify-between">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-[10px] text-[#71808A]">Free Access</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Extended German Learning Path (Educaro Premium Section 8.1 & 8.3) */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5F7D8B] text-white">
                      Educaro Premium
                    </span>
                    {isPremiumActive ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Unlocked & Active (90 Days)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Locked (Requires Educaro Premium)
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#344653]">
                    Extended German Learning Modules
                  </h2>
                  <p className="text-xs sm:text-sm text-[#71808A] max-w-2xl leading-relaxed">
                    Deeper, university-grade, and vocational German curriculum curated for Indian STEM and healthcare applicants moving to Germany.
                  </p>
                </div>

                {!isPremiumActive && (
                  <button
                    onClick={() => navigate('/checkout')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Unlock with Premium (₹999)</span>
                  </button>
                )}
              </div>

              {/* Extended Module Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Module 1: C1 Academic */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isPremiumActive ? 'bg-white border-[#DCE2DC] shadow-xs' : 'bg-[#F5F5EF] border-[#DCE2DC]/80 opacity-90'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Level C1
                      </span>
                      {isPremiumActive ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Available
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#344653]">
                        TestDaF & Academic C1 Hochschule Intensive
                      </h3>
                      <p className="text-xs text-[#71808A] mt-1 leading-relaxed">
                        Scientific vocabulary, academic debate argumentation, and graph synthesis required for direct master's entry at German TU9 universities.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#DCE2DC] flex items-center justify-between">
                    <span className="text-[11px] text-[#71808A] font-medium">8 Masterclass Units</span>
                    {isPremiumActive ? (
                      <a
                        href="https://www.testdaf.de/de/teilnehmende/vorbereitung/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#5F7D8B] hover:underline inline-flex items-center gap-1"
                      >
                        Start Prep <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#71808A]">Premium Only</span>
                    )}
                  </div>
                </div>

                {/* Module 2: Technical & Engineering */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isPremiumActive ? 'bg-white border-[#DCE2DC] shadow-xs' : 'bg-[#F5F5EF] border-[#DCE2DC]/80 opacity-90'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        Fachsprache
                      </span>
                      {isPremiumActive ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ Available
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#344653]">
                        Engineering & Tech Industry German
                      </h3>
                      <p className="text-xs text-[#71808A] mt-1 leading-relaxed">
                        Software engineering standup phrasing, DIN standard schematics, and manufacturing terminology for German technical interviews.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#DCE2DC] flex items-center justify-between">
                    <span className="text-[11px] text-[#71808A] font-medium">12 Specialized Vocab Packs</span>
                    {isPremiumActive ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#71808A]">Premium Only</span>
                    )}
                  </div>
                </div>

                {/* Module 3: 1-on-1 Speaking Coach */}
                <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  isPremiumActive ? 'bg-white border-[#DCE2DC] shadow-xs' : 'bg-[#F5F5EF] border-[#DCE2DC]/80 opacity-90'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        1-on-1 Coaching
                      </span>
                      {isPremiumActive ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ✓ 1 Session Incl.
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#344653]">
                        Live Speaking Diagnostic & Visa Mock
                      </h3>
                      <p className="text-xs text-[#71808A] mt-1 leading-relaxed">
                        30-minute mock German consulate visa interview and pronunciation audit conducted with an Educaro certified language evaluator.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#DCE2DC] flex items-center justify-between">
                    <span className="text-[11px] text-[#71808A] font-medium">Native German Evaluator</span>
                    {isPremiumActive ? (
                      <button
                        onClick={() => navigate('/journey/qualification')}
                        className="text-xs font-bold text-[#5F7D8B] hover:underline inline-flex items-center gap-1"
                      >
                        Book Slot →
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#71808A]">Premium Only</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-[#E8ECE5] rounded-2xl border border-[#DCE2DC] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#344653]">Ready to review your qualification assessment?</h4>
                <p className="text-xs text-[#71808A] mt-0.5">
                  See how your academic degrees and background map to German universities and visa regulations.
                </p>
              </div>
              <button
                onClick={() => navigate('/journey/qualification')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
              >
                <span>View Qualification Outcome →</span>
              </button>
            </div>
          </>
        )}

      </main>

      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
