

import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const html = fs.readFileSync(
  path.join(import.meta.dirname, "../../index.html"),
  "utf8",
);

/** The first script of the head, as the page runs it before any other. */
const policyScript = () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const first = head.match(/<script>([\s\S]*?)<\/script>/);
  if (!first) throw new Error("index.html: no inline script in the head");
  return first[1];
};

const run = (pathname: string) => {
  const added: Array<{ httpEquiv?: string; content?: string }> = [];
  const fakeDocument = {
    createElement: () => ({}),
    head: { appendChild: (meta: object) => added.push(meta) },
  };
  // The script of index.html, run as the page runs it.
  new Function("window", "document", policyScript())(
    { location: { pathname } },
    fakeDocument,
  );
  return added;
};

describe("the policy of the page of a link of a private item", () => {
  it("stands before every other script and stylesheet of the page", () => {
    const head = html.slice(0, html.indexOf("</head>"));

    expect(head.indexOf("<script>")).toBeLessThan(head.indexOf("<link"));
    expect(html.indexOf("<script>")).toBeLessThan(html.indexOf("<script src"));
  });

  it("Script from another origin", () => {
    const [meta] = run("/share/private");

    expect(meta.httpEquiv).toBe("Content-Security-Policy");
    const sources = meta
      .content!.replace("%DOCSPACE_DEV_SCRIPT_ORIGIN%", "")
      .replace(/^script-src /, "")
      .split(" ");
    // Nothing but the page's own origin and what the scripts of the portal need.
    expect(sources).toEqual(["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"]);
  });

  it("is given to that page alone", () => {
    expect(run("/rooms/share")).toEqual([]);
    expect(run("/share/preview/9")).toEqual([]);
    expect(run("/share/private/")).toHaveLength(1);
  });
});
