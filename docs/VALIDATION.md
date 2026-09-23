# Validation and pilot guide

## Automated checks

**Latest result: 25 of 25 checks passed after the Gemini migration. No live API key was used.**

Run `npm test`. The suite uses Node's built-in test runner and makes **no real AI calls**. It covers:

- Empty initial state and explicit fictional sample data.
- Confirmation before a story can be stored; required source fields and tag limits.
- Drafts containing only confirmed field text and explicit missing-detail markers.
- Seven bounded question stages and open AI question options.
- Rubric bounds, totals, exact quote evidence, empty answers and score-band boundaries.
- Answer restructuring that does not create new sentences.
- Deletion of linked drafts and practice history.
- Backup round trips, schema/version validation, duplicate identifiers and broken references.
- Storage round trips, stale-tab overwrites and quota failure behavior.
- CV cue extraction, editable skill suggestions, target-aware questions and value reflection.
- HTML escaping of student-provided text.
- AI consent/input checks, constrained question selection, Gemini JSON schema and server-only API-key headers and rejection of invented quotes.
- HTTP serving, secret exclusion, method restrictions, same-origin checks, missing consent and oversized request rejection.

Run `npm run check` for syntax checks.

## Browser walkthrough performed for the original guided build

Using the sample space, the following were exercised through the visible interface:

1. Start Explore from a stored experience cue.
2. Answer all seven questions and review the resulting source fields.
3. Attempt to save without factual confirmation: blocked.
4. Confirm the story and the “would have left out” measure; verify the bank updates.
5. Open the card, create an interview draft from its confirmed facts, and save it.
6. Practise the story; verify scores are hidden, evidence quotes are displayed, and score reveal works.
7. Complete a three-question test; verify no feedback after answers one and two, then feedback after answer three.
8. Edit and save a CV draft; navigate away and return; verify the edit remains in the current state.
9. Add a self-taught experience through the CV builder and verify it appears in discovery cues.
10. Validate the optional WebMCP navigation tool with a valid view and rejection of an invalid view.
11. Inspect the home workspace at 390px and 1440px viewport widths and check all six main views at mobile width; no document-level horizontal overflow was observed after the responsive containment fix.
12. Inspect the browser console: no application errors observed during the walkthrough.

These UI tests used fictional data. Persistence and failure handling were additionally tested at the storage boundary. No user resume or personal story was sent to an AI provider.

## Important unverified boundaries

- **Live Gemini behavior:** not verified. Tests inject deterministic Gemini generateContent outputs. A configured API key and an appropriate model are required for a live integration check.
- **Human coaching validity:** neither the local rubric nor AI feedback has been calibrated against trained human raters.
- **Voice:** browser speech playback and OS keyboard dictation depend on device support; microphone permissions and actual audio were not tested.
- **Browser coverage:** the UI walkthrough used the Codex in-app browser. Safari, Firefox and mobile operating-system dictation still need testing.
- **Long-term storage:** browser eviction, shared-device privacy and a full encrypted backup strategy are not solved by localStorage.
- **Multi-user service:** no accounts, sync, multi-tenant quotas, shared AI endpoint or institutional privacy review.
- **Research and outcomes:** no student pilot, hiring improvement, therapeutic effect or learning-effect claim has been established.

## Acceptance procedure before a 20-student pilot

1. Explain local storage, optional AI, export/delete controls and that participation is voluntary. Use a personal browser profile or a deliberately isolated session on a shared device.
2. Before Buddy, give one application-style question. Measure time to the first specific episode, without collecting unnecessary personal details.
3. Run a guided session. Observe whether the cue is recognisable, the questions remain non-leading and the student can correct everything.
4. Count confirmed cards and cards marked “I would have left this out.” Do not count unconfirmed transcript text as a discovered story.
5. Have the student practise once, apply the single fix, and retry the same question. Compare like-for-like methods; do not interpret heuristic score changes as validated gains.
6. Ask a human reviewer to assess the answer against the five rubric dimensions, blind to the app's score where feasible.
7. Ask whether any prompt implied a memory, whether any draft added a fact, and whether the student understood where data was stored.
8. Let the student export or delete their data themselves. Do not retain a copy without separately obtaining their permission.

Success for this milestone: students can retrieve and confirm specific experiences, identify their own values, correct the software, and complete the loop without fabricated facts or unclear data ownership.
