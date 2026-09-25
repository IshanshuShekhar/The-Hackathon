export enum CEFRLevel {
  NONE = 'NONE',
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const CEFR_ORDER: Record<CEFRLevel, number> = {
  [CEFRLevel.NONE]: 0,
  [CEFRLevel.A1]: 1,
  [CEFRLevel.A2]: 2,
  [CEFRLevel.B1]: 3,
  [CEFRLevel.B2]: 4,
  [CEFRLevel.C1]: 5,
  [CEFRLevel.C2]: 6,
};

export function isCEFRAtLeast(current: CEFRLevel, required: CEFRLevel): boolean {
  return CEFR_ORDER[current] >= CEFR_ORDER[required];
}
