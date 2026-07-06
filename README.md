# The Promptster AI-fluency rubric

**The open standard [Promptster](https://promptster.ai) uses to evaluate how an
engineer drives AI coding tools** — not *whether* the code works, but *how the
work was done*: how it was framed, grounded, directed, steered, and verified.

This repository is the single public source of truth for the rubric **data** —
the eight dimensions, their behavioral anchors, the tier semantics, and the
published research each dimension is grounded in. The product renders this data;
it never hard-codes any of it.

> The rubric — **what good looks like** — is open, and we think a standard you're
> graded against should be inspectable. The per-prompt criteria and the scoring
> weights (how tiers combine into a result) are **not** here: the rubric is open,
> the calibration is not.

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
alongside it:

```ts
import { rubric, dimensionsForSurface } from "@promptster-ai/rubric";

rubric.dimensions;               // all eight, with anchors + sources
rubric.tiers;                    // tier semantics (labels, intent, ordering)
dimensionsForSurface("hiring");  // the 8 judged in a hiring assessment
dimensionsForSurface("teams");   // the 5 judged under source-free team capture
```

The package ships TypeScript source (no build step); consume it through your
bundler's transpile path, or just import the JSON.

## License

[MIT](LICENSE) © 2026 Promptster. The rubric text is open on purpose. If you
build on it, we'd love to hear about it — open an issue.
