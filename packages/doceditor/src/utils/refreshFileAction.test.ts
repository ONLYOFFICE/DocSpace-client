// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import { getRefreshFileAction } from "./refreshFileAction";

describe("getRefreshFileAction", () => {
  // the server opens a form for filling with editorConfig.mode "edit", and
  // sending edit=true on refresh took the form off filling
  it("sends no action when the page was opened without one in edit mode", () => {
    expect(getRefreshFileAction(null, "edit")).toBeUndefined();
  });

  it("keeps view mode when the page was opened without an action", () => {
    expect(getRefreshFileAction(null, "view")).toBe("view");
  });

  it("sends no action when the editor mode is unknown", () => {
    expect(getRefreshFileAction(null, undefined)).toBeUndefined();
  });

  it.each(["edit", "fill", "view"] as const)(
    "keeps the %s action of the page",
    (action) => {
      expect(getRefreshFileAction(action, "edit")).toBe(action);
    },
  );

  it("prefers the page action over the editor mode", () => {
    expect(getRefreshFileAction("edit", "view")).toBe("edit");
  });

  it.each(["toString", "constructor", "create", ""])(
    "ignores the unknown action %j",
    (action) => {
      expect(getRefreshFileAction(action, "edit")).toBeUndefined();
      expect(getRefreshFileAction(action, "view")).toBe("view");
    },
  );
});
