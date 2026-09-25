import { QualificationStatus } from '../enums/qualification.enum';
import { Pathway } from '../enums/pathway.enum';
import { CEFRLevel } from '../enums/cefr.enum';

export interface MissingRequirement {
  id: string;
  category: 'LANGUAGE' | 'DEGREE' | 'EXPERIENCE' | 'DOCUMENT' | 'FINANCIAL';
  title: string;
  description: string;
  severity: 'BLOCKING' | 'RECOMMENDED';
  actionableStep: string;
}

export interface GermanReadinessTrack {
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  estimatedMonthsToTarget: number;
  readinessHeadline: string;
  tutorialModules: {
    id: string;
    title: string;
    level: CEFRLevel;
    duration: string;
    videoUrl: string;
    description: string;
  }[];
}

export interface GermanResource {
  id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'A1-B1';
  provider: 'Deutsche Welle (DW)' | 'Goethe-Institut' | 'Easy German';
  url: string;
  type: 'Structured Course' | 'Interactive Exercises' | 'Video & Audio Immersion';
  isPrimary?: boolean;
}

export interface GermanReadinessCalculation {
  currentLevel: string; // e.g. "A1", "A2", "NONE", or "Not yet assessed"
  targetLevel: string;  // e.g. "B1" (Ausbildung) or "B2" (Study / Employment)
  stagesRemaining: number;
  weeksPerLevel: number; // Configurable constant: 8 weeks
  hoursPerWeek: number;  // 10-12 hours/week
  estimatedWeeks: number;
  estimatedMonths: number;
  formulaExplanation: string; // "Calculation: (Target B1 - Current A1 = 2 stages) × 8 weeks = 16 weeks (~4 months) at 10-12 hrs/week."
}

export interface GermanLearningPathData {
  needsGermanSupport: boolean;
  chosenPathway: string;
  readiness: GermanReadinessCalculation;
  resources: GermanResource[];
}

export interface QualificationDiff {
  previousStatus: QualificationStatus;
  simulatedStatus: QualificationStatus;
  statusChanged: boolean;
  scoreDelta: number;
  unlockedRequirementsCount: number;
  summaryText: string;
}

export interface SimulationResultPayload {
  evaluation: QualificationEvaluation;
  diff: QualificationDiff;
}

export interface QualificationEvaluation {
  pathway: Pathway;
  status: QualificationStatus;
  scorePct: number;
  headline: string;
  summary: string;
  needsGermanSupport: boolean;
  actualGermanLevel?: string;
  passedCriteria: string[];
  missingRequirements: MissingRequirement[];
  germanReadiness?: GermanReadinessTrack;
  simulations?: Record<string, QualificationEvaluation>;
  recommendedService: {
    title: string;
    description: string;
    priceInr?: number;
    entitlementKey: string;
  };
}

export interface WhatIfCriteria {
  germanLevel?: CEFRLevel;
  yearsOfExperience?: number;
  hasDegreeRecognition?: boolean;
  targetPathway?: Pathway;
}

export interface WhatIfResult {
  previousStatus: QualificationStatus;
  simulatedStatus: QualificationStatus;
  changes: string[];
  nowEligiblePathways: Pathway[];
}
