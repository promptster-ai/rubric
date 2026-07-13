#!/usr/bin/env node
// Contributor-facing rubric validator. Executes the same import-time validator
// that ships in src/index.ts (run via tsx so it resolves the .ts + JSON
// imports), then prints a one-line summary. Run: `npm run validate`.
//
// Why a dedicated step: `tsc --noEmit` only TYPE-checks, and rubric.json is cast
// past its type — so the runtime structural validation in index.ts is the guard
// that actually catches a malformed edit. This is how it gets executed, in CI
// and locally. A validation failure throws here and exits non-zero.

import { rubric, rubricTemplates } from "../src/index.ts";

const subFacets = rubric.dimensions.reduce((n, d) => n + d.subFacets.length, 0);
console.log(
  `✓ rubric valid — ${rubric.dimensions.length} dimension(s), ${subFacets} sub-facet(s), ${rubric.bands.length} band(s), ${rubricTemplates.length} template(s)`,
);
