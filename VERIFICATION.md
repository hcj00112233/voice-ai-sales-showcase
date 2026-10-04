# Verification record

Checked locally on 4 October 2026. Tests use fictional data and mocked API responses, with no live API credentials.

## Automated checks

- Production build and TypeScript checks.
- 22 Node tests covering all three sample packages, evidence quote provenance, email length, three discovery questions, input and URL validation, unknowns, approval gates, source-change invalidation, draft-change invalidation, source revision race protection, reset, output mode changes, and both export formats.
- Server tests cover custom inputs, sparse inputs, structured-response requests, unavailable credentials, incomplete/refused/malformed output, unsupported quotes, rate limits, provider failures, timeouts, oversized inputs, cross-origin rejection, and the loopback-host normalization regression.
- Client bundle checked for a test-only server credential marker; no marker included.

## Browser checks

- Completed all five stages for Lisan Learning, Sahab Localization, and Bayt Basket.
- Confirmed Bayt Basket recommends Research further and keeps voice demand unproven.
- Edited the outreach subject and confirmed Copy draft used the current subject.
- Confirmed approval was disabled until the review checks were complete.
- Approved a package, edited its email, and verified approval was removed.
- Changed a source input and verified the outdated notice and disabled export.
- Downloaded unreviewed JSON and reviewed Markdown/JSON, then read the downloaded files to confirm the label, Discovery pending status, and current edited subject.
- Tested reset, sample-only restrictions for custom accounts, and a real local API failure without credentials; the entered company name remained in the form.
- Inspected desktop layout, completed a workflow at 390 px, and checked a 320 px viewport with no horizontal overflow.
- Exercised keyboard activation and native dialog focus behavior.

## UI refinement and brand alignment checks

- Re-ran all 22 tests, TypeScript, and production build after the workspace redesign.
- Inspected the refined desktop layout at 1280 px and mobile layout at 390 px; checked 320 px form, use-case, outreach, and review views for horizontal overflow.
- Exercised sample selection and all five stages with the updated controls and sticky action bar.
- Rendered the editable Excalidraw diagram to SVG and PNG, inspected arrow routing and text, and verified its in-app dialog at mobile size.
- Compared the public ElevenLabs Customer Stories page and official brand resource page; recorded the observed near-white background, black controls, heading treatment, and Inter body type.
- Rebuilt after the monochrome alignment and walked through all five stages again.
- Verified keyboard open/close controls. The map includes a scrollable image region, full-size view, editable source link, and a text alternative.

## Limitations

A paid/live provider request was not made. Successful custom-account generation was tested with a mocked provider; this checks integration behavior, not real-model quality. Browser testing used the local Chromium-based in-app browser, not a full cross-browser or screen-reader certification. Semantic truthfulness and resistance to adversarial input still need human review and a dedicated evaluation set before any production use.
