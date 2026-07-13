#!/usr/bin/env node
// Render the current rubric state from src/rubric.json into the README, between
// the <!-- RUBRIC:START --> / <!-- RUBRIC:END --> markers. rubric.json is the
// single source of truth; this section is generated so it can never drift.
//
//   node scripts/render-readme.mjs           # regenerate the block in place
//   node scripts/render-readme.mjs --check   # fail (exit 1) if the block is stale
//
// CI runs --check, so a rubric edit that forgets to regenerate the README fails.

import { readFileSync, writeFileSync } from "node:fs";

const rubricUrl = new URL("../src/rubric.json", import.meta.url);
const readmeUrl = new URL("../README.md", import.meta.url);

const rubric = JSON.parse(readFileSync(rubricUrl, "utf8"));

const START = "<!-- RUBRIC:START -->";
const END = "<!-- RUBRIC:END -->";

const PHASE_EMOJI = {
  discovery: "🧭",
  implementation: "⚙️",
  verification: "✅",
  cross_cutting: "🔁",
};

// Emoji per graded/neutral level, keyed by tier — mirrors the tier colors.
const TIER_EMOJI = {
  strong: "🟩",
  adequate: "🟨",
  developing: "🟥",
  insufficient_evidence: "⚪",
  not_collectible: "⚪",
};

// Escape the pipe so free text never breaks a markdown table cell.
const cell = (s) => String(s).replace(/\|/g, "\\|");

const sourceLinks = (sources) =>
  sources.map((s) => `[${s.name}](${s.url})`).join(" · ");

const RELIABILITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

function renderDimension(d) {
  const surfaces = d.surfaces.map((s) => `\`${s}\``).join(" · ");
  const reliability = RELIABILITY_LABEL[d.reliabilityTier] ?? d.reliabilityTier;
  const lines = [];
  lines.push(`#### ${d.label}`);
  lines.push("");
  lines.push(`_Judged on: ${surfaces} · Reliability: ${reliability}_`);
  lines.push("");
  lines.push(d.measures);
  lines.push("");
  lines.push("| Level | Anchor |");
  lines.push("| --- | --- |");
  lines.push(`| ${TIER_EMOJI.developing} **Developing** | ${cell(d.anchors.developing)} |`);
  lines.push(`| ${TIER_EMOJI.adequate} **Adequate** | ${cell(d.anchors.adequate)} |`);
  lines.push(`| ${TIER_EMOJI.strong} **Strong** | ${cell(d.anchors.strong)} |`);
  lines.push("");
  lines.push("| Sub-facet | What it reads | Strong looks like |");
  lines.push("| --- | --- | --- |");
  for (const sf of d.subFacets) {
    const tags = [];
    if (sf.beta) tags.push("_(beta)_");
    if (sf.scoring === "positive_only") tags.push("_(positive-only)_");
    const label = [`**${sf.label}**`, ...tags].join(" ");
    lines.push(`| ${label} | ${cell(sf.signal)} | ${cell(sf.anchors.strong)} |`);
  }
  lines.push("");
  lines.push(`**Grounded in:** ${sourceLinks(d.sources)}`);
  lines.push("");
  lines.push("<details><summary>Why this dimension matters</summary>");
  lines.push("");
  lines.push(d.detail);
  lines.push("");
  lines.push("</details>");
  return lines.join("\n");
}

function render() {
  const out = [];
  out.push(
    "<!-- Auto-generated from src/rubric.json by scripts/render-readme.mjs — do not edit by hand; run `npm run render`. -->",
  );
  out.push("");
  out.push("## The rubric");
  out.push("");
  const subFacetCount = rubric.dimensions.reduce(
    (n, d) => n + d.subFacets.length,
    0,
  );
  out.push(
    `**${rubric.dimensions.length} process dimensions (${subFacetCount} sub-facets) across ${rubric.phases.length} phases.** Each dimension is graded ${TIER_EMOJI.developing} Developing → ${TIER_EMOJI.adequate} Adequate → ${TIER_EMOJI.strong} Strong against the behavioral anchors below — the sub-facet is the unit of coaching — and points at the published sources it's grounded in.`,
  );
  out.push("");

  for (const phase of rubric.phases) {
    const dims = rubric.dimensions.filter((d) => d.phase === phase.key);
    if (dims.length === 0) continue;
    const emoji = PHASE_EMOJI[phase.key] ?? "";
    out.push(`### ${emoji} ${phase.label}`);
    out.push("");
    out.push(`_${phase.blurb}_`);
    out.push("");
    out.push(dims.map(renderDimension).join("\n\n"));
    out.push("");
  }

  // Tiers
  out.push("### Tiers");
  out.push("");
  out.push(
    "Five tiers, and two of them are explicitly **not** \"did poorly\":",
  );
  out.push("");
  out.push("| Tier | Meaning |");
  out.push("| --- | --- |");
  for (const t of rubric.tiers) {
    out.push(`| ${TIER_EMOJI[t.key] ?? ""} **${t.label}** | ${cell(t.help)} |`);
  }
  out.push("");

  // Methodology & sources
  out.push("### Methodology & sources");
  out.push("");
  out.push(rubric.methodologySummary);
  out.push("");
  for (const g of rubric.methodologyGroups) {
    const items = g.sources
      .map((s) => `[${s.name}](${s.url})`)
      .join(" · ");
    out.push(`**${g.label}** — ${items}`);
    out.push("");
  }

  return out.join("\n").trimEnd();
}

const readme = readFileSync(readmeUrl, "utf8");
const startIdx = readme.indexOf(START);
const endIdx = readme.indexOf(END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error(
    `README.md is missing the ${START} … ${END} markers — cannot render.`,
  );
  process.exit(1);
}

const before = readme.slice(0, startIdx + START.length);
const after = readme.slice(endIdx);
const next = `${before}\n\n${render()}\n\n${after}`;

if (process.argv.includes("--check")) {
  if (next !== readme) {
    console.error(
      "README rubric section is STALE. Run `npm run render` and commit the result.",
    );
    process.exit(1);
  }
  console.log("README rubric section is in sync with rubric.json.");
} else {
  writeFileSync(readmeUrl, next);
  console.log("Rendered rubric section into README.md.");
}
