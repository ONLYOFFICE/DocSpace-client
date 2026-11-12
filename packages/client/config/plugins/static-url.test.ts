import { describe, expect, it, vi } from "vitest";
import path from "path";

import { staticUrlPlugin } from "./static-url";
import { rootDir } from "../utils";

type Transform = (
  this: { addWatchFile: (id: string) => void },
  code: string,
) => { code: string } | null;

// Runs the plugin's transform the way the dev server does: `this` is the
// plugin context, whose `addWatchFile` registers a dependency of the module.
const transform = (code: string) => {
  const plugin = staticUrlPlugin();
  const addWatchFile = vi.fn();
  const result = (plugin.transform as unknown as Transform).call(
    { addWatchFile },
    code,
  );
  return { result, addWatchFile };
};

describe("staticUrlPlugin", () => {
  it("rewrites a locale import to its public URL with a content hash", () => {
    const { result } = transform(
      'import CommonenUrl from "PUBLIC_DIR/locales/en/Common.json?url";',
    );
    expect(result?.code).toMatch(
      /^const CommonenUrl = "\/locales\/en\/Common\.json\?hash=[0-9a-f]{32}";$/,
    );
  });

  it("watches the rewritten file, so an edit recomputes the hash", () => {
    const { addWatchFile } = transform(
      'import CommonenUrl from "PUBLIC_DIR/locales/en/Common.json?url";',
    );
    expect(addWatchFile).toHaveBeenCalledWith(
      path.resolve(rootDir, "../../public/locales/en/Common.json"),
    );
  });

  it("leaves a module without ?url imports alone", () => {
    const { result, addWatchFile } = transform('const x = "/locales/en/Common.json";');
    expect(result).toBeNull();
    expect(addWatchFile).not.toHaveBeenCalled();
  });
});
