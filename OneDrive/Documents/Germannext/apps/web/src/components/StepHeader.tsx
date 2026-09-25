import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StepHeaderProps {
  currentStepIndex: number; // 1-indexed (e.g. 1 to 6)
  totalSteps?: number;
  stepTitle: string;
  stepSubtitle?: string;
  backRoute?: string;
  nextRoute?: string;
  canContinue?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStepIndex,
  totalSteps = 8,
  stepTitle,
  stepSubtitle,
  backRoute,
  nextRoute,
  canContinue = true,
  onContinue,
  continueLabel = 'Continue →',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (onContinue) {
      onContinue();
    } else if (nextRoute) {
      navigate(nextRoute);
    }
  };

  const stepsList = [
    { num: 1, label: 'Goal Intake' },
    { num: 2, label: 'Candidate Details' },
    { num: 3, label: 'Profile Building' },
    { num: 4, label: 'Video Intro' },
    { num: 5, label: 'Document Review' },
    { num: 6, label: 'Qualification' },
    { num: 7, label: 'German CV' },
    { num: 8, label: 'Recommended Next' },
  ];

  return (
    <div className="w-full bg-[#EEF1EB] border-b border-[#DCE2DC] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Back button + Step info */}
        <div className="flex items-center gap-3">
          {backRoute && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F5EF] hover:bg-[#E8ECE5] text-xs font-medium text-[#344653] border border-[#DCE2DC] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E5EDF0] text-[#718C9B] border border-[#DCE2DC]">
                Step {currentStepIndex} of {totalSteps}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#344653]">{stepTitle}</h1>
            </div>
            {stepSubtitle && (
              <p className="text-xs text-[#71808A] mt-0.5">{stepSubtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Steps tracker pills + Continue button */}
        <div className="flex items-center gap-4 justify-between md:justify-end">
          {/* Step dots / indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {stepsList.map((s) => {
              const isDone = s.num < currentStepIndex;
              const isCurrent = s.num === currentStepIndex;
              return (
                <div
                  key={s.num}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isCurrent
                      ? 'w-6 bg-[#5F7D8B]'
                      : isDone
                      ? 'bg-emerald-600'
                      : 'bg-[#DCE2DC]'
                  }`}
                  title={`${s.num}. ${s.label}`}
                />
              );
            })}
          </div>

          {/* Continue button */}
          {(nextRoute || onContinue) && (
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-xs transition-all ${
                canContinue
                  ? 'bg-[#5F7D8B] text-white hover:bg-[#4e6773]'
                  : 'bg-[#DCE2DC] text-[#71808A] cursor-not-allowed opacity-60'
              }`}
            >
              <span>{continueLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
