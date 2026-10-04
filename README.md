# Voice AI Sales Showcase

[Open the live showcase](https://hcj00112233.github.io/voice-ai-sales-showcase/showcase/#demo) · [Explore the workflow](https://hcj00112233.github.io/voice-ai-sales-showcase/workflow/?scenario=lisan)

**Turn account research into a focused outreach plan and a review-ready sales handoff.**

An English-language portfolio prototype for an application to ElevenLabs' Sales Development – Middle East role. It pairs an interactive voice AI showcase with a sample-only sales preparation workflow for fictional MENA accounts. This is an independent project, not an official ElevenLabs product. No customers, commercial results, or production usage are claimed.

## The sales problem

Account research is often disconnected from the first outreach email and the context an Account Executive receives. This prototype keeps the source information, fit rationale, use-case hypothesis, discovery questions, and reviewed email together. It helps prepare a conversation without claiming that an account is qualified.

## Run locally

Use Node.js 22 or later (verified with Node.js 24) and npm. From this project directory:

```sh
npm ci
npm run dev
```

Open [the local app](http://127.0.0.1:3000), then **Explore the demo** for the scenario collection. The collection also opens directly at `/showcase`. **Explore the workflow** carries the selected fictional account into `/workflow`. In an empty workspace, choose **Try a sample account** to begin without credentials. The development and production commands bind to the loopback interface only.

For a production build:

```sh
npm run build
npm start
```

## GitHub Pages showcase

The public GitHub Pages version is a static, sample-only build. It keeps the interactive Three.js hero, showcase scenarios, and full sample workflow. It does not include the generation API or make live AI requests; use the local server instructions above for Live AI mode. The static build uses the repository path `/voice-ai-sales-showcase` and supports `/voice-ai-sales-showcase/showcase#demo` and `/voice-ai-sales-showcase/workflow?scenario=lisan` (also `learning`, `localization`, or `care`).

Build the site with:

```sh
npm run build:pages
```

This creates the deployable static files in `out/` using an isolated staging copy, so it does not replace the normal Next.js build or its `.next/` output. Publish the contents of `out/` to the repository's `gh-pages` branch, then set GitHub Pages to deploy from that branch's root. Do not publish `.env.local` or credentials; the Pages build does not require them.

To check the source and workflow:

```sh
npm run typecheck
npm test
```

## The five stages

1. **Account Brief:** Enter a company, market, industry, business description, pasted source notes, and an optional reference URL. Only the company name is required. Sparse information should prompt research, not invented facts. No website is fetched.
2. **Fit & Evidence:** Review Explore, Research further, or Deprioritize with a rationale. Exact source quotes are labeled **Provided evidence**; possible value is a **Hypothesis**; missing information is **Unknown**. There is no numerical lead score.
3. **Voice AI Use Case:** Explore one conditional use case, a suggested buyer function, three discovery questions, and pilot validation requirements.
4. **Outreach Draft:** Edit the subject and body, copy the current version, or restore the original generated version. Generated drafts have 80–120 words; human edits are allowed outside that range and the count stays visible. The demo never sends email.
5. **Review & AE Handoff:** Check all three review items, then approve the preparation package. Approval records review of materials only. Commercial status remains **Discovery pending**. Export the current package as Markdown or JSON; exports made before approval say **Unreviewed draft**.

Changing any account input or the output mode marks the previous result outdated, clears review checks and approval, and blocks current-use actions and export until regeneration. Reverting an input does not silently restore approval. Editing or resetting the email removes approval and its outreach review check. Account data stays in React memory; refreshing, closing the tab, loading another sample, or resetting clears it. Export before leaving to retain a package.

## Sample output mode

Three explicitly fictional accounts have prewritten outputs:

| Account            | Context                                         | Sample priority  |
| ------------------ | ----------------------------------------------- | ---------------- |
| Lisan Learning     | UAE English learning platform        | Explore          |
| Sahab Localization | Saudi content-localization agency               | Explore          |
| Bayt Basket        | Gulf e-commerce business with English support | Research further |

The e-commerce example deliberately leaves voice demand unproven because the supplied notes establish text channels only. All samples retain unknown budget, timeline, vendors, and decision-makers. There are no fabricated URLs or contacts.

Sample output mode makes no model request and displays no artificial processing activity. It works only when the account exactly matches one of the three provided samples. Changing a sample makes it a custom account; switch to Live AI mode or reload the original sample to continue.

## Live AI mode

Copy `.env.example` to `.env.local`, add your own API key, and restart the server:

```sh
cp .env.example .env.local
```

Set `OPENAI_API_KEY` to your actual key. `OPENAI_MODEL` defaults to `gpt-4o-mini` and can be changed to an available model that supports the Responses API and strict structured outputs. A configuration indicator confirms that a non-placeholder key is present, not that provider access, billing, or model access has been tested.

One server-side request to OpenAI's Responses API supplies the assessment, use case, and outreach. Generating sends all supplied account fields to that provider. The request uses `store: false`; provider processing remains subject to the API account's data policies. The app itself has no database, persistence, analytics, or account-data logging. Secrets are read only by server code and never exposed through a public environment variable.

The prompt treats all account fields as untrusted data and forbids following embedded instructions. Zod validates inputs and the model's structured output. Additional checks require every evidence quote to occur verbatim in the supplied notes, exactly three questions, an 80–120 word initial email, and **Research further** when no evidence is returned. Missing fields, unsupported quotes, refusals, incomplete responses, rate limits, network errors, and timeouts produce useful errors while preserving the account and any prior edits. Outputs render as text, never injected HTML.

Implementation references: [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) and [Next.js App Router setup](https://nextjs.org/docs/app/getting-started/installation).

## Design and implementation

Next.js App Router, TypeScript, React, native HTML forms/dialogs, straightforward CSS, Phosphor icons, and Zod. A single reducer owns the workflow, source revision, review checks, and approval state. Late responses cannot overwrite a changed brief. The handoff is assembled locally from the current reviewed fields, with no second model call.

The interface uses a neutral background, black-and-white brand palette, visible keyboard focus, semantic labels, horizontal workflow navigation, and compact mobile navigation. Inputs and output panels share one workspace. Native dialogs support keyboard dismissal and focus containment. The showcase includes an animated Three.js voice sculpture and interactive audio demos.

The refined workspace uses self-hosted Inter typography, a persistent action bar, larger form controls, and stage-specific preparation notes. **Workflow map** opens an Excalidraw-authored diagram of the five stages, human review gate, and edit invalidation paths. The diagram has an accessible text alternative, keyboard-scrollable view, full-size SVG, PNG preview, and an editable source in `public/diagrams/workflow.excalidraw`. No diagram editor runtime is shipped to the client.

The visual reference is [ElevenLabs Customer Stories](https://elevenlabs.io/customer-stories): near-white `#fdfcfc`, black CTAs, pill buttons, a centered light headline, and generous whitespace. The reference uses Waldenburg for headings and Inter for body text; this demo uses openly licensed Inter throughout, without redistributing Waldenburg. The workflow diagram uses the same neutral palette. This is visual inspiration, not an official ElevenLabs interface.

Key files:

- `components/workspace.tsx`: interactive workflow and accessible form controls.
- `lib/workflow.ts`: state transitions and Markdown/JSON package assembly.
- `lib/schema.ts`: shared validation and evidence checks.
- `lib/samples.ts`: three fictional briefs and prewritten outputs.
- `lib/live.ts`: prompt and server-side model request.
- `app/api/generate/route.ts`: configuration status and generation endpoint.
- `tests/`: workflow and mocked-provider regression tests.

## Creator's contribution and AI assistance

The creator's brief defines the sales workflow, MENA account scenarios, qualification criteria, evidence-versus-hypothesis distinction, prompt boundaries, human-review gates, and integration scope. The project reflects experience in MENA growth, partnerships, English-language communication, and AI-assisted business automation.

Implementation, sample copy, prompt development, styling, tests, and documentation were produced with Codex assistance from that brief. The delivered prototype supports discussing the creator's workflow and product decisions; it does not imply that every code line was written manually. No build-duration claim is made.

## Verification and limitations

See `VERIFICATION.md` for the recorded checks, and `DEMO-SCRIPT.md` for a 90-second walkthrough.

This is a local prototype with no authentication, rate-limiting infrastructure, database, CRM integration, scraping, lead database, telephony, or email delivery. Do not treat the approval timestamp as an authenticated audit trail. Source statements are user-provided, not independently verified. Verbatim quote checking and prompting cannot guarantee the correctness of every inference or eliminate prompt injection; human review remains required. Use English inputs for an entirely English demonstration; verbatim evidence preserves source language.

A real live model request was not exercised because no API credentials were supplied. The custom-input request path and failure cases were verified with mocked provider responses. Actual model availability, account access, and output quality require a configured account. The app is not intended for public hosting without access controls and abuse protection.

## Sensible next steps

- Conduct a small workflow review with an SDR and AE; refine the handoff around their needs.
- Evaluate live outputs against a labeled set of permitted English account notes, including prompt-injection attempts.
- Validate one use-case hypothesis with permissioned scripts and editorial reviewers, using agreed quality criteria.
- If moving beyond a local demo, add authenticated access, request limits, a retention policy, and explicit approval/version history before considering CRM export.
