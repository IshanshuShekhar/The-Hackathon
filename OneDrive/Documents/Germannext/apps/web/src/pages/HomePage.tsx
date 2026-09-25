import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { FloatingJourneyCard } from '../components/FloatingJourneyCard';
import { FAQSection } from '../components/FAQSection';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Cpu,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5EF] flex flex-col text-[#344653]">
      {/* Top Navbar */}
      <Navbar onToggleTracePanel={() => setIsTraceOpen(!isTraceOpen)} isTraceOpen={isTraceOpen} />

      {/* Main Hero Section (PRD Section 9.1) */}
      <section className="relative overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center justify-center border-b border-[#DCE2DC]">
        {/* Cinematic Static Poster Image Background with dark desaturated overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/germany_hero_poster.svg"
            alt="Germany Skyline Background"
            className="w-full h-full object-cover"
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/germany_hero_poster.svg"
            aria-label="Germany skyline background video"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/images/1790019066-38c49f00.mp4" type="video/mp4" />
          </video>
          {/* Subtle gradient overlay to match Section 9 dark blue-gray atmosphere */}
          <div className="absolute inset-0 bg-[#344653]/65 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-white">
              
              {/* Small Pill / Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDF0]/20 text-[#E5EDF0] border border-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E5EDF0]" />
                <span>AI-POWERED GERMANY APPLICANT JOURNEY</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Your Pathway to Germany Starts Here.
              </h1>

              {/* Supporting Line */}
              <p className="text-lg sm:text-xl font-medium text-slate-200">
                One intelligent journey for studying, training, or building your career in Germany.
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Build your profile, understand your requirements, verify your documents, and discover your next best step — with AI guiding you throughout the journey.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={user ? '/journey/goal' : '/auth?mode=signup'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start My Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/25 backdrop-blur-xs transition-all"
                >
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Three Feature Checkmarks */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs sm:text-sm text-slate-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>AI-guided profile</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Document intelligence</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Evidence-based qualification</span>
                </span>
              </div>

            </div>

            {/* Right Hero Column: Floating Journey Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <FloatingJourneyCard />
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F5F5EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC] text-xs font-semibold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Architected for Indian Applicants</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#344653] tracking-tight">
              An Agentic Journey That Never Leaves You Guessing
            </h2>
            <p className="text-sm sm:text-base text-[#71808A] mt-3">
              From first contact to qualified Germany profile with minimal re-entry, transparent AI provenance, and zero hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Goal & Conversational Intake */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#5F7D8B] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#344653] mb-2">
                  1. Goal & Profile Intake
                </h3>
                <p className="text-xs sm:text-sm text-[#71808A] leading-relaxed">
                  Choose between University Study (Master’s/Bachelor’s), Dual Vocational Training (Ausbildung), or Direct Employment (EU Blue Card). Our Intake Agent captures your educational background in English or Hindi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE2DC] text-xs font-semibold text-[#5F7D8B] flex items-center gap-1">
                <span>Intake Agent Active</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Document Intelligence & Side-by-Side Review */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#5F7D8B] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#344653] mb-2">
                  2. Document Extraction & Conflict Check
                </h3>
                <p className="text-xs sm:text-sm text-[#71808A] leading-relaxed">
                  Upload degree certificates and Goethe/TestDaF language test scores. Extraction Agent pulls critical fields side-by-side with confidence scores, while Consistency Agent catches mismatched dates.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE2DC] text-xs font-semibold text-[#5F7D8B] flex items-center gap-1">
                <span>Extraction & Consistency Agents</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Rules-Based Qualification & CV */}
            <div className="bg-[#EEF1EB] rounded-3xl border border-[#DCE2DC] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#5F7D8B] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#344653] mb-2">
                  3. Deterministic Qualification & CV
                </h3>
                <p className="text-xs sm:text-sm text-[#71808A] leading-relaxed">
                  Deterministic rules assess eligibility without guesswork. Test scenarios with the What-If Simulator, generate your German DIN-standard Lebenslauf CV, and connect directly with Educaro advisors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#DCE2DC] text-xs font-semibold text-[#5F7D8B] flex items-center gap-1">
                <span>Qualification & CV Agents</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* Quick CTA Banner */}
          <div className="mt-16 bg-[#E8ECE5] rounded-3xl border border-[#DCE2DC] p-8 text-center max-w-3xl mx-auto shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[#344653] mb-2">
              Ready to explore your options in Germany?
            </h3>
            <p className="text-xs sm:text-sm text-[#71808A] mb-6">
              Create an account or login with email + OTP. No consultant fees required to build your verified profile.
            </p>
            <Link
              to={user ? '/journey/goal' : '/auth?mode=signup'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5F7D8B] hover:bg-[#4e6773] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <span>{user ? 'Enter Your Journey' : 'Start My Journey with OTP →'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Section 10 FAQ Accordion */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-[#EEF1EB] border-t border-[#DCE2DC] py-8 text-center text-xs text-[#71808A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#344653]">EduRoute AI</span>
            <span>• Powered by Educaro Deutschland GmbH</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#faq" className="hover:text-[#344653]">FAQ</a>
            <Link to="/journey/goal" className="hover:text-[#344653]">Your Journey</Link>
            <Link to="/candidate-details" className="hover:text-[#344653]">Candidate Details</Link>
          </div>
        </div>
      </footer>

      {/* Slide-out Agent Trace Panel */}
      <AgentTracePanel isOpen={isTraceOpen} onClose={() => setIsTraceOpen(false)} />
    </div>
  );
};
