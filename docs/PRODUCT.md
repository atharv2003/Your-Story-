# Product analysis and implementation decisions

## What we are building

The problem is retrieval before presentation. A student often has useful experience but cannot retrieve a specific episode when an application asks for evidence. A blank form or polished rewriting tool starts too late.

Your Story therefore has one central loop:

1. Use an experience the student actually supplied as a cue.
2. Ask for a concrete moment, their action and its outcome.
3. Ask why it mattered, with no more than three values questions.
4. Let the student edit and confirm a story card.
5. Reuse those confirmed facts for a particular format.
6. Practise an answer, receive one fix, and try again.

The story bank and repeatable retrieval method are the product. Buddy gives the interaction continuity. The stuffed toy is an optional delivery surface; no hardware code is necessary for this software milestone.

## How the supplied documents were treated

Both documents were read in full: three pages in `Your-Story-How-It-Works.pdf` and four pages in `Your-Story-Idea-1.pdf`. They are product source material, not instructions granting permission to publish student data, contact people, buy equipment or repeat research claims as verified facts.

The Q&A document describes a “working web app” as already existing. No implementation was present in this workspace, so that statement was treated as the intended product description, not proof that an existing app had been located or verified.

The published research numbers and broad competitor claims in the Q&A were not independently verified. This implementation makes no treatment, learning-effect, hiring-outcome, adoption or cost-per-session claim.

## Decisions where the brief is incomplete or in tension

| Topic | Decision and reason |
| --- | --- |
| “Guess a specific moment” vs “never put a memory in your mouth” | Use open questions without presupposing a failure, conflict or accomplishment. Optional AI selects from those questions. The non-leading rule wins. |
| Eight skills are referenced but not named | Provisional labels: Communication, Teamwork, Problem solving, Initiative, Adaptability, Leadership, Creativity and Resilience. Users edit tags on each story. These are not presented as an official competency taxonomy. |
| “Nothing is saved until confirmed” vs remembering next time | Confirmed profile and story data persists; raw conversations remain in memory until the story is confirmed. Partial tests are not persisted. |
| “Asks, never tells” vs drafting and feedback | Discovery asks questions. Drafts only assemble the student's facts; reflection offers a tentative question; coaching is labelled as an estimate. The app never invents biographical details. |
| Local by default vs cloud AI | Guided mode is entirely local. Gemini is optional, server-configured, and requires session consent. Its payload excludes the full bank and CV. Use fictional stories for free-tier demonstrations because Google’s unpaid-service terms permit product-improvement use. |
| Interview answers should last 60–90 seconds | Show a word count and a rough 2.4 words/second estimate. Never invent detail or pad a short story to claim the target duration. |
| A stronger answer with the same facts | Reorder exact sentences from the answer. This is conservative editing, not unrestricted generated prose. |
| Find the thread | Show repeated value words and exact value statements side by side. Ask the student what connects them; avoid asserting a personality diagnosis. |
| Score out of 100 | Implement the five requested 20-point dimensions and bands. Local estimates are transparent lexical signals. These are not validated readiness scores. |
| Accounts, sync, company research, audio analysis | Deferred, consistent with the source's explicit “not built yet” scope. |

## Requirement map

| Product capability | Delivered behavior |
| --- | --- |
| CV onboarding | Name, pasted CV, optional target; source lines can be proposed as editable cues |
| No CV | Seven-area builder; confirmed activities feed future discovery and CV draft |
| Pasted job posting | Keyword-based skill suggestions reviewed by the student |
| Explore | Student chooses an experience cue or writes another |
| Fill a gap | Uses coverage and target skills to choose a concrete prompt without displaying a competency label in the question |
| Laddering | Up to three values questions, with earlier review available |
| Memory bank | Search, skill filtering, editing, deletion, source notes and confirmation |
| Skills map | Counts only confirmed story tags, maximum three tags per card |
| Find the thread | Grounded value reflection across at least two cards |
| Story Studio | Interview, intro and private LinkedIn drafts; edit, save, copy, download and practise |
| Practice | Text/keyboard dictation, question read-aloud, hidden scores, quotes, single fix, retry delta |
| Test | Exactly three questions, no feedback until completion, all-or-nothing local save |
| Progress | Practice history, optional score trend, weakest rubric dimension, coverage, repeated stories and pronoun counts |
| Ownership and privacy | Device-local persistence, export/import, visible editable data, deletion and no automatic publication |

## Deliberate technical scope

A dependency-free browser application and a small optional Node server cover this pilot. There is no account system or central student database because the brief explicitly prioritises local ownership. The static app can be deployed independently; the paid AI route is restricted to a configured local server.

State has three lifetimes:

- **Ephemeral:** conversation answers before confirmation, unfinished tests, unsaved text, AI consent and sample-space changes.
- **Confirmed local:** profile/CV, story cards and their source notes, studio drafts, completed practice answers and test sessions.
- **Explicit copies:** downloaded text and JSON backups. These leave browser storage at the student's request.

Every stored story has source fields, a confirmation flag, a creation date, and at most three known tags. Practice records refer to an existing story. Import validates this relationship and exact feedback quotes. Deletion cascades through linked records.

## What “best” should mean for the next milestone

Quality should be measured by whether students retrieve true, previously overlooked stories, can correct the app, and return to their own words. More generation or a larger infrastructure stack would not establish that.

The next useful work is a supervised student pilot and human review of coaching quality. After that evidence exists, decide whether improved semantic retrieval, a richer competency taxonomy, authenticated sync or richer voice input solves an observed problem.
