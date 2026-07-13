import rubricRaw from "./rubric.json";
import templatesRaw from "./templates.json";
import type {
  RubricArtifact,
  RubricDimension,
  RubricReliabilityTier,
  RubricSubFacet,
  RubricSurface,
  RubricTemplate,
  RubricTemplateKey,
  RubricTier,
} from "./types";

// ---------------------------------------------------------------------------
// Import-time validation.
//
// rubric.json is the SINGLE file a contributor edits to change the rubric, and
// this validator is what keeps a malformed edit from loading silently. It
// deliberately does NOT hardcode the set of dimensions — dimensions are open by
// design so the community can extend "what makes a good AI-tools user" without
// editing types, schema, and guards in lockstep.
//
// What stays strict is the fixed scaffolding: the five tier keys (they drive UI
// color + ordering), the known surfaces, and the enum-valued fields. Everything
// dimension-shaped is validated STRUCTURALLY — well-formed, internally
// consistent, no duplicate keys — not against an allow-list.
//
// tsc does not run this (rubric.json is cast past its type); `npm run validate`
// and any runtime import execute it.
// ---------------------------------------------------------------------------

// The five tiers are a fixed contract, not community-extensible: downstream
// loaders cast Object.fromEntries(rubric.tiers) to a complete Record<RubricTier,
// …>, so a missing or duplicated tier key would make callers read `undefined`
// (NaN ordering, blank labels). This stays an exact allow-list.
const EXPECTED_TIER_KEYS: readonly RubricTier[] = [
  "strong",
  "adequate",
  "developing",
  "insufficient_evidence",
  "not_collectible",
];

const KNOWN_RELIABILITY_TIERS: readonly RubricReliabilityTier[] = [
  "high",
  "medium",
  "low",
];

const KNOWN_SCORING_MODES = ["graded", "positive_only"] as const;

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

// Structural validation for the open-ended dimension set. No hardcoded key
// list — a contributor adds a dimension to rubric.json and nothing here changes.
// We check only that each dimension is well-formed and internally consistent:
// unique dimension keys, a known reliability tier, and a non-empty set of
// well-formed sub-facets (the unit of coaching; consumers key feedback lookups
// by (dimension, subFacet), so a dupe or an empty set would collide or drop a
// coaching row).
function assertDimensions(dimensions: readonly RubricDimension[]): void {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    throw new Error("rubric.json: dimensions must be a non-empty array");
  }
  const keys = dimensions.map((d) => d.key);
  // actual === expected: completeness is a no-op, but duplicate detection runs.
  assertCompleteKeySet("dimension", keys, keys);
  for (const d of dimensions) {
    if (!KNOWN_RELIABILITY_TIERS.includes(d.reliabilityTier)) {
      throw new Error(
        `rubric.json: dimension "${d.key}" has unknown reliabilityTier "${d.reliabilityTier}" — expected: ${KNOWN_RELIABILITY_TIERS.join(", ")}`,
      );
    }
    if (!Array.isArray(d.subFacets) || d.subFacets.length === 0) {
      throw new Error(
        `rubric.json: dimension "${d.key}" must declare a non-empty subFacets array`,
      );
    }
    // Array.isArray() widens the narrowed binding to any[]; re-assert the type.
    const subFacets = d.subFacets as readonly RubricSubFacet[];
    const sfKeys = subFacets.map((s) => s.key);
    assertCompleteKeySet(`dimension "${d.key}" sub-facet`, sfKeys, sfKeys);
    for (const sf of subFacets) {
      if (!KNOWN_RELIABILITY_TIERS.includes(sf.reliabilityTier)) {
        throw new Error(
          `rubric.json: sub-facet "${d.key}.${sf.key}" has unknown reliabilityTier "${sf.reliabilityTier}" — expected: ${KNOWN_RELIABILITY_TIERS.join(", ")}`,
        );
      }
      if (
        sf.scoring !== undefined &&
        !KNOWN_SCORING_MODES.includes(sf.scoring)
      ) {
        throw new Error(
          `rubric.json: sub-facet "${d.key}.${sf.key}" has unknown scoring "${sf.scoring}" — expected: ${KNOWN_SCORING_MODES.join(", ")}`,
        );
      }
    }
  }
}

function validateRubric(r: RubricArtifact): RubricArtifact {
  assertCompleteKeySet("tier", r.tiers.map((t) => t.key), EXPECTED_TIER_KEYS);
  assertValidSurfaces(r.dimensions);
  assertDimensions(r.dimensions);
  return r;
}

// rubric.json is the single source of truth for the rubric data. TS infers
// `string` (not literal unions) for JSON properties, so we assert the contract
// once here; validateRubric() then proves the data is well-formed before any
// loader consumes it.
export const rubric = validateRubric(rubricRaw as unknown as RubricArtifact);

/** The dimensions judged on a product surface, in catalog order. `surfaces` is
 *  judging metadata, not removal — a dimension omitted from a surface simply
 *  isn't judged there. */
export function dimensionsForSurface(surface: RubricSurface): RubricDimension[] {
  return rubric.dimensions.filter((d) => d.surfaces.includes(surface));
}

// ---------------------------------------------------------------------------
// Role-based rubric templates (templates.json).
//
// Templates are presets over a surface's judged dimensions — which dimensions
// count and how much. This package only ships the data; APPLYING a template is
// a consumer concern (in the teams product it maps to PUT /v1/rubric/overrides).
//
// Templates are tolerant of the open dimension set: a template lists only the
// dimensions it weights, may reference only KNOWN dimension keys, and need not
// cover every dimension (an omitted one is treated as disabled). Adding a
// dimension to rubric.json therefore does NOT force an edit to every template.
// ---------------------------------------------------------------------------

// The template keys templates.json ships. Templates are curated presets, not
// the community's primary contribution surface (that's dimensions), so this
// stays an exact allow-list. Record<RubricTemplateKey, true> is exhaustive:
// TypeScript errors here if RubricTemplateKey gains a member without an entry.
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
  const knownDimensionKeys = new Set(rubric.dimensions.map((d) => d.key));
  for (const t of raw.templates) {
    // Surface must be known — reuse KNOWN_SURFACES so a RubricSurface rename
    // can't leave a template pointing at a surface that no longer exists.
    if (!KNOWN_SURFACES.includes(t.surface)) {
      throw new Error(
        `templates.json: template "${t.key}" has unknown surface "${t.surface}" — expected: ${KNOWN_SURFACES.join(", ")}`,
      );
    }
    // Dimension keys must be unique within the template and reference dimensions
    // that exist. A template need NOT list every dimension — omitted ones are
    // treated as disabled — so this rejects unknown/duplicate keys but not gaps.
    const tKeys = t.dimensions.map((d) => d.key);
    assertCompleteKeySet(
      `template "${t.key}" dimension`,
      tKeys,
      tKeys,
      "templates.json",
    );
    const unknown = tKeys.filter((k) => !knownDimensionKeys.has(k));
    if (unknown.length) {
      throw new Error(
        `templates.json: template "${t.key}" references unknown dimension(s): ${unknown.join(", ")} — not present in rubric.json`,
      );
    }
    const orders = new Set<number>();
    for (const d of t.dimensions) {
      // Weight is relative emphasis, an integer 0–100 (consumers renormalize
      // over the enabled subset — there is no sum-to-100 requirement).
      if (!Number.isInteger(d.weight) || d.weight < 0 || d.weight > 100) {
        throw new Error(
          `templates.json: template "${t.key}" dimension "${d.key}" has invalid weight ${d.weight} — must be an integer 0–100`,
        );
      }
      // displayOrder values are unique non-negative integers.
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
