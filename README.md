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

**8 dimensions across 4 phases.** Each dimension is graded 🟥 Developing → 🟨 Adequate → 🟩 Strong against the behavioral anchors below, and points at the published sources it's grounded in.

### 🧭 Discovery

_Orienting and framing the work before touching code._

#### Task framing

_Judged on: `hiring`_

How the work was decomposed and ordered before any code landed — goal, scope, and non-goals stated up front.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Jumps to edits with no plan; scope and non-goals are implicit. |
| 🟨 **Adequate** | States the goal and rough scope, but ordering or constraints stay loose. |
| 🟩 **Strong** | Decomposes into orient → plan → implement → verify, with non-goals fenced before code. |

**Grounded in:** [Anthropic](https://code.claude.com/docs/en/best-practices) · [Mitchell Hashimoto](https://mitchellh.com/writing/non-trivial-vibing)

<details><summary>Why this dimension matters</summary>

Before any code lands, did the engineer turn an ambiguous brief into a plan the agent can execute against? We look for an explicit goal, a scoped set of files, stated non-goals, and a clear ordering — orient → plan → implement → verify. Interrogating the brief itself is a strong marker: spotting an ambiguity or a wrong assumption in the task as given and surfacing it before work starts is senior framing, not friction. Decomposing the work into independent, parallel-safe workstreams is credited here as framing — the human act of actually running them concurrently is ecosystem leverage. This is the single biggest predictor of whether the rest of the session stays on-rails: good framing gives the agent guardrails and gives every later prompt something to anchor to. Weak framing surfaces downstream as thrash, scope creep, and rework.

</details>

#### Comprehension grounding

_Judged on: `hiring`_

Whether discovery produced a correct understanding — root-cause hypothesis confirmed against the real code, not assumed.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Acts on a guess; never confirms the mechanism in the actual codebase. |
| 🟨 **Adequate** | Reads the relevant code but stops short of confirming the root cause. |
| 🟩 **Strong** | Forms a hypothesis and grounds it in the real code before mutating anything. |

**Grounded in:** [Boris Cherny](https://x.com/bcherny/status/2007179832300581177) · [Simon Willison](https://simonwillison.net/2025/Mar/11/using-llms-for-code/)

<details><summary>Why this dimension matters</summary>

Did discovery actually produce a correct mental model, or did the engineer act on a guess? We score whether a root-cause hypothesis was formed and then confirmed against the real code — reading the relevant files, the contract, the call sites — before mutating anything. Grounded comprehension is what separates a fix that holds from one that papers over a symptom. Most expensive AI-assisted mistakes trace back to confidently editing code nobody actually read.

</details>

### ⚙️ Implementation

_Directing the agent and steering its output._

#### Direction quality

_Judged on: `hiring` · `teams`_

The behavioral specificity of the prompts — expected-vs-actual, pasted evidence, constraints, acceptance criteria, pattern pointers.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Vague asks ('fix it'); no target, no constraints, no acceptance bar. |
| 🟨 **Adequate** | Names the goal and some constraints, but leaves room for drift. |
| 🟩 **Strong** | Pins expected behavior, constraints, and the acceptance check in one pass. |

**Grounded in:** [Anthropic](https://code.claude.com/docs/en/best-practices) · [Thorsten Ball](https://ampcode.com/notes/how-i-use-amp)

<details><summary>Why this dimension matters</summary>

The behavioral specificity of the prompts that steer implementation. Strong direction pins expected-vs-actual behavior, pastes the real error or evidence, names constraints and acceptance criteria, and points at the pattern to follow. This is where AI fluency is most visible: a precise prompt collapses three round-trips into one, while a vague “fix it” hands the agent the wheel and hopes. We read every implementation prompt for how much of the target was specified versus left to the model to guess.

</details>

#### Steering discernment

_Judged on: `hiring` · `teams`_

How the AI's output was evaluated and corrected — test-then-steer, adding new information on each correction, and holding the output to a merge bar before it ships.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Bare retries the same ask; accepts output without inspecting it. |
| 🟨 **Adequate** | Course-corrects, but corrections add little new information. |
| 🟩 **Strong** | Reads the output, catches the wrong turn, and steers with new evidence each time. |

**Grounded in:** [Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) · [Mitchell Hashimoto](https://mitchellh.com/writing/non-trivial-vibing)

<details><summary>Why this dimension matters</summary>

Once the agent produces output, does the engineer actually evaluate it — and when it's wrong, correct with new information rather than bare-retrying? We look for the engineer reading the diff, catching a wrong turn, and steering with fresh evidence — a failing case, a contract detail, a counter-example — on each correction. Steering doesn't end when the code works: merge-bar stewardship is part of this dimension — demanding cleanup and convention adherence, deleting agent-added bloat, and asking for a closing review pass before the work ships. (Breaking a failed correction chain by resetting context is credited under context management, not here.) On the teams surface, where capture is source-free, steering is read from the prompt stream alone — corrections that carry new information versus bare re-asks, cleanup and review-pass asks as the stewardship evidence — with a coaching framing. Discernment is the skill that keeps the human in the loop as a reviewer, not a rubber stamp. Its absence is the clearest tell of someone who'll ship whatever the model hands them.

</details>

### ✅ Verification

_Proving the work is done — evidence over assertion._

#### Verification loop

_Judged on: `hiring` · `teams`_

Whether a runnable oracle was established and used — red→green ordering, demanding evidence over assertion.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Ships without running anything, or treats a green bar as proof. |
| 🟨 **Adequate** | Runs tests, but the oracle is thin or set up after the fact. |
| 🟩 **Strong** | Establishes a runnable check first and drives a real fail→pass cycle. |

**Grounded in:** [Simon Willison](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) · [DORA 2025](https://dora.dev)

<details><summary>Why this dimension matters</summary>

Was there a runnable oracle, and was it used the right way around? We score whether the engineer established a check — a failing test, an acceptance criterion, a reproduction — before the fix, then drove a real red → green cycle, demanding evidence over assertion. “It looks done” and a green bar that was already green both score low. Verification discipline is what makes AI-generated code trustworthy at speed; without it, velocity just ships bugs faster.

</details>

#### Fix integrity

_Judged on: `hiring`_

Whether the fix addresses the root cause with a minimal, honest diff — not symptom suppression, skipped tests, or churn.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Suppresses the symptom (special-cases, skips, hardcodes) to force green. |
| 🟨 **Adequate** | Fixes the cause but leaves an over-wide diff full of churn behind. |
| 🟩 **Strong** | Root-cause fix in a narrow, honest diff — nothing special-cased, no test weakened. |

**Grounded in:** [GitClear](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality) · [Steve Yegge & Gene Kim](https://itrevolution.com/articles/the-vibe-coding-loop/)

<details><summary>Why this dimension matters</summary>

Does the change address the root cause with an honest, minimal diff — or suppress the symptom to force a green bar? We watch for special-casing, skipped or weakened tests, hardcoded returns, swallowed exceptions, and over-wide diffs full of churn. Deleting agent-added bloat — over-defensive guards, speculative abstraction, off-task edits — is credited under steering discernment's stewardship, not here; but we never read that deletion as symptom suppression or churn, because agents systematically over-defend and experts strip it. With an agent that will happily make any test pass, fix integrity is the difference between resolving a problem and hiding it — and it's the dimension most likely to diverge from a passing CI run.

</details>

### 🔁 Cross-cutting

_Habits that run the whole session._

#### Context management

_Judged on: `hiring` · `teams`_

How the working context was managed — boundary-aligned resets, handoffs, and reset discipline on failed correction chains, not hoarding stale context or panic-clearing.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | Never resets and drowns in stale context, or reflexively /clears and re-pastes. |
| 🟨 **Adequate** | Keeps context workable but without deliberate boundary resets. |
| 🟩 **Strong** | Compacts at phase boundaries on purpose — reset as a steering tool, not a reflex. |

**Grounded in:** [Peter Steinberger](https://steipete.me/posts/just-talk-to-it) · [Thorsten Ball](https://ampcode.com/notes/how-i-use-amp)

<details><summary>Why this dimension matters</summary>

How the engineer managed the agent's working context across the session — compacting or resetting at natural boundaries, versus either hoarding stale context until quality degrades or reflexively /clearing and re-pasting. Deliberate, boundary-aligned resets are a steering tool: they keep the model focused on the current phase. Reset discipline is credited here too — the two-strike rule: corrected twice on the same issue, reset the context and re-prompt better, rather than grinding an eight-turn correction chain into a rotted window. We distinguish an intentional reset (“we've finished the fix, compact before review”) from a panic clear, and from never resetting at all.

</details>

#### Ecosystem leverage

_Judged on: `hiring` · `teams`_

Whether subagents, MCP tools, skills, and parallel orchestration were used where they visibly paid off — leverage, not tool theater.

| Level | Anchor |
| --- | --- |
| 🟥 **Developing** | No leverage where it would have helped, or tools used for show. |
| 🟨 **Adequate** | Uses the ecosystem occasionally, with mixed payoff. |
| 🟩 **Strong** | Subagents, MCP, and skills each close a concrete loop that mattered. |

**Grounded in:** [Anthropic](https://code.claude.com/docs/en/best-practices) · [Armin Ronacher](https://lucumr.pocoo.org/2025/6/12/agentic-coding/)

<details><summary>Why this dimension matters</summary>

Did the engineer reach for subagents, MCP tools, and skills where they visibly paid off — or either ignore leverage that would have helped, or invoke tools for show? We score for concrete payoff: a research subagent that kept the main thread clean, an MCP call that grounded a fact instead of guessing, a skill that caught something pre-PR. Parallel execution is credited here too: independent workstreams the engineer launched and steered concurrently, partitioned so they never collide — the decomposition that made them independent is task framing; running them is leverage. The bar is leverage that closed a real loop. Tool theater (invoking something that changed nothing) and missed leverage both score below a focused operator who used exactly the right tool at the right moment.

</details>

### Tiers

Five tiers, and two of them are explicitly **not** "did poorly":

| Tier | Meaning |
| --- | --- |
| 🟩 **Strong** | Senior-level demonstration on this dimension. |
| 🟨 **Adequate** | Meets the baseline for this dimension. |
| 🟥 **Developing** | Evidence is present but falls short — the highest-leverage place to improve. |
| ⚪ **Not enough signal** | This phase didn't occur or produced too little signal to grade. Not a weakness. |
| ⚪ **Not capturable** | This agent can't emit the telemetry for this dimension (e.g. no token signal on Cursor). Not a reflection of the engineer. |

### Methodology & sources

Graded against agentic-coding standards published by Anthropic and OpenAI, the documented workflows of practitioners like Boris Cherny (creator of Claude Code), Andrej Karpathy, and Simon Willison, and measurement research from METR, DORA, and GitClear. Each dimension is scored by three independent judge passes aggregated by lower median — a split jury never rounds a candidate up, and any dissent caps confidence.

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
