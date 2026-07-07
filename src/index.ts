import rubricRaw from "./rubric.json";
import templatesRaw from "./templates.json";
import type {
  FluencyDimensionKey,
  RubricArtifact,
  RubricDimension,
  RubricSurface,
  RubricTemplate,
  RubricTemplateKey,
  RubricTier,
} from "./types";

// The complete key sets the runtime loaders assume. tier.ts / rubric-anchors.ts
// / methodology.ts each cast `Object.fromEntries(rubric.tiers|dimensions …)` to
// a *complete* Record. If rubric.json ever drops (or duplicates) a key, that
// cast lies: callers read `undefined` and emit NaN ordering, blank level text,
// or missing citations. rubric.schema.json documents the shape but isn't
// executed anywhere, so this is the guard that actually runs — at import, in
// dev, build, and tests.
const EXPECTED_TIER_KEYS: readonly RubricTier[] = [
  "strong",
  "adequate",
  "developing",
  "insufficient_evidence",
  "not_collectible",
];

const EXPECTED_DIMENSION_KEYS: readonly FluencyDimensionKey[] = [
  "task_framing",
  "comprehension_grounding",
  "direction_quality",
  "steering_discernment",
  "verification_loop",
  "fix_integrity",
  "context_management",
  "ecosystem_leverage",
];

function assertCompleteKeySet(
  collection: string,
  actual: readonly string[],
  expected: readonly string[],
  file = "rubric.json",
): void {
  const seen = new Set(actual);
  if (seen.size !== actual.length) {
    const dupes = actual.filter((k, i) => actual.indexOf(k) !== i);
    throw new Error(
      `${file}: duplicate ${collection} key(s): ${[...new Set(dupes)].join(", ")}`,
    );
  }
  const missing = expected.filter((k) => !seen.has(k));
  const extra = actual.filter((k) => !expected.includes(k));
  if (missing.length || extra.length) {
    throw new Error(
      `${file}: ${collection} key set is incomplete` +
        (missing.length ? ` — missing: ${missing.join(", ")}` : "") +
        (extra.length ? ` — unexpected: ${extra.join(", ")}` : ""),
    );
  }
}

// Every surface value rubric.json may use. dimensionsForSurface() filters on
// these, so an unknown value would silently drop a dimension from every
// surface — the validator below turns that into a loud import-time failure.
// Record<RubricSurface, true> is exhaustive: TypeScript errors here if
// RubricSurface gains a member without a matching entry, so KNOWN_SURFACES
// can't silently fall out of sync with the union.
const SURFACE_EXHAUSTIVENESS: Record<RubricSurface, true> = {
  hiring: true,
  teams: true,
};
const KNOWN_SURFACES = Object.keys(SURFACE_EXHAUSTIVENESS) as readonly RubricSurface[];

function assertValidSurfaces(dimensions: readonly RubricDimension[]): void {
  for (const d of dimensions) {
    if (!Array.isArray(d.surfaces) || d.surfaces.length === 0) {
      throw new Error(
        `rubric.json: dimension "${d.key}" must declare a non-empty surfaces array`,
      );
    }
    const unknown = d.surfaces.filter((s) => !KNOWN_SURFACES.includes(s));
    if (unknown.length) {
      throw new Error(
        `rubric.json: dimension "${d.key}" has unknown surface(s): ${unknown.join(", ")} — expected: ${KNOWN_SURFACES.join(", ")}`,
      );
    }
  }
}

// Judged-dimension counts per surface: hiring judges all 8, teams judges the
// 5 collectible under source-free passive capture (see dimensionsForSurface).
// If a rubric.json edit accidentally drops a surface from a dimension, this
// throws at import time instead of silently returning fewer rows.
const EXPECTED_SURFACE_DIMENSION_COUNTS: Record<RubricSurface, number> = {
  hiring: 8,
  teams: 5,
};

function assertSurfaceDimensionCounts(
  dimensions: readonly RubricDimension[],
): void {
  for (const [surface, expected] of Object.entries(
    EXPECTED_SURFACE_DIMENSION_COUNTS,
  ) as [RubricSurface, number][]) {
    const actual = dimensions.filter((d) => d.surfaces.includes(surface)).length;
    if (actual !== expected) {
      throw new Error(
        `rubric.json: expected ${expected} dimension(s) for surface "${surface}", got ${actual}`,
      );
    }
  }
}

function validateRubric(r: RubricArtifact): RubricArtifact {
  assertCompleteKeySet("tier", r.tiers.map((t) => t.key), EXPECTED_TIER_KEYS);
  assertCompleteKeySet(
    "dimension",
    r.dimensions.map((d) => d.key),
    EXPECTED_DIMENSION_KEYS,
  );
  assertValidSurfaces(r.dimensions);
  assertSurfaceDimensionCounts(r.dimensions);
  return r;
}

// rubric.json is the single source of truth for the rubric data. TS infers
// `string` (not the literal unions) for JSON properties, so we assert the
// contract once here; validateRubric() then proves the key sets are complete
// before any loader casts them to a complete Record.
export const rubric = validateRubric(rubricRaw as unknown as RubricArtifact);

/** The dimensions judged on a product surface, in catalog order. All eight
 *  dimensions ship in rubric.json; `surfaces` is judging metadata, not
 *  removal — hiring judges all 8, teams judges the 5 whose constructs and
 *  evidence exist under source-free passive capture. */
export function dimensionsForSurface(surface: RubricSurface): RubricDimension[] {
  return rubric.dimensions.filter((d) => d.surfaces.includes(surface));
}

// ---------------------------------------------------------------------------
// Role-based rubric templates (templates.json).
//
// Templates are presets over a surface's judged dimensions — which dimensions
// count and how much. This package only ships the data; APPLYING a template is
// a consumer concern (in the teams product it maps to PUT /v1/rubric/overrides).
// ---------------------------------------------------------------------------

// The template keys templates.json must ship, exactly. Same rationale as
// EXPECTED_TIER_KEYS: consumers cast lookups by key to a complete Record, so a
// missing or duplicated key must fail loudly at import time, not at render.
// Record<RubricTemplateKey, true> is exhaustive: TypeScript errors here if
// RubricTemplateKey gains a member without a matching entry — same pattern as
// SURFACE_EXHAUSTIVENESS.
const TEMPLATE_EXHAUSTIVENESS: Record<RubricTemplateKey, true> = {
  engineer: true,
  product_manager: true,
};
const EXPECTED_TEMPLATE_KEYS = Object.keys(
  TEMPLATE_EXHAUSTIVENESS,
) as readonly RubricTemplateKey[];

function validateTemplates(raw: {
  schemaVersion: number;
  templates: RubricTemplate[];
}): RubricTemplate[] {
  assertCompleteKeySet(
    "template",
    raw.templates.map((t) => t.key),
    EXPECTED_TEMPLATE_KEYS,
    "templates.json",
  );
  for (const t of raw.templates) {
    // (e) Surface must be known — reuse KNOWN_SURFACES so a RubricSurface
    // rename can't leave a template pointing at a surface that no longer
    // exists (templatesForSurface would silently return []).
    if (!KNOWN_SURFACES.includes(t.surface)) {
      throw new Error(
        `templates.json: template "${t.key}" has unknown surface "${t.surface}" — expected: ${KNOWN_SURFACES.join(", ")}`,
      );
    }
    // (b) Each template must cover its surface's judged dimensions exactly —
    // reuse dimensionsForSurface() so templates.json can't drift from
    // rubric.json (a dimension added to or dropped from the surface throws
    // here until the template is updated to match).
    assertCompleteKeySet(
      `template "${t.key}" dimension`,
      t.dimensions.map((d) => d.key),
      dimensionsForSurface(t.surface).map((d) => d.key),
      "templates.json",
    );
    const orders = new Set<number>();
    for (const d of t.dimensions) {
      // (c) Weights are integer percentages.
      if (!Number.isInteger(d.weight) || d.weight < 0 || d.weight > 100) {
        throw new Error(
          `templates.json: template "${t.key}" dimension "${d.key}" has invalid weight ${d.weight} — must be an integer 0–100`,
        );
      }
      // (d) displayOrder values are unique non-negative integers.
      if (!Number.isInteger(d.displayOrder) || d.displayOrder < 0) {
        throw new Error(
          `templates.json: template "${t.key}" dimension "${d.key}" has invalid displayOrder ${d.displayOrder} — must be an integer >= 0`,
        );
      }
      if (orders.has(d.displayOrder)) {
        throw new Error(
          `templates.json: template "${t.key}" has duplicate displayOrder ${d.displayOrder} (dimension "${d.key}")`,
        );
      }
      orders.add(d.displayOrder);
    }
    // Weights sum to exactly 100 across ALL dimensions — disabled ones
    // included, since a disabled dimension's weight is its preserved
    // "would-be" emphasis (see RubricTemplateDimension.weight). Consumers
    // scoring over the enabled subset renormalize; this invariant keeps the
    // stored emphases coherent as a whole.
    const totalWeight = t.dimensions.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight !== 100) {
      throw new Error(
        `templates.json: template "${t.key}" weights must sum to 100 across all dimensions (enabled + disabled) — got ${totalWeight}`,
      );
    }
  }
  return raw.templates;
}

// templates.json is the single source of truth for the template data. Same TS
// caveat as rubric.json: JSON imports infer `string`, so we assert the contract
// once here after validateTemplates() proves it holds.
export const rubricTemplates: RubricTemplate[] = validateTemplates(
  templatesRaw as unknown as { schemaVersion: number; templates: RubricTemplate[] },
);

/** Alias for consumers that import by the vendored-module name (the teams
 *  app's vendored copy exports RUBRIC_TEMPLATES; Phase C re-exports this). */
export const RUBRIC_TEMPLATES = rubricTemplates;

/** The templates that preset a product surface's judged dimensions. */
export function templatesForSurface(surface: RubricSurface): RubricTemplate[] {
  return rubricTemplates.filter((t) => t.surface === surface);
}

export * from "./types";
