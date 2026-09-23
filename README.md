# Your Story

A private, local-first workspace that helps students retrieve real experiences, turn them into confirmed story cards, and practise telling them. Buddy is the conversational guide; Your Story is the product.

This is a working software pilot built from **Your-Story-How-It-Works.pdf** and **Your-Story-Idea-1.pdf**. It includes the full guided story-to-practice loop. It does not include toy hardware, accounts, cloud sync or audio analysis.

## Run it

Requires Node.js 22 or later. There are **no npm dependencies** and no installation step.

```sh
npm start
```

Open `http://127.0.0.1:4173`. On Windows, double-click `start.cmd` and open the address it prints. Keep the terminal running while using the local app.

```sh
npm test
npm run check
```

The `dist/` directory is also a self-contained static website. Serve it over HTTP; do not double-click `index.html`, because browser module and storage behavior on `file:` URLs varies.

## What works

- Name, pasted CV, editable experience cues, role/company target and pasted job posting.
- A CV builder across seven areas of life, with an editable and downloadable CV draft.
- Buddy's Explore, Fill a gap and Build my CV entry points.
- A seven-question sequence: cue, specific moment, personal action, outcome and up to three values questions. Early review is available after the first values answer.
- Editable story cards, required factual confirmation, up to three skill tags, and the “I would have left this out” measure.
- A searchable story bank, eight-skill coverage map and reflection across the user's own values.
- Interview, short introduction and LinkedIn draft formats. Missing fields are marked `[add detail]`; there is no automatic social posting.
- Practice with scores hidden by default, evidence quotes, one priority fix, same-question retry comparison and a verbatim reordering of the student's answer.
- Three-question tests with feedback withheld until completion.
- Progress history, skill coverage, underrepresented rubric dimension, repeated-story usage and “I”/“we” counts.
- Device-local persistence, validated JSON export/import, individual deletion, linked-record cleanup and a full reset.
- Read-aloud through the browser's speech service; keyboard dictation can be used in all text fields.
- A clearly labelled fictional sample space. Sample changes stay in memory and do not replace the user's stored bank.

## Guided mode and optional AI

**Static hosting runs guided mode.** Question stages, CV cues, skill suggestions, drafts and coaching estimates work without an API key. They are deliberately labelled and are not presented as model output.

The included local server connects directly to Google's Gemini API, with **`gemini-2.5-flash`** as the default. No additional packages are needed.

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Keep the project on the free tier if you want a free demonstration; this app cannot determine your billing tier.
2. Open `.env` in the project folder (or copy `.env.example` to `.env` if using the source archive).
3. Set these values locally. Do not paste your key into chat or the browser:

   ```dotenv
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-2.5-flash
   PORT=4173
   ```

4. Run `npm start` or double-click `start.cmd`. Both automatically load `.env`. If the app is already running, stop that server with Ctrl+C and restart it after editing `.env`.
5. Reload the app, open **Settings**, and choose **Review & enable Gemini**. The consent applies only to the current browser session. A configured key is not proof of a working connection; the first question or practice request tests the connection.

Google currently lists free input/output usage for Gemini 2.5 Flash, with project-specific limits. See [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). The app does not enable billing, select a paid fallback model or automatically retry exhausted quota. A 429 response shows a quota message and continues in guided mode for that request. Check the selected project's actual quota in AI Studio before presenting.

The key stays on the server and is sent to Google in the `x-goog-api-key` header, never in a URL or to the browser. Enabling AI sends only the current conversation cue and answers, or the current practice question and answer. It does not send the full CV or story bank.

**Free-demo privacy:** Google's [unpaid-service terms](https://ai.google.dev/gemini-api/terms) allow submitted content and outputs to be used for product improvement and human review (regional exceptions apply). Use fictional sample stories for the free demonstration. Do not send personal, sensitive or confidential student information to unpaid services. There is no claim of zero provider retention.

AI selects the next question from a fixed set of non-leading questions, rather than generating assumed events. It can also return rubric feedback. Feedback is rejected if a quote is not an exact substring of the student's answer, if scores are outside 0–20, or if the five dimensions are incorrect. Rejection, timeouts and provider failures fall back visibly to local coaching.

**Live Gemini API calls were not made for this delivery; no key was supplied.** AI request construction, constrained output, evidence rejection and HTTP boundaries were verified with deterministic mocked responses. Voice playback and OS dictation were not hardware-tested.

Official implementation references: [Gemini generateContent](https://ai.google.dev/api/generate-content) and [structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

## Data and privacy

Personal data is stored under `your-story.v1` in localStorage for the current browser origin. Unconfirmed conversation text remains in memory. Story saving, profile saving, CV saving and practice submission require explicit confirmation. A test is committed only after all three answers are complete.

- Localhost and a hosted preview are **different storage locations**. Use export/import to move between them.
- Browser data is not encrypted by this app. Use a private browser profile on shared devices.
- Clearing browser data removes the bank. Export backups before changing devices.
- Invalid imports are rejected before replacement. A damaged existing store is left intact for recovery export.
- Stale-tab checks prevent common overwrites. This single-user pilot is not a transactional, multi-tab collaborative database.
- Deleting a story removes its linked drafts and practice answers. It cannot retract copies already downloaded, copied to a clipboard, or sent to an AI provider.
- Existing exported backups remain where the user saved them. The app cannot erase those copies.
- No analytics, external fonts, background tracking or automatic posting are included.

The optional Node server binds to loopback only, validates Host/Origin, accepts only same-origin JSON for AI, enforces request limits and keeps secrets outside the static directory. **Do not expose it publicly as a shared AI server.** A shared deployment needs authentication, per-user quotas, abuse protection and secret management before enabling paid AI calls.

## Project layout

| File | Responsibility |
| --- | --- |
| `dist/index.html` | App entry point and metadata |
| `dist/style.css` | Responsive workspace theme |
| `dist/app.js` | Views, form actions and in-memory sessions |
| `dist/core.js` | Validation, story rules, local coaching and persistence boundary |
| `server.mjs` | Loopback static server and protected optional AI endpoint |
| `ai.mjs` | Structured API requests and response validation |
| `tests/product.test.mjs` | Runnable product, persistence, AI and HTTP checks |
| `docs/PRODUCT.md` | Product interpretation, assumptions and scope |
| `docs/VALIDATION.md` | Tested behavior, limits and pilot acceptance procedure |

## Demo troubleshooting

- **Gemini not configured:** check `GEMINI_API_KEY` in `.env`, restart the server, and reload the browser.
- **Request rejected:** check the key, Gemini API project access and the model ID in AI Studio. The model variable takes an ID such as `gemini-2.5-flash`, not a URL or a `models/` prefix.
- **Quota reached:** wait for the quota reset or use guided mode. Free access is limited; retries cannot create quota.
- **Local feedback appears:** the AI request failed, was blocked, timed out, or failed evidence validation. The UI shows the reason and falls back without losing your answer.
- **Port already in use:** stop the previous Your Story server before restarting. Changing `PORT` changes the browser storage origin; export your stories first if moving ports.

## Before a student pilot

Use the acceptance procedure in `docs/VALIDATION.md`. The app is ready for a supervised guided-mode usability pilot, **not** a validated employment assessment. Local rubric scores are heuristic. AI feedback also needs comparison with human raters. The supplied research claims have not been independently verified and are not repeated as evidence of this app's effectiveness.
