# Voice AI showcase

The opening screen at `/` and `/showcase#demo` presents an interactive, reflective voice sculpture. The scenario collection follows at `/showcase#demo-experience`, and the selected account's preparation workspace opens at `/workflow`.

## Three connected shapes

- **Learning:** layered silver rings gather into a voice core, with a wave moving across its surface. The caption reads “Explore multilingual listening experiences.”
- **Localization:** the same ribbons unfold into three offset wave bands.
- **Customer care:** the ribbons regroup into two facing arcs with alternating movement and a brief connection.

Three.js renders real geometry with physical metal materials, a generated studio environment, moving highlights, and restrained surface glints. Morphs take approximately 1.45 seconds and continue from the currently displayed pose when interrupted. Pointer movement adds damped tilt and separation. Animation updates run outside React state.

Mobile uses fewer ribbons and a lower rendering resolution. Rendering pauses when the sculpture leaves the viewport or the document is hidden. Reduced-motion mode uses static poses and a short fade. A matching SVG fallback remains available if the rendering library or WebGL cannot initialize, or the graphics context is lost.

Scene selectors support arrow keys, Home, and End. Labels and scene captions remain HTML. “Explore the demo” carries the selected scenario to the script experience; “See the workflow” carries it to the preparation workspace. Both routes accept account IDs (`lisan`, `sahab`, `bayt`) or scene IDs (`learning`, `localization`, `care`). Unknown values fall back safely.

## Scenario collection

Each fictional account includes three authored script moments, account context, a suggested buyer, source notes, a fit decision, discovery questions, and a pilot hypothesis. Script previews use an available English browser/device speech voice. They are not ElevenLabs audio or a live agent. No microphone permission is requested. Missing voices or playback failure leave the full readable script available.

Scene and script changes stop playback. The workspace opens with the selected account without automatically generating or approving anything. Evidence validation, review gates, edit invalidation, and Markdown/JSON export remain part of the workspace.

## Project boundaries

This is an independent portfolio project. The accounts and concept scripts are fictional. There are no claimed customers, commercial results, or production usage. The public static demonstration supports sample outputs. A server deployment can optionally enable the separate live AI integration.

The interface uses self-hosted Inter, near-white backgrounds, black controls, and silver geometry. The three-dimensional material direction draws on reflective product-launch visuals, including the liquid highlight treatment of Bland's website, while the page retains its own neutral voice-sculpture composition.
