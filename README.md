<h1 align="center">The Promptster AI-fluency rubric</h1>

<p align="center">
  <b>The open standard for evaluating how an engineer drives AI coding tools</b><br/>
  Not <i>whether</i> the code works — <i>how the work was done</i>: how it was framed, grounded, directed, steered, and verified.
</p>

<p align="center">
  <img alt="license: MIT" src="https://img.shields.io/badge/license-MIT-ffcb6b?labelColor=1a1f29">
  <img alt="dimensions: 8" src="https://img.shields.io/badge/dimensions-8-4c8bf5?labelColor=1a1f29">
  <img alt="schema: v2" src="https://img.shields.io/badge/schema-v2-27c93f?labelColor=1a1f29">
  <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-10b981?labelColor=1a1f29">
</p>

This repository is the **canonical source of truth** for the rubric
[Promptster](https://promptster.ai) grades against — the eight dimensions, their
behavioral anchors, the tier semantics, and the published research each dimension
is grounded in. The product renders this data; it never hard-codes any of it.
**Edits land here first** and flow downstream into the product automatically.

> The rubric — **what good looks like** — is open, and we think a standard you're
> graded against should be inspectable and improvable *in public*. The per-prompt
> criteria and the scoring weights (how tiers combine into a result) are **not**
> here: the rubric is open, the calibration is not.

## Contents

| File | What it is |
| --- | --- |
| [`src/rubric.json`](src/rubric.json) | The data: phases, tiers, the eight dimensions (each with behavioral anchors + the published sources it's grounded in), and the methodology disclosure. |
| [`src/types.ts`](src/types.ts) | The TypeScript contract for `rubric.json`. Self-contained — no external imports. |
| [`src/index.ts`](src/index.ts) | Loads and validates the data at import time — a malformed edit fails loud, not silently. |
| [`src/rubric.schema.json`](src/rubric.schema.json) | JSON Schema for `rubric.json`. Validate before committing edits. |

## The model

A session is read in four phases. Each phase contains one or more **dimensions**
(the scored rows):

| Phase | Dimensions |
| --- | --- |
| **Discovery** | Task framing · Comprehension grounding |
| **Implementation** | Direction quality · Steering discernment |
| **Verification** | Verification loop · Fix integrity |
| **Cross-cutting** | Context management · Ecosystem leverage |

Each dimension carries a one-line **measures**, a deeper **detail**, behavioral
**anchors** for the three graded levels (Developing → Adequate → Strong), the
**surfaces** it's judged on (`hiring` grades a candidate on an unfamiliar
codebase; `teams` grades real work under source-free capture, which judges 5 of
the 8), and the **sources** it's grounded in — so a tier is never a vibe; it
points at the published standard it came from.

## Tiers

Five tiers, and two of them are explicitly **not** "did poorly":

| Tier | Meaning |
| --- | --- |
| `strong` | Senior-level demonstration on this dimension. |
| `adequate` | Meets the baseline. |
| `developing` | The one "needs work" tier — the highest-leverage place to improve. |
| `insufficient_evidence` | Neutral. The phase didn't happen or produced too little signal. Not a weakness. |
| `not_collectible` | Structural. The agent can't emit this dimension's telemetry (e.g. no token signal on Cursor). Never a reflection of the engineer. |

## Grounding

The rubric is grounded in three bodies of work, captured in `methodologyGroups`:
frontier-lab guidance (Anthropic, OpenAI), the documented workflows of recognized
practitioners, and peer-reviewed measurement research (METR, DORA, GitClear, and
others). Every dimension lists the one or two sources that most directly back it.

## Using it

It's plain data — the simplest use is to read [`src/rubric.json`](src/rubric.json).
If you're in a TypeScript project, the typed contract and a couple of helpers ship
alongside it (vendor the `src/` folder, or install from the workspace):

```ts
import { rubric, dimensionsForSurface } from "@promptster-ai/rubric";

rubric.dimensions;               // all eight, with anchors + sources
rubric.tiers;                    // tier semantics (labels, intent, ordering)
dimensionsForSurface("hiring");  // the 8 judged in a hiring assessment
dimensionsForSurface("teams");   // the 5 judged under source-free team capture
```

The package ships TypeScript source (no build step). A public npm publish is on
the roadmap; until then, read the JSON directly or vendor the folder.

## Contributing

We built this to be argued with. If you think a dimension is miscast, an anchor
is wrong, or a source is weak — **open an issue or a PR.** The rubric gets better
the more practitioners pressure-test it.

A rubric change is an edit to [`src/rubric.json`](src/rubric.json). Before you
open a PR:

```bash
npm run typecheck   # runs the import-time validator in src/index.ts
```

`src/index.ts` validates the artifact at import: complete key sets, known
surfaces, and the per-surface dimension counts. If your edit drops a dimension,
mistypes a tier, or breaks the shape, `typecheck` fails loud — so a green check
means the artifact still loads cleanly. CI runs the same check on every PR.

**What makes a strong rubric PR:**

- **Anchor or dimension changes grounded in a cited, public source** — frontier-lab
  guidance, a recognized practitioner's documented workflow, or peer-reviewed
  measurement research. Look at the `sources` already in `rubric.json` for the bar.
- Edits that keep [`src/rubric.schema.json`](src/rubric.schema.json) valid —
  validate `rubric.json` against it before committing.
- A clear **why** in the description: what does the current anchor miss, and what
  does yours capture?

When a change merges here, it syncs automatically into Promptster's product repo
(as a PR), so an accepted rubric change reaches the live grader without anyone
hand-copying it.

**Out of scope for this repo:** the per-prompt criteria and the scoring weights.
Those are the calibration and stay private — the rubric defines *what good looks
like*; the calibration decides *how a session scores against it*.

## Built by Promptster

This rubric is the open, inspectable core of what [**Promptster**](https://promptster.ai)
does for engineering organizations: measure how fluently a team actually wields
AI coding tools — how work gets framed, grounded, directed, steered, and verified
— and turn that into a level-up plan. The standard is open; come argue with it.

**[See Promptster →](https://promptster.ai)**

## License

[MIT](./LICENSE) © 2026 Promptster. The rubric text is open on purpose. If you
build on it, we'd love to hear about it.
