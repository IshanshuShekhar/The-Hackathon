import React, { useState } from 'react';
import { DiscrepancyItem } from '@educaro/shared';
import { AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface InconsistencyDialogProps {
  discrepancy: DiscrepancyItem;
  onResolve: (discrepancyId: string, resolvedValue: string) => Promise<void>;
  onClose?: () => void;
}

export const InconsistencyDialog: React.FC<InconsistencyDialogProps> = ({
  discrepancy,
  onResolve,
  onClose,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(discrepancy.suggestedOptions[0] || '');
  const [customValue, setCustomValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalVal = selectedValue === '__CUSTOM__' ? customValue : selectedValue;
      // Extract the actual value or year if formatted like "2022 (As stated on...)"
      const cleanVal = finalVal.split(' ')[0];
      await onResolve(discrepancy.id, cleanVal || finalVal);
      if (onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F5F5EF] rounded-2xl border border-rose-300 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#344653]">Consistency Agent Detected a Conflict</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-semibold uppercase">
                {discrepancy.severity}
              </span>
            </div>
            <p className="text-xs text-[#71808A]">Field in question: {discrepancy.fieldLabel}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Conflicting Sources Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#EEF1EB] border border-[#DCE2DC]">
              <span className="text-[10px] font-bold text-[#71808A] uppercase block">
                Source A: {discrepancy.sourceA.sourceName}
              </span>
              <span className="text-base font-extrabold text-[#344653] mt-1 block">
                {discrepancy.sourceA.value}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">
                Source B: {discrepancy.sourceB.sourceName}
              </span>
              <span className="text-base font-extrabold text-rose-800 mt-1 block">
                {discrepancy.sourceB.value}
              </span>
            </div>
          </div>

          {/* Targeted Clarifying Question */}
          <div className="p-3.5 bg-[#EEF1EB] rounded-xl border border-[#DCE2DC] text-xs text-[#344653]">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-[#5F7D8B]">
              <Sparkles className="w-4 h-4 text-[#718C9B]" />
              Agent Clarification Query:
            </p>
            <p className="leading-relaxed text-[#344653]">{discrepancy.clarifyingQuestion}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#71808A] uppercase tracking-wider block">
              Select Correct Verified Information:
            </span>

            {discrepancy.suggestedOptions.map((opt, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedValue === opt
                    ? 'bg-[#E5EDF0] border-[#718C9B] font-medium shadow-xs'
                    : 'bg-[#EEF1EB] border-[#DCE2DC] hover:bg-[#E8ECE5]'
                }`}
              >
                <input
                  type="radio"
                  name="discrepancy-opt"
                  checked={selectedValue === opt}
                  onChange={() => setSelectedValue(opt)}
                  className="mt-0.5 text-[#5F7D8B] focus:ring-[#718C9B]"
                />
                <span className="text-[#344653]">{opt}</span>
              </label>
            ))}

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedValue === '__CUSTOM__'
                  ? 'bg-[#E5EDF0] border-[#718C9B] font-medium shadow-xs'
                  : 'bg-[#EEF1EB] border-[#DCE2DC] hover:bg-[#E8ECE5]'
              }`}
            >
              <input
                type="radio"
                name="discrepancy-opt"
                checked={selectedValue === '__CUSTOM__'}
                onChange={() => setSelectedValue('__CUSTOM__')}
                className="mt-0.5 text-[#5F7D8B] focus:ring-[#718C9B]"
              />
              <span className="text-[#344653]">Specify another year / note</span>
            </label>

            {selectedValue === '__CUSTOM__' && (
              <input
                type="text"
                placeholder="e.g. 2023 (explain reason)"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#718C9B] bg-white text-[#344653] focus:outline-none"
              />
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#EEF1EB] border-t border-[#DCE2DC] flex items-center justify-between">
          <p className="text-[11px] text-[#71808A]">
            Rules require verified data before final visa assessment
          </p>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#5F7D8B] text-white hover:bg-[#4e6773] shadow-xs transition-colors"
          >
            <span>{isSubmitting ? 'Resolving...' : 'Confirm & Update Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
