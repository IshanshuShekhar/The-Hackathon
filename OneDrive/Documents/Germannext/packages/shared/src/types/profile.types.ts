import { Provenance, AIAllowedProvenance } from '../enums/provenance.enum';
import { Pathway } from '../enums/pathway.enum';
import { CEFRLevel } from '../enums/cefr.enum';

/**
 * Hard Rule 1: Every profile field carries a provenance label.
 */
export interface ProvenanceField<T> {
  value: T;
  provenance: Provenance;
  confidence?: number;
  sourceDocumentId?: string;
  sourceSnippet?: string;
  updatedAt: string;
}

/**
 * Payload used when AI updates a field: strictly disallows Provenance.VERIFIED
 */
export interface AIAttributeUpdate<T> {
  value: T;
  provenance: AIAllowedProvenance;
  confidence?: number;
  sourceDocumentId?: string;
  sourceSnippet?: string;
}

export interface EducationEntry {
  id: string;
  institution: ProvenanceField<string>;
  degree: ProvenanceField<string>;
  field: ProvenanceField<string>;
  graduationDate: ProvenanceField<string>;
  gradeOrGpa?: ProvenanceField<string>;
}

export interface EmploymentEntry {
  id: string;
  employer: ProvenanceField<string>;
  role: ProvenanceField<string>;
  responsibilities: ProvenanceField<string>;
  startDate: ProvenanceField<string>;
  endDate?: ProvenanceField<string>;
  isCurrent?: ProvenanceField<boolean>;
}

export interface LanguageSkill {
  id: string;
  language: ProvenanceField<string>;
  level: ProvenanceField<CEFRLevel>;
  certificate?: ProvenanceField<string>;
  score?: ProvenanceField<string>;
}

export interface ApplicantProfile {
  id: string;
  userId: string;
  name: ProvenanceField<string>;
  email: ProvenanceField<string>;
  phone?: ProvenanceField<string>;
  location?: ProvenanceField<string>;
  targetPathway: ProvenanceField<Pathway>;
  education: EducationEntry[];
  employment: EmploymentEntry[];
  languages: LanguageSkill[];
  skills: ProvenanceField<string[]>;
  completenessScore: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFieldRecord {
  id: string;
  userId: string;
  category: string;
  fieldKey: string;
  value: string;
  provenance: Provenance;
  confidence?: number | null;
  sourceDocumentId?: string | null;
  sourceSnippet?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface UpsertFieldDto {
  category: string;
  fieldKey: string;
  value: string;
  provenance?: Provenance;
  confidence?: number;
  sourceDocumentId?: string;
  sourceSnippet?: string;
}
