import { Pathway } from '../enums/pathway.enum';
import { Provenance } from '../enums/provenance.enum';

export type RecommendationType =
  | 'MISSING_INFO'
  | 'DOCUMENT'
  | 'LANGUAGE'
  | 'QUALIFICATION'
  | 'APPLICATION';

export type RecommendationPriority = 'REQUIRED' | 'IMPORTANT' | 'RECOMMENDED';

export type RecommendationStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface RecommendationItem {
  id: string;
  userId: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  status: RecommendationStatus;
  pathwayContext: Pathway;
  actionRoute?: string;
  actionLabel?: string;
  whyExplanation?: string;
  whyProvenance: Provenance;
  ruleId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReadinessScoreCategory =
  | 'EDUCATION'
  | 'LANGUAGE'
  | 'DOCUMENT'
  | 'QUALIFICATION'
  | 'APPLICATION';

export interface ReadinessScoreItem {
  category: ReadinessScoreCategory;
  scorePct: number; // 0 - 100
  status: 'EXCELLENT' | 'ON_TRACK' | 'ATTENTION_NEEDED' | 'ACTION_REQUIRED';
  reason: string;
}

export interface GapAnalysisResponse {
  readinessScores: ReadinessScoreItem[];
  overallReadinessPct: number;
  groupedRecommendations: {
    missingInfo: RecommendationItem[];
    documents: RecommendationItem[];
    language: RecommendationItem[];
    qualification: RecommendationItem[];
    application: RecommendationItem[];
  };
  nextBestAction: RecommendationItem | null;
  summary: string;
}

export interface UpdateRecommendationStatusDto {
  status: RecommendationStatus;
}

