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
is grounded in.

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
| [`src/templates.json`](src/templates.json) | Role-based templates — presets over a surface's judged dimensions (see [Templates](#templates)). |

## The model

A session is read in four phases. Each phase contains one or more **dimensions**
(the scored rows). Each dimension carries a one-line **measures**, behavioral
**anchors** for the three graded levels (Developing → Adequate → Strong), the
**surfaces** it's judged on (`hiring` grades a candidate on an unfamiliar
codebase; `teams` grades real work under source-free capture, which judges 5 of
the 8), and the **sources** it's grounded in — so a tier is never a vibe; it
points at the published standard it came from.

The full rubric, rendered live from [`src/rubric.json`](src/rubric.json), follows.

<!-- RUBRIC:START -->

<!-- Auto-generated from src/rubric.json by scripts/render-readme.mjs — do not edit by hand; run `npm run render`. -->

## The rubric

**4 process dimensions (13 sub-facets) across 2 phases**, plus **3 outcome bands reported separately** (not folded into the score). Each dimension is graded 🟥 Developing → 🟨 Adequate → 🟩 Strong against the behavioral anchors below — the sub-facet is the unit of coaching — and points at the published sources it's grounded in.

### 🧭 Per-task craft

_Framing each task and proving it's done — the work-specific arc._

#### Direction

_Judged on: `hiring` · `teams` · Reliability: Medium_

Whether the engineer set the agent up to succeed — specific asks, the context only they have, and work shaped so each step could be done right.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Vague asks with the context left in the engineer's head; work sprawls or fragments. |
| 🟨 **Adequate** | Clear goal and rough shape, but key intent, constraints, or ordering stay implicit. |
| 🟩 **Strong** | Specific asks carrying the context only they have, shaped so each step can be done right. |

| Sub-facet | What it reads | Strong looks like |
| --- | --- | --- |
| **Specificity** | What each prompt pins down — expected-vs-actual behavior, constraints, acceptance criteria, pasted evidence — versus what's left to the model to guess. | Pins expected behavior, constraints, and the acceptance check in a single ask. |
| **Latent context** | Whether the engineer supplied context the agent can't discover from the repo — intent, scale assumptions, non-goals, what's throwaway versus load-bearing. Inferred from what was stated up front versus assumptions the agent had to make. | States the intent, scale, and non-goals up front so the agent optimizes for the real target. |
| **Structuring** | Whether the work was shaped so each step had the context to be right — plan-then-execute versus one mega-prompt versus blind over-chopping. Plan-mode usage that produced coherent scoped steps is read here. | Plans the whole, then executes in scoped steps — each with the context it needs. |

**Grounded in:** [Anthropic](https://code.claude.com/docs/en/best-practices) · [Mitchell Hashimoto](https://mitchellh.com/writing/non-trivial-vibing)

<details><summary>Why this dimension matters</summary>

Direction is everything the engineer controls before and while the agent works: how precisely each ask is stated, how much of the context only they possess gets handed over, and how the work is shaped so every step has what it needs. The highest-value part is latent context — the intent, scale assumptions, and non-goals the agent cannot discover from the repo ("we'll only ever have one user"). Withholding it doesn't cost turns; it produces confidently-wrong output. Structuring is the counterweight to naive decomposition: over-chop the work and each step is locally fine but globally wrong because no unit saw the whole — plan-then-execute (plan mode where it earns it) is how you decompose without starving context. Judged from prompt content and work shape, not from raw turn count, which conflates prompt quality with task difficulty.

</details>

#### Verification

_Judged on: `hiring` · `teams` · Reliability: High_

Whether the output was actually exercised before it was trusted — runs, tests, and hands-on checks, sized to the risk of the change.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Trusts output without exercising it; a green-looking result is treated as proof. |
| 🟨 **Adequate** | Runs the code, but after the fact or without matching the effort to the risk. |
| 🟩 **Strong** | Exercises the change as it goes, with verification sized to the blast radius. |

| Sub-facet | What it reads | Strong looks like |
| --- | --- | --- |
| **Exercised the output** | Whether something actually ran the generated code — tests, a build, a dev server, a command (including `!`-prefixed runs) — before it was trusted. | Exercises the change as it goes — the output is seen running before it's trusted. |
| **Proportionate testing** | Whether verification is sized to the risk — edge, boundary, and failure-path tests on logic that needs them, without burning the full suite on a trivial change. | Verification matches the blast radius — boundary and failure-path tests where it counts, light touch where it doesn't. |
| **Manual verification** _(positive-only)_ | Text tells that the human checked the running result themselves — 'clicking this does nothing', 'the layout's off'. Adds evidence when present; never penalized when absent (absence floors at insufficient-evidence, not developing). | Concrete manual verification narrated — a specific observed result, 'clicked through, the error's gone'. |

**Grounded in:** [Simon Willison](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) · [DORA 2025](https://dora.dev)

<details><summary>Why this dimension matters</summary>

The flagship dimension, and the most reliably observable: the strong signal is that something actually ran the generated code before the engineer trusted it. Because the agent runs commands through its own tools, every test, build, dev-server, and `!`-prefixed run is in the transcript — the main path is fully captured. The blind spot is out-of-band verification (running tests in a separate terminal, checking in an editor): where there's genuinely no observed signal, this scores insufficient-evidence, never failing — absence of observed verification is not proof it didn't happen. Verification is sized to risk: edge and failure-path tests on logic that needs them, not the full CI suite on a rename. Over-verifying trivial changes is a Context (cost) failure; under-verifying risky ones is the failure here.

</details>

### 🔁 Session-wide habits

_Discipline that runs across the whole session, not one task._

#### Context

_Judged on: `hiring` · `teams` · Reliability: High_

Whether the engineer kept the working context lean and configured — resetting at boundaries, not bloating what's loaded every turn, and keeping token-saving setup turned on.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Bloated, unmanaged context and efficiency features left off — every turn pays the tax. |
| 🟨 **Adequate** | Workable context and partial setup, but with dead weight and incidental resets. |
| 🟩 **Strong** | Lean context, deliberate resets, and a setup configured to save tokens turn over turn. |

| Sub-facet | What it reads | Strong looks like |
| --- | --- | --- |
| **Context hygiene** | Whether context is reset or compacted at task boundaries versus one bloated window carrying ten tasks of stale state. | Compacts at natural boundaries on purpose — reset as a steering tool, not a reflex. |
| **Asset bloat** | Whether the always-loaded setup is lean — CLAUDE.md, skills, memory, and plugins that don't burn context every turn (measured by cc-audit). | Lean, high-signal setup — every always-loaded token earns its place. |
| **Config present & on** | Whether the token-saving setup is even turned on — auto-memory enabled, CLAUDE.md present at both user and project level. | The environment is configured to remember — memory on, project + user CLAUDE.md carrying the standing context. |
| **Model right-sizing** _(beta)_ | Whether model choice tracks task weight — not the heaviest model on trivial edits. Surfaced while we calibrate; does not affect the score yet. | Model tracks task weight — heavy where it earns it, light where it doesn't. |

**Grounded in:** [Peter Steinberger](https://steipete.me/posts/just-talk-to-it) · [Thorsten Ball](https://ampcode.com/notes/how-i-use-amp)

<details><summary>Why this dimension matters</summary>

Context is the controllable process behind cost. Most raw token burn is the model's behavior — it decides which files to re-read, and redundant reads balloon as the window fills — so we don't score the engineer on a number they didn't drive; that's the Cost band, reported separately. What the engineer does control: resetting or compacting at task boundaries instead of running ten tasks in one bloated window; keeping the always-loaded setup lean (an oversized CLAUDE.md, a stack of plugins, or a memory file that taxes every single turn — measured by cc-audit); and whether the token-saving setup is even switched on. Model right-sizing is surfaced here as a beta signal while we calibrate it — it does not yet affect the score.

</details>

#### Leverage

_Judged on: `hiring` · `teams` · Reliability: High_

Whether the engineer operates the AI-coding ecosystem well — the right tool for the job, durable workflows codified, and parallel execution where it moves faster.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Works serially by hand, ignoring the tooling and durable workflows that would help. |
| 🟨 **Adequate** | Uses parts of the ecosystem with mixed payoff; little gets codified for next time. |
| 🟩 **Strong** | Right tool for each job, repeated work codified into durable assets, independent streams run in parallel. |

| Sub-facet | What it reads | Strong looks like |
| --- | --- | --- |
| **Tooling** | Whether the ecosystem is wired up and used where it pays off — skills, hooks, scoped permissions, MCP servers for db/auth — and the right-sized tool for the job (no million-token workflow for a one-liner). | Right tool at the right moment — hooks, permissions, MCP, and skills each close a real loop; no tool theater. |
| **Workflow codification** | Whether repeated knowledge is converted into the right durable artifact — skill vs script vs test vs lint rule vs CLAUDE.md vs CI — with obsolete ones removed. The closed failure→guardrail loop. | Recurring work becomes the right durable mechanism — a repeated mistake becomes a rule, a missed edge case a test — and stale ones are removed. |
| **Velocity** | Whether independent work is run in parallel where it helps — worktrees for isolation, concurrent sessions, work partitioned so streams don't collide. (Cross-session signal needs fleet correlation.) | Independent work runs concurrently in isolated worktrees/sessions, partitioned to land cleanly. |

**Grounded in:** [Anthropic](https://code.claude.com/docs/en/best-practices) · [Armin Ronacher](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)

<details><summary>Why this dimension matters</summary>

Leverage is how well the engineer operates the ecosystem around the agent, across two clusters. Workflow: wiring up and using the right tool for the job — skills, hooks (format-to-standard), scoped permissions, MCP servers for db and auth — and not reaching for a token-hungry dynamic workflow where a one-liner would do. Its top marker is workflow codification: converting repeated knowledge into the right durable artifact (a recurring model mistake becomes a repo instruction, a missed edge case a regression test, a mechanical operation a script, a dangerous behavior a permission guardrail) and removing obsolete ones — the closed feedback loop that's the clearest sign of an advanced operator. Velocity: running independent work in parallel where it helps — worktrees for isolation, concurrent sessions, work partitioned so streams don't collide. Because quality is scored separately in the bands, rewarding parallel speed here can't reward slop. This dimension is heavily tool-specific: engineers are credited for using what's available and never penalized for tools their environment doesn't offer.

</details>

### 📤 Bands — reported, not scored

Outcome measures — what the work *produced* — reported beside the process score and **never folded into it**. Holding outcomes out of the score keeps the process→outcome correlation honest: a lucky clean diff can't inflate the grade, and a churny result can't deflate it. Graded on the same tiers as the dimensions.

#### Craft & reviewability

The quality of what actually landed — a clean, minimal, reviewable diff versus bloated, duplicative code no human vetted.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Bloated, duplicative, or sprawling diffs — churn a reviewer can't reasonably vet. |
| 🟨 **Adequate** | Mostly clean, but carries dead scaffolding or edits wider than the change needed. |
| 🟩 **Strong** | Small, coherent, reviewable diffs — no duplication or unreviewed bloat, senior-authored in shape. |

**Grounded in:** [Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) · [Steve Yegge & Gene Kim](https://itrevolution.com/articles/the-vibe-coding-loop/)

<details><summary>Why this band is reported apart</summary>

Craft is the outcome half of Direction and Verification: given a good process, did the work that landed read as senior-authored? Small, coherent diffs; no dead scaffolding, copy-paste duplication, or unreviewed AI bloat; changes a reviewer can actually reason about. Reported beside the process score, never folded in — a clean diff can come from luck as easily as skill, and grading process on outcome would let a lucky one-shot mask a bad workflow.

</details>

#### Delivery & durability

Whether the shipped work lasted — low downstream churn and rework, versus code rewritten or reverted soon after it landed.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | High post-merge churn — the work is reverted, rewritten, or heavily reworked soon after it lands. |
| 🟨 **Adequate** | Lands and mostly holds, but draws non-trivial follow-up rework. |
| 🟩 **Strong** | Lands and stays stable — low downstream churn, no revert-and-redo. |

**Grounded in:** [GitClear](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality) · [DORA 2025](https://dora.dev)

<details><summary>Why this band is reported apart</summary>

Durability is the longest-horizon outcome: did the change survive contact with the codebase? Measured from downstream churn — code that lands and stays stable is durable; code rewritten, reverted, or heavily reworked soon after is not. A lagging signal, correlated with but never folded into the process score, so a durable-looking result can't retroactively excuse a reckless workflow, nor a churny one condemn a sound one.

</details>

#### Cost

The token and dollar cost of the work relative to its weight — efficient for the task versus burning budget far above what it warranted.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Cost far exceeds the task's weight — heavy burn on work that didn't warrant it. |
| 🟨 **Adequate** | Cost is in a reasonable range but carries avoidable overhead. |
| 🟩 **Strong** | Cost tracks task weight — efficient on light work, spend concentrated where the task earned it. |

**Grounded in:** [Peter Steinberger](https://steipete.me/posts/just-talk-to-it) · [Thorsten Ball](https://ampcode.com/notes/how-i-use-amp)

<details><summary>Why this band is reported apart</summary>

Cost is the raw economic outcome behind Context. Most token burn is the model's behavior, not the engineer's — which is exactly why it's a reported band and not a process score: penalizing an engineer for tokens they didn't drive would punish task difficulty, not skill. Reported as spend relative to task weight, so a heavy-but-genuinely-hard task doesn't read as waste.

</details>

### Tiers

Five tiers, and two of them are explicitly **not** "did poorly":

| Tier | Meaning |
| --- | --- |
| 🟩 **Strong** | Senior-level demonstration on this dimension. |
| 🟨 **Adequate** | Meets the baseline for this dimension. |
| 🟥 **Developing** | Evidence is present but falls short — the highest-leverage place to improve. |
| ⚪ **Not enough signal** | This behavior didn't occur or produced too little signal to grade. Not a weakness. |
| ⚪ **Not capturable** | This agent can't emit the telemetry for this dimension (e.g. no token signal on Cursor). Not a reflection of the engineer. |

### Methodology & sources

Graded against agentic-coding standards published by Anthropic and OpenAI, the documented workflows of practitioners like Boris Cherny (creator of Claude Code), Andrej Karpathy, and Simon Willison, and measurement research from METR, DORA, and GitClear. Four process dimensions score how the engineer works with the agent — a predictor of code quality, kept separate from delivery outcomes so the correlation stays real. Each carries a reliability tier: how confidently the behavior can be judged from session telemetry alone. Every dimension is scored by three independent judge passes aggregated by lower median — a split jury never rounds up, and any dissent caps confidence.

**Frontier-lab guidance** — [Anthropic](https://code.claude.com/docs/en/best-practices) · [OpenAI](https://developers.openai.com/codex/learn/best-practices)

**Practitioner canon** — [Boris Cherny](https://x.com/bcherny/status/2007179832300581177) · [Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) · [Simon Willison](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) · [Mitchell Hashimoto](https://mitchellh.com/writing/non-trivial-vibing) · [Armin Ronacher](https://lucumr.pocoo.org/2025/6/12/agentic-coding/) · [Peter Steinberger](https://steipete.me/posts/just-talk-to-it) · [Steve Yegge & Gene Kim](https://itrevolution.com/articles/the-vibe-coding-loop/) · [Thorsten Ball](https://ampcode.com/notes/how-i-use-amp)

**Measurement research** — [METR (2025 RCT)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) · [DORA 2025](https://dora.dev) · [GitClear](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality) · [Grounded Copilot (OOPSLA)](https://arxiv.org/abs/2206.15000)

<!-- RUBRIC:END -->

## Templates

[`src/templates.json`](src/templates.json) ships role-based **templates** —
presets over a surface's judged dimensions that say which dimensions count and
how much (`engineer`, today's balanced default, and `product_manager`, which
emphasizes directing and steering). Each template entry carries `enabled`, an
integer `weight` (0–100), and a `displayOrder`. Weights sum to exactly 100
across **all** of a template's dimensions, disabled ones included — a disabled
dimension's weight is its preserved "would-be" emphasis for when it's
re-enabled. Weights are relative emphasis, not absolute percentages: consumers
computing scores over the enabled dimensions must renormalize over the enabled
subset's weights. Import-time validation guarantees every template's dimension
set exactly matches its surface's judged dimensions (so the two files can't
drift) and enforces the 100-sum invariant. Applying a template is a consumer
concern — this package only ships the data.

Template weights are **org-facing display presets** — the relative emphasis a
team starts from — not the private scoring calibration. The boundary above
holds: the rubric (and these presets) is open, the calibration is not.

```ts
import { templatesForSurface } from "@promptster/rubric";

templatesForSurface("teams"); // [engineer, product_manager]
```

## Using it

It's plain data — the simplest use is to read [`src/rubric.json`](src/rubric.json).
If you're in a TypeScript project, install the package and the typed contract and a
couple of helpers ship alongside it:

```bash
npm i @promptster/rubric
```

```ts
import { rubric, dimensionsForSurface } from "@promptster/rubric";

rubric.dimensions;               // all eight, with anchors + sources
rubric.tiers;                    // tier semantics (labels, intent, ordering)
dimensionsForSurface("hiring");  // the 8 judged in a hiring assessment
dimensionsForSurface("teams");   // the 5 judged under source-free team capture
```

The package ships TypeScript source (no build step) — transpile it with your
bundler (e.g. Next.js `transpilePackages`) or read the JSON directly.

## Contributing

We built this to be argued with. If you think a dimension is miscast, an anchor
is wrong, or a source is weak — **open an issue or a PR.** The rubric gets better
the more practitioners pressure-test it.

A rubric change is an edit to [`src/rubric.json`](src/rubric.json). Before you
open a PR:

```bash
npm run render      # regenerate the rubric section of this README from rubric.json
npm run typecheck   # runs the import-time validator in src/index.ts
```

`src/index.ts` validates the artifact at import: complete key sets, known
surfaces, and the per-surface dimension counts. If your edit drops a dimension,
mistypes a tier, or breaks the shape, `typecheck` fails loud. The README's rubric
section is **generated** from `rubric.json` (`npm run render`) — CI runs
`render --check` and `typecheck` on every PR, so a change that forgets to
regenerate the README, or breaks the artifact, can't merge.

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
