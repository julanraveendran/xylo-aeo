export type DeltaSeverity = 'improved' | 'declined' | 'stable' | 'new';

export interface DeltaResult {
  severity: DeltaSeverity;
  priority: 'P1' | 'P2' | 'P3';
  label: string;
  score_change: number | null;
  new_competitors: string[];
  lost_competitors: string[];
}

export function computeDelta(
  currentScore: number,
  previousScore: number | null,
  competitorsNow: string[],
  competitorsPrevious: string[]
): DeltaResult {
  const newCompetitors = competitorsNow.filter(c => !competitorsPrevious.includes(c));
  const lostCompetitors = competitorsPrevious.filter(c => !competitorsNow.includes(c));

  if (previousScore === null) {
    return {
      severity: 'new',
      priority: 'P3',
      label: 'First run — no previous data to compare',
      score_change: null,
      new_competitors: newCompetitors,
      lost_competitors: lostCompetitors
    };
  }

  const change = currentScore - previousScore;

  let severity: DeltaSeverity;
  let priority: 'P1' | 'P2' | 'P3';
  let label: string;

  if (change <= -10) {
    severity = 'declined';
    priority = 'P1';
    label = `Score dropped sharply by ${change}`;
  } else if (change < 0) {
    severity = 'declined';
    priority = 'P2';
    label = `Score declined by ${change}`;
  } else if (change >= 10) {
    severity = 'improved';
    priority = 'P3';
    label = `Score improved by +${change}`;
  } else if (change > 0) {
    severity = 'improved';
    priority = 'P3';
    label = `Score improved slightly by +${change}`;
  } else {
    severity = 'stable';
    priority = 'P3';
    label = 'Score unchanged';
  }

  if (newCompetitors.length > 0 && priority === 'P3') {
    priority = 'P2';
  }

  return {
    severity,
    priority,
    label,
    score_change: change,
    new_competitors: newCompetitors,
    lost_competitors: lostCompetitors
  };
}