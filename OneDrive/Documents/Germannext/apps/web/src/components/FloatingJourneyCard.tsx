import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { ArrowRight, Compass, ShieldCheck, Mail, Sparkles } from 'lucide-react';

export const FloatingJourneyCard: React.FC = () => {
  const { user } = useAuth();
  const { journeyState } = useJourney();
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');

  const completeness = journeyState?.profileCompletenessPct ?? (user ? 45 : 82);
  const nextActionTitle = journeyState?.nextBestAction?.title ?? (user ? 'Upload your German language certificate' : 'Upload your German language certificate');
  const nextActionDescription = journeyState?.nextBestAction?.description ?? 'Complete your language credentials to unlock official state university matching.';
  const targetRoute = journeyState?.nextBestAction?.targetRoute ?? '/journey/goal';

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      navigate(targetRoute);
    } else {
      const q = emailInput ? `&email=${encodeURIComponent(emailInput)}` : '';
      navigate(`/auth?mode=signup${q}`);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-none bg-[#EEF1EB]/95 backdrop-blur-md rounded-3xl border border-[#DCE2DC] p-6 shadow-xl text-[#344653] transition-all hover:shadow-2xl">
      
      {/* Top Tag & Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5F7D8B] text-white flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718C9B] block">
              Active Roadmap
            </span>
            <h3 className="text-sm font-bold text-[#344653]">YOUR GERMANY JOURNEY</h3>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E5EDF0] text-[#5F7D8B] border border-[#DCE2DC]">
          Interactive
        </span>
      </div>

      {/* Profile Completeness Bar */}
      <div className="space-y-1.5 mb-5 bg-[#F5F5EF] p-3.5 rounded-2xl border border-[#DCE2DC]/70">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#71808A]">Profile completeness</span>
          <span className="font-bold text-[#344653]">{completeness}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#E8ECE5] overflow-hidden">
          <div
            className="h-full bg-[#5F7D8B] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Next Best Action Card */}
      <div className="p-4 rounded-2xl bg-[#F5F5EF] border border-[#DCE2DC] mb-5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#718C9B] uppercase tracking-wide mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NEXT BEST ACTION</span>
        </div>
        <p className="text-xs font-bold text-[#344653]">{nextActionTitle}</p>
        <p className="text-[11px] text-[#71808A] mt-1 leading-relaxed">
          {nextActionDescription}
        </p>
      </div>

      {/* CTA / Email Capture */}
      {user ? (
        <button
          onClick={() => navigate(targetRoute)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-sm font-semibold shadow-xs transition-colors"
        >
          <span>Continue Journey →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <form onSubmit={handleStart} className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71808A]" />
            <input
              type="email"
              required
              placeholder="Enter your email to begin..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#DCE2DC] bg-[#F5F5EF] text-xs sm:text-sm text-[#344653] placeholder:text-[#71808A] focus:outline-none focus:ring-1 focus:ring-[#718C9B]"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#5F7D8B] text-white hover:bg-[#4e6773] text-sm font-semibold shadow-xs transition-colors"
          >
            <span>Start My Journey →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Trust note */}
      <div className="mt-4 pt-3 border-t border-[#DCE2DC] flex items-center justify-between text-[11px] text-[#71808A]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#718C9B]" />
          Account-persisted data
        </span>
        <span>Free qualification assessment</span>
      </div>

    </div>
  );
};
