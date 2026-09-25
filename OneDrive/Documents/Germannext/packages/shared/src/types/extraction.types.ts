import { Provenance } from '../enums/provenance.enum';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0.0 - 1.0
  sourceSnippet?: string;
  provenance: Provenance;
  isConfirmed?: boolean;
}

export type DocumentType =
  | 'DEGREE_CERTIFICATE'
  | 'LANGUAGE_CERTIFICATE'
  | 'PASSPORT'
  | 'VISA'
  | 'EXPERIENCE_LETTER'
  | 'CV';

export interface ExtractedDocument {
  id: string;
  documentType: DocumentType;
  filename: string;
  fileUrl?: string;
  previewUrl?: string;
  uploadedAt: string;
  extractedFields: ExtractedField[];
  overallConfidence: number;
  status: 'PENDING' | 'EXTRACTED' | 'REVIEWED' | 'CONFLICT_DETECTED';
}

export interface SideBySideReviewData {
  documentId: string;
  documentType: string;
  filename: string;
  previewImageUrl: string;
  fields: ExtractedField[];
}
