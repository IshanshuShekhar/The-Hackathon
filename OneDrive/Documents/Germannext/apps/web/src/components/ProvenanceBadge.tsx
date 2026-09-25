import React from 'react';
import { Provenance, PROVENANCE_LABELS } from '@educaro/shared';
import { CheckCircle2, User, Sparkles, Bot } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: Provenance;
  sourceText?: string;
  confidence?: number;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  sourceText,
  confidence,
  className = '',
}) => {
  const meta = PROVENANCE_LABELS[provenance];

  const getIcon = () => {
    switch (provenance) {
      case Provenance.VERIFIED:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case Provenance.APPLICANT_PROVIDED:
        return <User className="w-3.5 h-3.5 text-blue-600" />;
      case Provenance.AI_EXTRACTED:
        return <Bot className="w-3.5 h-3.5 text-amber-600" />;
      case Provenance.AI_GENERATED:
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  const getStyle = () => {
    switch (provenance) {
      case Provenance.VERIFIED:
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case Provenance.APPLICANT_PROVIDED:
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case Provenance.AI_EXTRACTED:
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case Provenance.AI_GENERATED:
        return 'bg-purple-50 text-purple-800 border-purple-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStyle()} ${className}`}
      title={sourceText || meta.description}
    >
      {getIcon()}
      <span>{meta.label}</span>
      {typeof confidence === 'number' && (
        <span className="opacity-75 font-mono text-[10px]">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
};
