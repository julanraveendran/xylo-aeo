import { XyloPayload } from './validator';
import { DeltaResult } from './delta';

export function renderReport(payload: XyloPayload, delta: DeltaResult): string {
  const date = new Date(payload.ran_at).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const chatgpt = payload.engines.chatgpt;
  const gemini = payload.engines.gemini;

  const engineSummary = `
| Engine | Visible | Score |
|--------|---------|-------|
| ChatGPT | ${chatgpt.visible ? 'Yes' : 'No'} | ${chatgpt.score}/3 |
| Gemini | ${gemini.visible ? 'Yes' : 'No'} | ${gemini.score}/3 |
`.trim();

  const competitorSection = payload.competitors_now.length > 0
    ? payload.competitors_now.slice(0, 10).map(c => `- ${c}`).join('\n')
    : '- None detected';

  const newCompetitorSection = delta.new_competitors.length > 0
    ? delta.new_competitors.map(c => `- ${c} *(new)*`).join('\n')
    : '- None';

  const changeSection = delta.score_change !== null
    ? `${delta.score_change > 0 ? '+' : ''}${delta.score_change} (${delta.label})`
    : 'First run — no previous data';

  return `# Xylo Visibility Report
**Customer:** ${payload.customer_id}
**URL:** ${payload.url}
**Query:** ${payload.query}
**Date:** ${date}
**Priority:** ${delta.priority}

---

## Visibility Score
**Current:** ${payload.current_score}/6
**Change:** ${changeSection}

${engineSummary}

---

## Competitors Appearing Instead
${competitorSection}

## New Competitors This Week
${newCompetitorSection}

---

## Status
${delta.label}

${delta.severity === 'declined' && delta.priority === 'P1'
  ? '⚠️ Urgent: Score has dropped significantly. Review content and distribution immediately.'
  : delta.severity === 'improved'
  ? '✅ Positive movement detected. Keep current strategy running.'
  : delta.severity === 'new'
  ? '📊 Baseline established. Next run will show changes.'
  : '➡️ No significant change. Monitor next week.'}
`.trim();
}