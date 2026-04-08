# CLAUDE.md

## Project
Xylo AEO measures AI search visibility for SaaS founders.
Users input a URL and query, Xylo checks ChatGPT and Gemini multiple times,
scores visibility, surfaces competitors, and provides personalised fixes.

## Product rules
- Never change scoring logic without documenting it
- Never remove historical results or overwrite previous run data
- Always keep raw check outputs separate from interpreted outputs
- Treat engine-specific output as first-class data, not a merged guess
- New features should improve clarity, repeatability, or reporting

## Development priorities
1. Reliability of checks
2. Historical tracking
3. Report generation
4. Query suggestion tooling
5. UX polish

## Code standards
- Prefer small, composable functions
- Keep parsing logic separate from UI logic
- Keep report generation separate from check execution
- Log all failed runs with enough context for replay

## File conventions
- Raw check outputs go in /data/checks/
- Interpreted report payloads go in /data/reports/
- Alert logic lives in /lib/alerts/
- Engine parsers live in /lib/engines/
- Report templates live in /lib/reports/

## When building features
1. Explain the feature in plain English
2. Identify which existing modules are affected
3. Propose the smallest viable implementation
4. Implement
5. Update changelog if behavior changed

## Forbidden shortcuts
- Do not fabricate test data that looks like production results
- Do not hardcode competitor names into logic
- Do not silently change payload schema
- Do not merge ChatGPT and Gemini outputs into one field

## Good feature ideas
- Weekly trend dashboard
- Query suggestion generator
- Report quality validator
- Competitor cluster summary
- Before/after case study generator

## Output preference
When implementing a feature, first provide:
- Concise plan
- Affected files
- Risks
Then code.