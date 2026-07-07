// ---------------------------------------------------------------------------
// The public AI-fluency rubric contract.
//
// This file + rubric.json are the single source of truth for the rubric DATA
// (dimensions, behavioral anchors, tier semantics, and the published sources
// each dimension is grounded in). It is self-contained on purpose — no `@/`
// imports — so the whole `data/rubric/` folder lifts into a public OSS repo
// unchanged.
//
// What is deliberately NOT here: the per-prompt criteria (C1–C11) and the
// scoring weights / verdict heuristic. Those are the calibration and stay
// private.
// ---------------------------------------------------------------------------

/** The five rubric tiers the backend emits. Two are NOT "did poorly":
 *  `insufficient_evidence` (the phase didn't happen) and `not_collectible`
 *  (the agent structurally can't emit this dimension's telemetry). */
export type RubricTier =
  | "strong"
  | "adequate"
  | "developing"
  | "insufficient_evidence"
  | "not_collectible";

/** Layout intent — gaps auto-expand; the two neutral tiers never read as red. */
export type TierIntent = "good" | "gap" | "neutral";

/** The three graded phases of a session. */
export type PhaseType = "discovery" | "implementation" | "verification";

/** The product surfaces a dimension is judged on. Hiring grades a candidate in
 *  a bounded assessment on an unfamiliar codebase; teams grades an engineer
 *  doing real work in a familiar codebase under the source-exclusion capture
 *  boundary (prompts, command strings, paths, and telemetry — never diffs,
 *  file contents, or assistant text). */
export type RubricSurface = "hiring" | "teams";

/** Phase a dimension belongs to (graded phases + the cross-cutting bucket). */
export type FluencyDimensionPhase = PhaseType | "cross_cutting";

/** The eight scored dimensions. */
export type FluencyDimensionKey =
  | "task_framing"
  | "comprehension_grounding"
  | "direction_quality"
  | "steering_discernment"
  | "verification_loop"
  | "fix_integrity"
  | "context_management"
  | "ecosystem_leverage";

/** A published source a dimension is grounded in (the "why" behind a row). */
export interface RubricSource {
  name: string;
  detail: string;
  url: string;
}

/** A named group of sources for the global methodology disclosure. */
export interface MethodologyGroup {
  label: string;
  sources: RubricSource[];
}

/** A phase header (section) in the scorecard. */
export interface RubricPhase {
  key: FluencyDimensionPhase;
  label: string;
  blurb: string;
}

/** Display + ordering semantics for one tier. */
export interface RubricTierMeta {
  key: RubricTier;
  label: string;
  shortLabel: string;
  intent: TierIntent;
  hex: string;
  text: string;
  badge: { color: string; background: string; border: string };
  rank: number;
  help: string;
  /** True when the tier reflects a capture limitation, not the engineer. */
  structural: boolean;
}

/** Behavioral anchors for the three graded levels of a dimension. */
export interface RubricAnchorSet {
  developing: string;
  adequate: string;
  strong: string;
}

/** One rubric dimension (a row): what it measures, why it matters, the
 *  level anchors, and the sources backing it. */
export interface RubricDimension {
  key: FluencyDimensionKey;
  label: string;
  phase: FluencyDimensionPhase;
  /** Product surfaces this dimension is judged on. A dimension whose construct
   *  only exists on one surface (e.g. comprehension_grounding presumes an
   *  UNFAMILIAR codebase) lists only that surface — on the other surface it is
   *  omitted from judging entirely, which is different from `not_collectible`
   *  (that's a TOOL limit within a surface). */
  surfaces: RubricSurface[];
  /** One-line "what this measures" (matrix row subtitle). */
  measures: string;
  /** Deeper explanation — what the dimension captures and why it matters. */
  detail: string;
  anchors: RubricAnchorSet;
  sources: RubricSource[];
}

/** The whole rubric artifact (the shape of rubric.json). */
export interface RubricArtifact {
  schemaVersion: number;
  phases: RubricPhase[];
  tiers: RubricTierMeta[];
  dimensions: RubricDimension[];
  methodologySummary: string;
  methodologyGroups: MethodologyGroup[];
}

/** The role-based rubric templates shipped in templates.json. */
export type RubricTemplateKey = "engineer" | "product_manager";

/** One dimension's preset within a template: whether it's judged and how much
 *  it counts. Templates are presets over a surface's judged dimensions —
 *  applying one (e.g. via PUT /v1/rubric/overrides in the teams product) is a
 *  consumer concern, not part of this artifact. */
export interface RubricTemplateDimension {
  key: FluencyDimensionKey;
  enabled: boolean;
  /** Relative emphasis, 0–100. Weights sum to exactly 100 across ALL of a
   *  template's dimensions, disabled ones included — a disabled dimension's
   *  weight is its preserved "would-be" emphasis for when it's re-enabled.
   *  Weights are relative emphasis, not absolute percentages: a consumer
   *  computing scores over the enabled dimensions must renormalize over the
   *  enabled subset's weights. */
  weight: number;
  /** 0-based position, unique within a template. */
  displayOrder: number;
}

/** A role-based preset over a surface's judged dimensions (the shape of one
 *  entry in templates.json). */
export interface RubricTemplate {
  key: RubricTemplateKey;
  label: string;
  description: string;
  /** The product surface whose judged dimension set the template covers. */
  surface: RubricSurface;
  dimensions: RubricTemplateDimension[];
}
