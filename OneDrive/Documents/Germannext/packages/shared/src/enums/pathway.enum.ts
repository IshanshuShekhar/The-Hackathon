export enum Pathway {
  STUDY = 'STUDY',
  VOCATIONAL = 'VOCATIONAL', // Ausbildung
  AUSBILDUNG = 'VOCATIONAL', // Alias for Ausbildung
  EMPLOYMENT = 'EMPLOYMENT',
}

export const PATHWAY_CONFIG: Record<string, { title: string; description: string; minGermanLevel: string }> = {
  [Pathway.STUDY]: {
    title: 'University Study',
    description: 'Bachelor or Master degree programs at German universities',
    minGermanLevel: 'B2',
  },
  [Pathway.VOCATIONAL]: {
    title: 'Vocational Training (Ausbildung)',
    description: 'Dual vocational training programs with paid company apprenticeship',
    minGermanLevel: 'B1',
  },
  [Pathway.EMPLOYMENT]: {
    title: 'Direct Employment / EU Blue Card',
    description: 'Skilled work immigration, EU Blue Card, or Opportunity Card (Chancenkarte)',
    minGermanLevel: 'A2',
  },
};
