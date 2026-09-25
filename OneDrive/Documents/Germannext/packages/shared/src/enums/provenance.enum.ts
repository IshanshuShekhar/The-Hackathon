export enum Provenance {
  VERIFIED = 'VERIFIED',
  APPLICANT_PROVIDED = 'APPLICANT_PROVIDED',
  AI_EXTRACTED = 'AI_EXTRACTED',
  AI_GENERATED = 'AI_GENERATED',
}

/**
 * Types of provenance that AI agents/tools are permitted to emit.
 * Enforces Hard Rule 1: AI writing paths must never be able to set VERIFIED.
 */
export type AIAllowedProvenance = Exclude<Provenance, Provenance.VERIFIED>;

export const PROVENANCE_LABELS: Record<Provenance, { label: string; color: string; description: string }> = {
  [Provenance.VERIFIED]: {
    label: 'Verified',
    color: '#10B981', // green
    description: 'Confirmed through official check or consultant review',
  },
  [Provenance.APPLICANT_PROVIDED]: {
    label: 'Applicant Provided',
    color: '#3B82F6', // blue
    description: 'Provided or directly confirmed by the applicant',
  },
  [Provenance.AI_EXTRACTED]: {
    label: 'AI Extracted',
    color: '#F59E0B', // amber
    description: 'Extracted by AI from document/video; awaiting confirmation',
  },
  [Provenance.AI_GENERATED]: {
    label: 'AI Generated',
    color: '#8B5CF6', // purple
    description: 'Generated text (e.g. CV summary); marked for transparency',
  },
};
