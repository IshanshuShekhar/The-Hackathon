export interface DiscrepancyItem {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  sourceA: {
    sourceType: 'DOCUMENT' | 'CHAT' | 'PROFILE';
    sourceName: string;
    value: string;
    dateOrSnippet?: string;
  };
  sourceB: {
    sourceType: 'DOCUMENT' | 'CHAT' | 'PROFILE';
    sourceName: string;
    value: string;
    dateOrSnippet?: string;
  };
  clarifyingQuestion: string;
  suggestedOptions: string[];
  severity: 'CRITICAL' | 'WARNING';
  isResolved: boolean;
  resolvedValue?: string;
}

export interface InconsistencyReport {
  hasInconsistency: boolean;
  discrepancies: DiscrepancyItem[];
}

export interface ResolveInconsistencyDto {
  discrepancyId: string;
  resolvedValue: string;
  resolutionNote?: string;
}
