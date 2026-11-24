#!/usr/bin/env node
/**
 * Naturalness scanner for onboarding pages. Language-neutral by design: no
 * word lists — sentences and words come from Intl.Segmenter, so a page in
 * any language gets the same checks.
 *
 * It measures; it never decides. The onboard-judge agent reads the --text
 * output and this report, and proposes what to rewrite.
 *
 * Usage:
 *   node naturalness.mjs <page.html> [--lang=xx] [--text=out.txt]
 *        [--json=out.json] [--baseline=prev.json] [--protect=before.html]
 *
 *   --text      plain text for the judge: one block per line, tagged with
 *               its kind, UI strings wrapped in ⟦ ⟧
 *   --baseline  a previous --json of the same page: prints before → after
 *   --protect   the HTML before a rewrite: fails (exit 1) when a UI string
 *               or a number from it is gone or a new one appeared
 */

import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(3).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  }),
);
const src = process.argv[2];
if (!src || src.startsWith("--")) {
  console.error("Usage: node naturalness.mjs <page.html> [--lang=xx] [--text=f] [--json=f] [--baseline=f] [--protect=f]");
  process.exit(2);
}

// ---------- HTML → blocks ----------

const VOID = new Set(["img", "br", "hr", "meta", "link", "input", "source", "wbr", "col", "area"]);
const SKIP_TAGS = new Set(["style", "script", "svg", "head", "title", "nav", "noscript", "template", "footer"]);
const LABEL_CLS = ["fact", "role-tag", "pill", "actor", "kicker", "sec-num", "bar", "who", "row-title", "t", "d", "dot", "ar", "toc-title"];
const PROSE_TAGS = new Set(["p", "li", "figcaption", "td", "th", "dd", "dt", "blockquote"]);
const PROSE_CLS = ["callout", "note", "panel-intro", "sub", "lead"];
const PROTECT_CLS = ["ui", "ui-text"];
const PROTECT_TAGS = new Set(["code", "kbd"]);
const INLINE = new Set(["a", "b", "strong", "em", "i", "u", "span", "sup", "sub", "mark", "abbr", "q", "s", "br", "time", "label", "code", "kbd"]);

const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", mdash: "—", ndash: "–", laquo: "«", raquo: "»", hellip: "…", rarr: "→", larr: "←", middot: "·", bull: "•", thinsp: " ", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m,
  );

function parse(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<![^>]*>|<\?[^>]*>/g, "");
  const root = { tag: "#root", cls: [], children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|</g;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined || m[0] === "<") {
      top.children.push({ text: decode(m[4] ?? "<") });
      continue;
    }
    const [, close, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    if (SKIP_TAGS.has(tag) && !attrs.endsWith("/")) {
      const end = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : html.indexOf(">", end) + 1;
      continue;
    }
    const cls = (attrs.match(/class\s*=\s*"([^"]*)"/)?.[1] ?? "").split(/\s+/).filter(Boolean);
    const node = { tag, cls, attrs, children: [] };
    top.children.push(node);
    if (!VOID.has(tag) && !attrs.endsWith("/")) stack.push(node);
  }
  return root;
}

const textOf = (n) => (n.text !== undefined ? n.text : n.children.map(textOf).join(""));
const has = (n, list) => n.cls?.some((c) => list.includes(c));

function blocksOf(root) {
  const blocks = [];
  let section = "";
  const open = (kind, sub, node) => {
    const b = { kind, sub, section, parts: [], direct: node?.parentTag === "section" };
    const first = node?.children.find((c) => c.text === undefined || c.text.trim());
    if (first && (first.tag === "b" || first.tag === "strong")) b.lead = textOf(first).trim();
    blocks.push(b);
    return b;
  };
  function walk(node, block, parentTag) {
    if (node.text !== undefined) {
      if (!node.text.trim()) {
        block?.parts.push(" ");
        return;
      }
      (block ?? open("prose", "loose")).parts.push(node.text);
      return;
    }
    node.parentTag = parentTag;
    if (has(node, ["toc"])) return;
    if (node.tag === "section") section = (node.attrs.match(/id\s*=\s*"([^"]*)"/)?.[1] ?? "");
    if (node.tag === "img") {
      const alt = (node.attrs.match(/alt\s*=\s*"([^"]*)"/)?.[1] ?? "");
      if (alt) open("alt", "img").parts.push(decode(alt));
      return;
    }
    if (has(node, PROTECT_CLS) || PROTECT_TAGS.has(node.tag)) {
      (block ?? open("prose", "loose")).parts.push({ protect: textOf(node).replace(/\s+/g, " ").trim() });
      return;
    }
    let own = block;
    if (/^h[1-6]$/.test(node.tag)) own = open("heading", node.tag, node);
    else if (has(node, LABEL_CLS) || node.tag === "button" || (node.tag === "small" && parentTag !== "div-fbody"))
      own = open("label", node.cls[0] || node.tag, node);
    else if (has(node, PROSE_CLS) || PROSE_TAGS.has(node.tag))
      own = open("prose", PROSE_CLS.find((c) => node.cls.includes(c)) || { figcaption: "caption", td: "cell", th: "cell" }[node.tag] || node.tag, node);
    else if (!block && node.tag !== "#root" && node.children.some((c) => c.text?.trim())) own = open("prose", "loose", node);
    const tagKey = node.tag === "div" && node.cls.includes("fbody") ? "div-fbody" : node.tag;
    const loose = own && own !== block && own.sub === "loose";
    for (const c of node.children) walk(c, loose && c.text === undefined && !INLINE.has(c.tag) ? null : own, tagKey);
  }
  walk(root, null, "");
  for (const b of blocks) {
    b.text = b.parts.map((p) => (typeof p === "string" ? p : `⟦${p.protect}⟧`)).join("").replace(/\s+/g, " ").trim();
    b.metricText = b.parts.map((p) => (typeof p === "string" ? p : " uistr ")).join("").replace(/\s+/g, " ").trim();
    b.protects = b.parts.filter((p) => typeof p !== "string").map((p) => p.protect);
  }
  return blocks.filter((b) => b.text);
}

// ---------- language-neutral text tools ----------

// the page language comes from --lang or <html lang>; "und" (undetermined) still
// segments correctly, so no script guessing
const pageLang = (html) => (html.match(/<html[^>]*\slang\s*=\s*"([^"]+)"/i) || [])[1];

let sentSeg, wordSeg;
const sentences = (t) => [...sentSeg.segment(t)].map((s) => s.segment.trim()).filter((s) => /\p{L}/u.test(s));
const words = (t) => [...wordSeg.segment(t)].filter((w) => w.isWordLike).map((w) => w.segment.toLowerCase());

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const cv = (a) => {
  const m = mean(a);
  return a.length > 1 && m ? Math.sqrt(mean(a.map((x) => (x - m) ** 2))) / m : 0;
};
function mtld(tokens, threshold = 0.72) {
  const pass = (toks) => {
    let factors = 0, types = new Set(), count = 0;
    for (const t of toks) {
      count++;
      types.add(t);
      if (types.size / count <= threshold) {
        factors++;
        types = new Set();
        count = 0;
      }
    }
    if (count) factors += (1 - types.size / count) / (1 - threshold);
    return factors ? toks.length / factors : toks.length;
  };
  return (pass(tokens) + pass([...tokens].reverse())) / 2;
}
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- main ----------

const html = readFileSync(src, "utf8");
const blocks = blocksOf(parse(html));
const lang = args.lang || pageLang(html) || "und";
sentSeg = new Intl.Segmenter(lang, { granularity: "sentence" });
wordSeg = new Intl.Segmenter(lang, { granularity: "word" });

const prose = blocks.filter((b) => b.kind === "prose");
const proseText = prose.map((b) => b.metricText);
const sents = proseText.flatMap(sentences);
const sentLens = sents.map((s) => words(s).length).filter((n) => n > 0);
const allWords = proseText.flatMap(words);
const contentWords = allWords.filter((w) => w !== "uistr");
const blockLens = prose.map((b) => words(b.metricText).length).filter((n) => n > 2);
const labelWords = blocks.filter((b) => b.kind !== "prose").flatMap((b) => words(b.metricText)).length;

// repeated 3-grams within sentences
const grams = new Map();
for (const s of sents) {
  const w = words(s);
  for (let i = 0; i + 3 <= w.length; i++) {
    const g = w.slice(i, i + 3);
    if (g.includes("uistr")) continue;
    const k = g.join(" ");
    grams.set(k, (grams.get(k) || 0) + 1);
  }
}
const repeats = [...grams].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 10);

// sentence openers; words under 4 letters (articles, prepositions) open sentences in any language
const openers = new Map();
for (const s of sents) {
  const w = words(s)[0];
  if (w && w !== "uistr" && [...w].length >= 4) openers.set(w, (openers.get(w) || 0) + 1);
}
const topOpeners = [...openers].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 6);

const per100 = (re) => r1(((proseText.join(" ").match(re) || []).length * 100) / Math.max(1, allWords.length));

// structure checks (the skill's own rules)
const structure = [];
for (const b of prose) {
  const n = sentences(b.metricText).length - (b.lead && /[.!?]$/.test(b.lead) ? 1 : 0);
  if (b.sub === "callout" && n > 2) structure.push({ rule: "callout over 2 sentences", n, text: b.text });
  if (b.sub === "caption" && n > 1) structure.push({ rule: "caption over 1 sentence", n, text: b.text });
}
const bySection = new Map();
for (const b of prose.filter((b) => b.direct && (b.sub === "p" || b.sub === "loose"))) bySection.set(b.section, (bySection.get(b.section) || 0) + 1);
for (const [sec, n] of bySection) if (n > 1) structure.push({ rule: "more than one loose paragraph in a section", n, text: `#${sec}` });
for (const b of blocks.filter((b) => b.kind === "heading")) {
  if (/\?\s*$/.test(b.text)) structure.push({ rule: "question heading", text: b.text });
  const ws = b.text.split(/\s+/).filter((w) => /^\p{Script=Latin}{4,}/u.test(w));
  if (ws.length >= 3 && ws.every((w) => /^\p{Lu}/u.test(w))) structure.push({ rule: "Title Case heading", text: b.text });
}
const inlineStyles = (html.match(/<[a-z][^>]*\sstyle\s*=/gi) || []).length;
if (inlineStyles) structure.push({ rule: "inline style attributes", n: inlineStyles, text: "" });
const emoji = blocks.filter((b) => /\p{Extended_Pictographic}/u.test(b.text)).map((b) => b.text);
for (const t of emoji) structure.push({ rule: "emoji in text", text: t });

for (const b of prose.filter((b) => /!/.test(b.metricText))) structure.push({ rule: "exclamation mark in prose", text: b.text });

const metrics = {
  lang,
  proseWords: allWords.length,
  labelWords,
  proseShare: r2(allWords.length / Math.max(1, allWords.length + labelWords)),
  sentences: sentLens.length,
  sentenceMean: r1(mean(sentLens)),
  sentenceCV: r2(cv(sentLens)),
  blockCV: r2(cv(blockLens)),
  lix: Math.round(mean(sentLens) + (100 * contentWords.filter((w) => [...w].length > 6).length) / Math.max(1, contentWords.length)),
  mtld: Math.round(mtld(contentWords)),
  topOpenerShare: r2((topOpeners[0]?.[1] || 0) / Math.max(1, sents.length)),
  dashPer100: per100(/\s[—–]\s/g),
  colonPer100: per100(/:/g),
  repeated3grams: repeats.length,
  structureIssues: structure.length,
};

// ---------- report ----------

const out = [];
const warn = (cond) => (cond ? " ⚠" : "");
out.push(`Naturalness — ${src.split("/").pop()} (lang: ${lang})`);
out.push(`Prose ${metrics.proseWords} words in ${metrics.sentences} sentences · labels ${metrics.labelWords} words · prose share ${metrics.proseShare}`);
out.push(`Rhythm: sentence length mean ${metrics.sentenceMean}, CV ${metrics.sentenceCV}${warn(metrics.sentenceCV < 0.35)} (uniform below ~0.35) · block length CV ${metrics.blockCV}${warn(metrics.blockCV < 0.35)}`);
out.push(`Density: LIX ${metrics.lix} · MTLD ${metrics.mtld} (compare with earlier versions of the same page, not across languages)`);
out.push(`Per 100 words: dash ${metrics.dashPer100} · colon ${metrics.colonPer100}`);
if (topOpeners.length) out.push(`Sentence openers: ${topOpeners.map(([w, n]) => `${w} ×${n}`).join(", ")}${warn(metrics.topOpenerShare > 0.1 && sents.length >= 20)}`);
if (repeats.length) out.push(`Repeated 3-grams: ${repeats.map(([g, n]) => `"${g}" ×${n}`).join(", ")}`);
out.push("", "Longest sentences:");
for (const s of [...sents].sort((a, b) => words(b).length - words(a).length).slice(0, 5)) out.push(`  [${words(s).length}] ${s.replace(/uistr/g, "⟦…⟧")}`);
if (structure.length) {
  out.push("", "Structure:");
  for (const s of structure) out.push(`  ${s.rule}${s.n ? ` (${s.n})` : ""}${s.text ? `: ${s.text.slice(0, 160)}` : ""}`);
}
if (args.baseline) {
  const prev = JSON.parse(readFileSync(args.baseline, "utf8")).metrics;
  out.push("", "Against baseline:");
  for (const k of Object.keys(metrics)) if (typeof metrics[k] === "number" && prev[k] !== undefined && prev[k] !== metrics[k]) out.push(`  ${k}: ${prev[k]} → ${metrics[k]}`);
}

let failed = false;
if (args.protect) {
  const tokens = (bs) => {
    const m = new Map();
    const add = (k) => m.set(k, (m.get(k) || 0) + 1);
    for (const b of bs) {
      b.protects.forEach((p) => add(`UI ${p}`));
      (b.metricText.match(/\d+(?:[.,]\d+)?%?/g) || []).forEach((n) => add(`# ${n}`));
    }
    return m;
  };
  const before = tokens(blocksOf(parse(readFileSync(args.protect, "utf8"))));
  const after = tokens(blocks);
  const diff = [];
  for (const [k, n] of before) if ((after.get(k) || 0) < n) diff.push(`lost ${k}`);
  for (const [k, n] of after) if ((before.get(k) || 0) < n) diff.push(`added ${k}`);
  out.push("", diff.length ? "Protected tokens CHANGED:" : "Protected tokens: unchanged (UI strings and numbers)");
  for (const d of diff) out.push(`  ${d}`);
  failed = diff.length > 0;
}

console.log(out.join("\n"));

if (args.text) {
  let sec = null;
  const lines = [];
  for (const b of blocks) {
    if (b.section !== sec) {
      sec = b.section;
      lines.push("", `=== #${sec || "hero"}`);
    }
    lines.push(`[${b.kind === "prose" ? b.sub : b.kind}] ${b.text}`);
  }
  writeFileSync(args.text, lines.join("\n").trim() + "\n");
}
if (args.json) writeFileSync(args.json, JSON.stringify({ metrics, structure }, null, 2));
process.exit(failed ? 1 : 0);
