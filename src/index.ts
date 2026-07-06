import rubricRaw from "./rubric.json";
import type {
  FluencyDimensionKey,
  RubricArtifact,
  RubricDimension,
  RubricSurface,
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
): void {
  const seen = new Set(actual);
  if (seen.size !== actual.length) {
    const dupes = actual.filter((k, i) => actual.indexOf(k) !== i);
    throw new Error(
      `rubric.json: duplicate ${collection} key(s): ${[...new Set(dupes)].join(", ")}`,
    );
  }
  const missing = expected.filter((k) => !seen.has(k));
  const extra = actual.filter((k) => !expected.includes(k));
  if (missing.length || extra.length) {
    throw new Error(
      `rubric.json: ${collection} key set is incomplete` +
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

export * from "./types";
