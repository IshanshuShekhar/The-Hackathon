import { Pathway } from '../enums/pathway.enum';

export type JourneyStepId =
  | 'GOAL_INTAKE'
  | 'PROFILE_CHAT'
  | 'VIDEO_INTRO'
  | 'DOCUMENTS'
  | 'QUALIFICATION'
  | 'CV'
  | 'NEXT_STEPS';

export interface JourneyState {
  currentStep: JourneyStepId;
  completedSteps: JourneyStepId[];
  selectedPathway?: Pathway;
  profileCompletenessPct: number;
  nextBestAction: {
    title: string;
    description: string;
    targetRoute: string;
    ctaLabel: string;
  };
}

export interface ConsultantLeadScore {
  leadScore: number; // 0 - 100
  qualificationTier: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'NURTURE';
  explanationFactors: {
    factor: string;
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    points: number;
    description: string;
  }[];
  consultantSummaryNote: string;
}
