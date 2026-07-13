# Contributing to the Promptster rubric

This repo is the canonical, community-editable data artifact for **what makes a
good AI-tools user**. The bar for contributing is deliberately low: in almost
every case you edit **one file — `src/rubric.json`** — and nothing else.

## The rubric lives in `src/rubric.json`

It holds the process **dimensions**. Each dimension has:

- `key` — a unique `lower_snake_case` id. The set is **open** — add your own.
- `label`, `phase`, `surfaces`, `measures`, `detail`
- `reliabilityTier` — `high | medium | low`: how confidently the behavior can be
  judged from session telemetry alone
- `anchors` — the dimension-level roll-up (`developing` / `adequate` / `strong`)
- `subFacets[]` — the independently-coached behaviors that compose the
  dimension. Each has its own `key`, `label`, `reliabilityTier`, `signal` (what
  we read from the session trace), and `anchors`. Optional:
  `beta: true` (surfaced but not yet scored) and `scoring: "positive_only"`
  (only adds evidence when present; absence is never a penalty).
- `sources` — the published guidance the dimension is grounded in

The easiest start is to **copy an existing dimension and adapt it**.

## To add or change a dimension

1. Edit `src/rubric.json`.
2. `npm run validate` — runs the structural checks (unique keys, valid tiers,
   well-formed sub-facets). Fails loud on a malformed edit.
3. `npm run render` — regenerates the rubric section of `README.md`.
4. Open a PR. CI re-runs `validate` and `render:check`.

You should **not** need to touch `types.ts`, `index.ts`, or
`rubric.schema.json` to add a dimension — the dimension set is open and
validated structurally, not against a hardcoded list. (The five scoring
**tiers** and the two product **surfaces** are fixed scaffolding and do stay
strict.)

## What is intentionally NOT here

Per-prompt scoring criteria and the scoring weights / verdict heuristic are the
private calibration and are not part of this package. This repo ships the
anchors and citations only.
