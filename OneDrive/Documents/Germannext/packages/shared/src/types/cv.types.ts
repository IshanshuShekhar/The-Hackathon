import { Provenance } from '../enums/provenance.enum';

export interface CVHeader {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  targetRoleOrDegree: string;
  provenance: Provenance;
}

export interface CVEducationItem {
  degree: string;
  institution: string;
  graduationYear: string;
  grade?: string;
  field: string;
  provenance: Provenance;
}

export interface CVExperienceItem {
  role: string;
  company: string;
  duration: string;
  bulletPoints: string[];
  provenance: Provenance;
}

export interface CVLanguageItem {
  language: string;
  level: string; // CEFR
  certificate?: string;
  provenance: Provenance;
}

export interface GermanCV {
  id: string;
  userId: string;
  header: CVHeader;
  summaryText: string;
  summaryProvenance: Provenance; // AI_GENERATED
  education: CVEducationItem[];
  experience: CVExperienceItem[];
  skills: { name: string; provenance: Provenance }[];
  languages: CVLanguageItem[];
  generatedAt: string;
}
